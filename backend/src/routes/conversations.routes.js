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
              timestamp: 'desc',
            },
            take: 1
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

    // --- ENVIAR EL MENSAJE REAL A FACEBOOK/INSTAGRAM ---
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
        console.error('Error enviando mensaje a Facebook:', metaError?.response?.data || metaError.message);
        return res.status(500).json({ error: 'No se pudo enviar el mensaje a Facebook' });
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
        console.error('Error enviando mensaje a WhatsApp:', waError?.response?.data || waError.message);
        return res.status(500).json({ error: 'No se pudo enviar el mensaje a WhatsApp' });
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
        console.error('Error enviando mensaje a Instagram:', igError?.response?.data || igError.message);
        return res.status(500).json({ error: 'No se pudo enviar el mensaje a Instagram' });
      }
    }

    // --- GUARDAR EL MENSAJE EN LA BASE DE DATOS ---
    const message = await prisma.message.create({
      data: {
        content,
        direction,
        senderId: req.user.id,
        conversationId: id,
      },
    });

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

