import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/manual-order', authMiddleware, async (req, res) => {
  try {
    const { plan, amount, months, txHash } = req.body;
    const companyId = req.user.companyId;

    if (!txHash || txHash.length < 10) {
      return res.status(400).json({ error: 'Debes enviar un Hash de transacción válido' });
    }

    // Prevenir duplicados de Hash (alguien intentando usar el mismo Hash dos veces)
    const existing = await prisma.payment.findFirst({ where: { providerOrderId: txHash }});
    if (existing) {
       return res.status(400).json({ error: 'Este Hash ya fue registrado previamente en el sistema' });
    }

    // Registrar pago manual en BD
    await prisma.payment.create({
      data: {
        providerOrderId: txHash, // Usamos la columna para guardar el TxID
        companyId,
        amount: parseFloat(amount),
        plan: `${plan} (${months} meses)`,
        status: 'PENDING'
      }
    });
    
    return res.json({ success: true, message: 'Pago registrado para auditoría' });
  } catch (error) {
    console.error('Manual Order Error:', error);
    return res.status(500).json({ error: 'Fallo interno al registrar el pago' });
  }
});

export default router;
