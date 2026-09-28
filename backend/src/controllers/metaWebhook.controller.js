import { PrismaClient } from '@prisma/client';
import { io } from '../server.js'; // Importar el socket

const prisma = new PrismaClient();

// Verificación obligatoria de Meta (Paso de seguridad inicial de Facebook)
export const verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'NIVEL_DIOS_SECRET_123';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    return res.status(200).send(challenge);
  }
  
  return res.sendStatus(403);
};

// Recepción de mensajes en tiempo real (Facebook, IG y WhatsApp)
export const handleIncomingMessage = async (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'page' || body.object === 'instagram' || body.object === 'whatsapp_business_account') {
      
      // Meta manda los eventos en un array "entry"
      for (const entry of body.entry) {
        
        // El ID de la página, cuenta de IG o número de WABA al que le escribieron
        let externalId = entry.id; if (entry.changes && entry.changes[0]?.value?.metadata?.phone_number_id) { externalId = entry.changes[0].value.metadata.phone_number_id; } 
        
        // 1. ¿A qué inquilino (Company) le pertenece esta página/número?
        const channel = await prisma.channel.findFirst({
          where: { externalId, status: 'ACTIVE' },
          include: { company: true }
        });

        if (!channel) {
          console.warn(`Mensaje recibido para un ID desconocido (${externalId}). Ignorando...`);
          continue;
        }

        // 2. Extraer el mensaje (Facebook Messenger/IG)
        if (entry.messaging) {
          for (const event of entry.messaging) {
            if (event.message && !event.message.is_echo) {
              const senderExternalId = event.sender.id;
              const text = event.message.text;

              // Detectar si es Instagram o Facebook Messenger
              const isInstagram = body.object === 'instagram';

              // a) Buscar si el cliente ya existe
              let client = await prisma.client.findUnique({
                where: { externalId: senderExternalId }
              });

              if (!client) {
                // b) Si no, crearlo como Lead "Nuevo"
                let realName = isInstagram
                  ? `Lead de Instagram (${senderExternalId.substring(0, 5)})`
                  : `Lead de Facebook (${senderExternalId.substring(0, 5)})`;
                
                try {
                  const { default: axios } = await import('axios');
                  if (isInstagram) {
                    // Intentar obtener el perfil de Instagram del remitente
                    const igProfile = await axios.get(`https://graph.facebook.com/v18.0/${senderExternalId}?fields=username,name&access_token=${channel.credentials}`);
                    if (igProfile.data) {
                      realName = igProfile.data.name || igProfile.data.username || realName;
                    }
                  } else {
                    // Obtener perfil público de Facebook
                    const fbProfile = await axios.get(`https://graph.facebook.com/v18.0/${senderExternalId}?fields=first_name,last_name,profile_pic&access_token=${channel.credentials}`);
                    if (fbProfile.data) {
                      realName = `${fbProfile.data.first_name || ''} ${fbProfile.data.last_name || ''}`.trim() || realName;
                    }
                  }
                } catch (err) {
                  console.warn(`No se pudo obtener el perfil público de ${isInstagram ? 'Instagram' : 'Facebook'}:`, err?.response?.data || err.message);
                }

                client = await prisma.client.create({
                  data: {
                    nombre: realName,
                    externalId: senderExternalId,
                    companyId: channel.companyId,
                    estado_lead: (await prisma.pipelineStage.findFirst({ where: { companyId: channel.companyId }, orderBy: { order: 'asc' } }))?.id || 'lead_nuevo',
                  }
                });
              }

              // c) Buscar o crear Conversación Activa
              let conversation = await prisma.conversation.findFirst({
                where: { clientId: client.id, channelId: channel.id, status: 'OPEN' }
              });

              if (!conversation) {
                conversation = await prisma.conversation.create({
                  data: {
                    clientId: client.id,
                    channelId: channel.id,
                    status: 'OPEN'
                  }
                });
              }

              // Incrementar contador de no leídos
              await prisma.conversation.update({ where: { id: conversation.id }, data: { unreadCount: { increment: 1 } } });

              // d) Guardar el mensaje en Prisma
              const savedMessage = await prisma.message.create({
                data: {
                  content: text || '[Contenido multimedia]',
                  direction: 'INBOUND',
                  conversationId: conversation.id
                }
              });
              
              // e) NOTIFICAR EN TIEMPO REAL AL FRONTEND
              io.to(channel.companyId).emit('new_message', {
                conversationId: conversation.id,
                message: savedMessage,
                client: client,
                channel: channel
              });
              console.log(`Mensaje de ${isInstagram ? 'Instagram' : 'Facebook'} guardado y emitido por WebSocket en conversacion ${conversation.id}`);
            }
          }
        }
        
        // Ejemplo para WhatsApp Cloud API
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.value && change.value.messages) {
               for (const msg of change.value.messages) {
                 const senderExternalId = msg.from; // Número de teléfono del cliente
                 const text = msg.text?.body;
                 
                 if (!text) continue; // Solo procesamos texto por ahora

                 let client = await prisma.client.findUnique({
                   where: { externalId: senderExternalId }
                 });

                 if (!client) {
                   client = await prisma.client.create({
                     data: {
                       nombre: change.value.contacts?.[0]?.profile?.name || `Lead WA (${senderExternalId.substring(0, 5)})`,
                       telefono: senderExternalId,
                       externalId: senderExternalId,
                       estado_lead: (await prisma.pipelineStage.findFirst({ where: { companyId: channel.companyId }, orderBy: { order: 'asc' } }))?.id || 'lead_nuevo',
                     }
                   });
                 }

                 let conversation = await prisma.conversation.findFirst({
                   where: { clientId: client.id, channelId: channel.id, status: 'OPEN' }
                 });

                 if (!conversation) {
                   conversation = await prisma.conversation.create({
                     data: { clientId: client.id, channelId: channel.id, status: 'OPEN' }
                   });
                 }

                 await prisma.conversation.update({ where: { id: conversation.id }, data: { unreadCount: { increment: 1 } } });
                const savedMessage = await prisma.message.create({
                   data: {
                     content: text,
                     direction: 'INBOUND',
                     conversationId: conversation.id
                   }
                 });

                 io.to(channel.companyId).emit('new_message', {
                   conversationId: conversation.id,
                   message: savedMessage,
                   client: client,
                   channel: channel
                 });
                 console.log(`Mensaje de WhatsApp emitido por WebSocket en conversacion ${conversation.id}`);
               }
            }
          }
        }
      }

      // IMPORTANTE: Siempre responder 200 OK a Meta rápido o desconectarán el Webhook
      return res.status(200).send('EVENT_RECEIVED');
    }

    res.sendStatus(404);
  } catch (error) {
    console.error('Error procesando webhook de Meta:', error);
    res.status(500).send('ERROR');
  }
};
