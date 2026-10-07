const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const companyId = '352b99b1-24c9-41e7-9ad3-773b57105842';
  const phoneNumberId = '1359761307217284';
  const wabaId = '1417533027014752';
  const token = 'EAAZAqJGsJZBvABSvFIhmad55veBSCFe1pUb0QREjL328c4qKT1ZB38GpZAirbflU3xZAcwrvEZCXXPAkYFMMC2HPRzb7tPonqdDp1iRCZAMqsPoW3EpzoCzQxJb7QSNgBwAmcbc7yZBdAZBAoEH5xBMZCNF8nlZBAAYETO5F3NkjWeQO89tBjSID8zXTiHOQ6RWdQ2ZB8KxCUaShW8INhomeMIoR8PZAtgmosLkw0LQxvTPboxNTv0gHYGYlGkNctCnIeBQK9VXbmgwNwoT1G3Vj1pagxb7OgBAOTH3dHyAZDZD';

  try {
    const integration = await prisma.integration.upsert({
      where: { id: 'wa_' + companyId },
      create: {
        id: 'wa_' + companyId,
        companyId,
        provider: 'WHATSAPP_MANUAL',
        accessToken: token,
        externalId: wabaId,
        status: 'ACTIVE'
      },
      update: {
        accessToken: token,
        externalId: wabaId,
        status: 'ACTIVE'
      }
    });

    await prisma.channel.upsert({
      where: { id: 'channel_wa_' + phoneNumberId },
      create: {
        id: 'channel_wa_' + phoneNumberId,
        platform: 'WHATSAPP',
        externalId: phoneNumberId,
        name: `WhatsApp Oficial`,
        credentials: token,
        companyId,
        integrationId: integration.id,
        status: 'ACTIVE'
      },
      update: {
        credentials: token,
        status: 'ACTIVE'
      }
    });
    console.log('Credenciales de WhatsApp inyectadas exitosamente en la base de datos de producción.');
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
