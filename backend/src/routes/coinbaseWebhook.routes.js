import express from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

const COINBASE_WEBHOOK_SECRET = process.env.COINBASE_WEBHOOK_SECRET || 'dummy_webhook_secret';

// Webhook para notificaciones de Coinbase Commerce
router.post('/coinbase', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-cc-webhook-signature'];
    const rawBody = req.body; // El middleware express.raw nos da un buffer

    if (!signature || !rawBody) {
      return res.status(400).send('Falta firma o cuerpo');
    }

    const expectedSignature = crypto
      .createHmac('sha256', COINBASE_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).send('Firma inválida');
    }

    const payload = JSON.parse(rawBody.toString('utf8'));
    const event = payload.event;

    // Solo nos importa si el cargo fue confirmado
    if (event.type === 'charge:confirmed' || event.type === 'charge:resolved') {
      const chargeId = event.data.id;
      const metadata = event.data.metadata;
      
      const payment = await prisma.payment.findUnique({ where: { providerOrderId: chargeId }});
      
      if (payment && payment.status === 'PENDING') {
        // Marcar como exitoso
        await prisma.payment.update({
          where: { providerOrderId: chargeId },
          data: { status: 'SUCCESS' }
        });

        // Actualizar plan
        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + 1);

        await prisma.company.update({
          where: { id: payment.companyId },
          data: {
            plan: payment.plan,
            planExpires: expirationDate
          }
        });
        console.log(`Plan actualizado a ${payment.plan} para la empresa ${payment.companyId}`);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Error interno del servidor');
  }
});

export default router;
