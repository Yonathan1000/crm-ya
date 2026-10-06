import express from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const prisma = new PrismaClient();
const router = express.Router();

const COINBASE_API_KEY = process.env.COINBASE_API_KEY || 'dummy_api_key';

router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { plan, amount } = req.body;
    const companyId = req.user.companyId;

    if (!COINBASE_API_KEY || COINBASE_API_KEY === 'dummy_api_key') {
       return res.status(500).json({ error: 'La API Key de Coinbase no está configurada en Render.' });
    }

    const payload = {
      name: `Plan ${plan} - CRM YA`,
      description: `Suscripción mensual al plan ${plan}`,
      pricing_type: 'fixed_price',
      local_price: {
        amount: parseFloat(amount).toFixed(2),
        currency: 'USD'
      },
      metadata: {
        companyId: companyId,
        plan: plan
      },
      redirect_url: `${process.env.FRONTEND_URL || 'https://crm-ya.vercel.app'}/app?billing=success`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://crm-ya.vercel.app'}/app?billing=cancel`
    };

    const response = await axios.post('https://api.commerce.coinbase.com/charges', payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': COINBASE_API_KEY,
        'X-CC-Version': '2018-03-22'
      }
    });

    const data = response.data;

    if (data && data.data) {
      const chargeId = data.data.id;
      const checkoutUrl = data.data.hosted_url;

      // Registrar orden pendiente en BD
      await prisma.payment.create({
        data: {
          providerOrderId: chargeId,
          companyId,
          amount: parseFloat(amount),
          plan,
          status: 'PENDING'
        }
      });
      
      return res.json({ checkoutUrl });
    } else {
      return res.status(400).json({ error: 'Respuesta inválida de Coinbase' });
    }
  } catch (error) {
    console.error('Coinbase Order Error:', error?.response?.data || error.message);
    const details = error?.response?.data?.error?.message || error.message;
    return res.status(500).json({ error: 'Fallo al procesar el pago', details });
  }
});

export default router;
