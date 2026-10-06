import express from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const prisma = new PrismaClient();
const router = express.Router();

// Binance Credentials (should be in .env)
const BINANCE_API_KEY = process.env.BINANCE_PAY_API_KEY || 'dummy_api_key';
const BINANCE_SECRET_KEY = process.env.BINANCE_PAY_API_SECRET || 'dummy_secret_key';

function generateNonce() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let nonce = '';
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}

// Genera firma para la API de Binance
function buildSignature(timestamp, nonce, body) {
  const payload = timestamp + "\n" + nonce + "\n" + JSON.stringify(body) + "\n";
  return crypto.createHmac('sha512', BINANCE_SECRET_KEY).update(payload).digest('hex').toUpperCase();
}

// Crear orden de pago en Binance
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { plan, amount } = req.body; // e.g., plan: 'PRO', amount: 25.00
    const companyId = req.user.companyId;

    // Crear un ID de orden único
    const orderId = `YA-${Date.now()}-${companyId.substring(0,8)}`;

    const body = {
      "env": {
        "terminalType": "WEB"
      },
      "merchantTradeNo": orderId,
      "orderAmount": parseFloat(amount).toFixed(2),
      "currency": "USDT",
      "goods": {
        "goodsType": "02",
        "goodsCategory": "Z000",
        "referenceGoodsId": plan,
        "goodsName": `Plan ${plan} - CRM YA`,
        "goodsDetail": `Suscripción mensual al plan ${plan}`
      },
      "returnUrl": `${process.env.FRONTEND_URL || 'https://crm-ya.vercel.app'}/app?billing=success`,
      "cancelUrl": `${process.env.FRONTEND_URL || 'https://crm-ya.vercel.app'}/app?billing=cancel`,
      "webhookUrl": `${process.env.API_URL || 'https://crm-ya.onrender.com'}/api/billing/webhook/binance`
    };

    const timestamp = Date.now().toString();
    const nonce = generateNonce();
    const signature = buildSignature(timestamp, nonce, body);

    const response = await fetch('https://bpay.binanceapi.com/binancepay/openapi/v2/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'BinancePay-Timestamp': timestamp,
        'BinancePay-Nonce': nonce,
        'BinancePay-Certificate-SN': BINANCE_API_KEY,
        'BinancePay-Signature': signature
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data.status === 'SUCCESS') {
      // Registrar orden pendiente en BD
      await prisma.payment.create({
        data: {
          binanceOrderId: orderId,
          companyId,
          amount: parseFloat(amount),
          plan,
          status: 'PENDING'
        }
      });
      res.json({ checkoutUrl: data.data.checkoutUrl });
    } else {
      res.status(400).json({ error: 'Error de Binance', details: data.errorMessage });
    }
  } catch (error) {
    console.error('Binance Order Error:', error);
    res.status(500).json({ error: 'Fallo al procesar el pago' });
  }
});

export default router;
