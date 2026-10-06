import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const prisma = new PrismaClient();
const router = express.Router();

const COINBASE_API_KEY = process.env.COINBASE_API_KEY || 'dummy_api_key';

// Crear orden de pago en Coinbase Commerce
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { plan, amount } = req.body;
    const companyId = req.user.companyId;

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

    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': COINBASE_API_KEY,
        'X-CC-Version': '2018-03-22'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok && data.data) {
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
      
      res.json({ checkoutUrl });
    } else {
      console.error('Coinbase API Error:', data);
      res.status(400).json({ error: 'Error de Coinbase', details: data.error?.message });
    }
  } catch (error) {
    console.error('Coinbase Order Error:', error);
    res.status(500).json({ error: 'Fallo al procesar el pago' });
  }
});

export default router;
