import express from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();
const BINANCE_SECRET_KEY = process.env.BINANCE_PAY_API_SECRET || 'dummy_secret_key';

function verifySignature(timestamp, nonce, bodyStr, signature) {
  const payload = timestamp + "\n" + nonce + "\n" + bodyStr + "\n";
  const expectedSignature = crypto.createHmac('sha512', BINANCE_SECRET_KEY).update(payload).digest('hex').toUpperCase();
  return signature === expectedSignature;
}

// Webhook que recibe la notificación desde Binance (No necesita autenticación JWT)
router.post('/binance', express.text({type: 'application/json'}), async (req, res) => {
  try {
    const timestamp = req.headers['binancepay-timestamp'];
    const nonce = req.headers['binancepay-nonce'];
    const signature = req.headers['binancepay-signature'];
    const bodyStr = req.body;
    
    if (!verifySignature(timestamp, nonce, bodyStr, signature)) {
      return res.status(400).send('Invalid signature');
    }

    const payload = JSON.parse(bodyStr);

    if (payload.bizType === 'PAY' && payload.bizStatus === 'PAY_SUCCESS') {
      const orderId = payload.data.merchantTradeNo;
      
      const payment = await prisma.payment.findUnique({ where: { binanceOrderId: orderId }});
      if (payment && payment.status === 'PENDING') {
        // Marcar pago como exitoso
        await prisma.payment.update({
          where: { binanceOrderId: orderId },
          data: { status: 'SUCCESS' }
        });

        // Actualizar el plan de la empresa
        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + 1);

        await prisma.company.update({
          where: { id: payment.companyId },
          data: {
            plan: payment.plan,
            planExpires: expirationDate
          }
        });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Server error');
  }
});

export default router;
