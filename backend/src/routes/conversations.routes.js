import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET / - Return all conversations
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const where = {
      client: {
        companyId: req.user.companyId
      }
    };

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          updatedAt: 'desc'
        },
        include: {
          client: true,
          channel: true,
          messages: {
            orderBy: {
              timestamp: 'asc', // Mostrar todos en orden cronologico
            }
          },
        },
      }),
      prisma.conversation.count({ where })
    ]);
    
    res.json({
      data: conversations,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});


// GET /:id/messages - Obtener todos los mensajes de una conversacion
router.get('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await prisma.conversation.findFirst({
      where: { id, client: { companyId: req.user.companyId } },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });
    
    if (!conversation) return res.status(404).json({ error: 'Not found' });
    res.json(conversation.messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /:id/messages - Create a new message in a conversation
router.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, direction = 'OUTBOUND' } = req.body;

    // Verify the conversation belongs to the user's company
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        client: {
          companyId: req.user.companyId
        }
      },
      include: {
        client: true,
        channel: true
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found or access denied' });
    }

    // Función auxiliar para extraer el mensaje amigable de error de Meta
    const extractMetaError = (err, platform) => {
      const data = err?.response?.data?.error;
      const code = data?.code;
      const subcode = data?.error_subcode;
      const msg = data?.message || err?.message || 'Error desconocido';

      if (code === 10 || msg.includes('fuera del período permitido') || msg.includes('allowed window') || msg.includes('24 hour')) {
        return `No se puede enviar el mensaje: La política de Meta prohíbe responder fuera de la ventana de 24 horas del último mensaje del cliente. Espera a que el cliente te escriba primero.`;
      }
      if (code === 190 || msg.includes('Session has expired') || msg.includes('token') || code === 401) {
        return `El token de autorización de ${platform} ha expirado o no es válido. Por favor reconecta tu canal en Configuración > Canales.`;
      }
      if (code === 100 && msg.includes('cannot send messages to this id')) {
        return `Destinatario no válido o ID de prueba en ${platform}.`;
      }
      return `Error de ${platform}: ${msg}`;
    };

    // --- ENVIAR EL MENSAJE REAL A FACEBOOK/INSTAGRAM/WHATSAPP ---
    if (conversation.channel.platform === 'FACEBOOK') {
      const pageAccessToken = conversation.channel.credentials;
      const recipientId = conversation.client.externalId;

      try {
        const { default: axios } = await import('axios');
        await axios.post(
          `https://graph.facebook.com/v18.0/${conversation.channel.externalId}/messages`,
          {
            recipient: { id: recipientId },
            message: { text: content },
            messaging_type: 'RESPONSE'
          },
          {
            params: { access_token: pageAccessToken }
          }
        );
        console.log(`Mensaje enviado con éxito a Facebook (Destinatario: ${recipientId})`);
      } catch (metaError) {
        const friendlyError = extractMetaError(metaError, 'Facebook');
        console.error('Error enviando mensaje a Facebook:', metaError?.response?.data || metaError.message);
        return res.status(400).json({ error: friendlyError, raw: metaError?.response?.data });
      }
    } else if (conversation.channel.platform === 'WHATSAPP') {
      const waToken = conversation.channel.credentials;
      const recipientPhone = conversation.client.externalId;
      const phoneId = conversation.channel.externalId;

      try {
        const { default: axios } = await import('axios');
        await axios.post(
          `https://graph.facebook.com/v18.0/${phoneId}/messages`,
          {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhone,
            type: 'text',
            text: { body: content }
          },
          {
            headers: { Authorization: `Bearer ${waToken}` }
          }
        );
        console.log(`Mensaje enviado a WhatsApp (Destinatario: ${recipientPhone})`);
      } catch (waError) {
        const friendlyError = extractMetaError(waError, 'WhatsApp');
        console.error('Error enviando mensaje a WhatsApp:', waError?.response?.data || waError.message);
        return res.status(400).json({ error: friendlyError, raw: waError?.response?.data });
      }
    } else if (conversation.channel.platform === 'INSTAGRAM') {
      // Instagram DMs se envían a través de la Graph API usando el token de la página vinculada
      const pageAccessToken = conversation.channel.credentials;
      const recipientIgId = conversation.client.externalId;

      try {
        const { default: axios } = await import('axios');
        await axios.post(
          `https://graph.facebook.com/v18.0/me/messages`,
          {
            recipient: { id: recipientIgId },
            message: { text: content }
          },
          {
            params: { access_token: pageAccessToken }
          }
        );
        console.log(`Mensaje enviado a Instagram DM (Destinatario: ${recipientIgId})`);
      } catch (igError) {
        const friendlyError = extractMetaError(igError, 'Instagram');
        console.error('Error enviando mensaje a Instagram:', igError?.response?.data || igError.message);
        return res.status(400).json({ error: friendlyError, raw: igError?.response?.data });
      }
    }

    // --- GUARDAR EL MENSAJE EN LA BASE DE DATOS Y ACTUALIZAR CONVERSACIÓN ---
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          content,
          direction,
          senderId: req.user.id,
          conversationId: id,
          status: 'SENT',
        },
      }),
      prisma.conversation.update({
        where: { id },
        data: { updatedAt: new Date() }
      })
    ]);

    // Emitir mensaje por WebSocket para actualizar todas las sesiones en tiempo real
    try {
      const { io } = await import('../server.js');
      if (io) {
        io.to(req.user.companyId).emit('new_message', {
          conversationId: id,
          message
        });
      }
    } catch (socketErr) {
      console.warn('Socket emit error:', socketErr.message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// PATCH /:id/read - Marcar conversacion como leida
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await prisma.conversation.findFirst({
      where: { id, client: { companyId: req.user.companyId } }
    });
    if (!conversation) return res.status(404).json({ error: 'Not found' });
    
    await prisma.conversation.update({
      where: { id },
      data: { unreadCount: 0 }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

export default router;

