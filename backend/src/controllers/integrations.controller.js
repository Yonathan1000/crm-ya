import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// Obtener todas las integraciones de la empresa
export const getIntegrations = async (req, res) => {
  try {
    const { companyId } = req.user;
    const integrations = await prisma.integration.findMany({
      where: { companyId },
      include: { channels: true }
    });
    res.json(integrations);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
};

// Generar URL para abrir el popup de Facebook Login
export const getFacebookAuthUrl = (req, res) => {
  try {
    const appId = process.env.META_APP_ID || 'PENDING_APP_ID';
    const redirectUri = process.env.META_REDIRECT_URI || `${process.env.VITE_API_URL || 'http://localhost:3001'}/api/integrations/meta/callback`;
    const companyId = req.user.companyId;

    const configId = process.env.META_CONFIG_ID;
    const scope = 'pages_manage_metadata,pages_read_engagement,pages_messaging,whatsapp_business_messaging,instagram_basic,instagram_manage_messages,pages_show_list';
    
    let authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&state=${companyId}&response_type=code&auth_type=rerequest`;
    
    // Si usamos la nueva "Configuración" de Facebook Login for Business
    if (configId) {
      authUrl += `&config_id=${configId}`;
    } else {
      authUrl += `&scope=${scope}`;
    }

    res.json({ url: authUrl });
  } catch (error) {
    res.status(500).json({ error: 'Error generating auth url' });
  }
};

// Recibir el código de autorización de Meta, cambiarlo por un Token Permanente y guardarlo
export const handleFacebookCallback = async (req, res) => {
  try {
    const { code, state: companyId } = req.query;
    
    if (!code) return res.status(400).send('Falta el código de autorización');

    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = process.env.META_REDIRECT_URI || `${process.env.VITE_API_URL || 'http://localhost:3001'}/api/integrations/meta/callback`;

    // 1. Cambiar código por Access Token (Short-lived)
    const tokenResponse = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
      params: {
        client_id: appId,
        redirect_uri: redirectUri,
        client_secret: appSecret,
        code
      }
    });

    const shortLivedToken = tokenResponse.data.access_token;

    // 2. Cambiar Short-lived token por Long-lived token (dura 60 días o no expira si es WABA)
    const longTokenResponse = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortLivedToken
      }
    });

    const longLivedToken = longTokenResponse.data.access_token;

    // 3. Obtener el ID del usuario de Meta
    const meResponse = await axios.get(`https://graph.facebook.com/me?access_token=${longLivedToken}`);
    const metaUserId = meResponse.data.id;

    // 4. Guardar en Base de Datos (Integration)
    const integration = await prisma.integration.upsert({
      where: {
        id: 'meta_' + companyId // Usamos un ID predecible para evitar duplicados, o podríamos buscar por provider+companyId si hacemos un findFirst. Vamos a crearlo directamente.
      },
      create: {
        id: 'meta_' + companyId,
        companyId,
        provider: 'META',
        accessToken: longLivedToken,
        externalId: metaUserId,
        status: 'ACTIVE'
      },
      update: {
        accessToken: longLivedToken,
        externalId: metaUserId,
        status: 'ACTIVE'
      }
    });

    // 4.5. Buscar las Páginas de Facebook del usuario y guardarlas como Canales
    try {
      const pagesResponse = await axios.get(`https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedToken}`);
      const pages = pagesResponse.data.data;
      
      for (const page of pages) {
        await prisma.channel.upsert({
          where: { id: 'channel_' + page.id },
          create: {
            id: 'channel_' + page.id,
            platform: 'FACEBOOK',
            externalId: page.id,
            name: page.name,
            credentials: page.access_token, // Guardamos el token de la página
            companyId: companyId,
            integrationId: integration.id,
            status: 'ACTIVE'
          },
          update: {
            name: page.name,
            credentials: page.access_token,
            status: 'ACTIVE'
          }
        });

        // 4.6 Suscribir automáticamente esta página al Webhook para que Meta nos envíe los mensajes
        try {
          await axios.post(`https://graph.facebook.com/v18.0/${page.id}/subscribed_apps`, null, {
            params: {
              subscribed_fields: 'messages,messaging_postbacks',
              access_token: page.access_token
            }
          });
          console.log(`Webhook suscrito para la página: ${page.name}`);
        } catch (subErr) {
          console.error(`Error suscribiendo webhook para ${page.name}:`, subErr?.response?.data || subErr.message);
        }

        // 4.7 Descubrir la cuenta de Instagram Business vinculada a esta página
        try {
          const igResponse = await axios.get(`https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`);
          const igAccountId = igResponse.data?.instagram_business_account?.id;

          if (igAccountId) {
            // Obtener el nombre de usuario de Instagram
            let igUsername = `Instagram (${igAccountId.substring(0, 5)})`;
            try {
              const igProfile = await axios.get(`https://graph.facebook.com/v18.0/${igAccountId}?fields=username,name&access_token=${page.access_token}`);
              igUsername = igProfile.data?.username || igProfile.data?.name || igUsername;
            } catch (igProfileErr) {
              console.warn('No se pudo obtener perfil IG:', igProfileErr?.response?.data || igProfileErr.message);
            }

            await prisma.channel.upsert({
              where: { id: 'channel_ig_' + igAccountId },
              create: {
                id: 'channel_ig_' + igAccountId,
                platform: 'INSTAGRAM',
                externalId: igAccountId,
                name: `@${igUsername}`,
                credentials: page.access_token, // Se usa el token de la página para enviar/recibir DMs de IG
                companyId: companyId,
                integrationId: integration.id,
                status: 'ACTIVE'
              },
              update: {
                name: `@${igUsername}`,
                credentials: page.access_token,
                status: 'ACTIVE'
              }
            });
            console.log(`Canal de Instagram creado: @${igUsername} (ID: ${igAccountId})`);

            // Suscribir también los campos de Instagram para recibir DMs
            try {
              await axios.post(`https://graph.facebook.com/v18.0/${page.id}/subscribed_apps`, null, {
                params: {
                  subscribed_fields: 'messages,messaging_postbacks',
                  access_token: page.access_token
                }
              });
            } catch (igSubErr) {
              console.warn('Error suscribiendo IG webhook:', igSubErr?.response?.data || igSubErr.message);
            }
          }
        } catch (igErr) {
          console.warn(`No se encontró cuenta IG para la página ${page.name}:`, igErr?.response?.data || igErr.message);
        }
      }
    } catch (pageError) {
      console.error('Error fetching Facebook Pages:', pageError?.response?.data || pageError.message);
    }

    // 5. Redirigir al cliente de vuelta al CRM (Pantalla de Canales)
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/app?success=meta_connected`);

  } catch (error) {
    console.error('Meta Callback Error:', error?.response?.data || error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/app?error=meta_failed`);
  }
};
