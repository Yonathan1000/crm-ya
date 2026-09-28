import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get('/dashboard', async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const totalLeads = await prisma.client.count({ where: { companyId } });
    
    const totalConversations = await prisma.conversation.count({
      where: { client: { companyId } }
    });

    const totalTasks = await prisma.task.count({ where: { companyId } });
    
    const completedTasks = await prisma.task.count({
      where: { companyId, status: 'Completada' }
    });

    const wonLeads = await prisma.client.count({
      where: { companyId, estado_lead: 'Ganado' }
    });

    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    const leadsByStageRaw = await prisma.client.groupBy({
      by: ['estado_lead'],
      where: { companyId },
      _count: { estado_lead: true }
    });
    const leadsByStage = leadsByStageRaw.map(stage => ({
      estado_lead: stage.estado_lead,
      count: stage._count.estado_lead
    }));

    const recentActivity = await prisma.interaction.findMany({
      where: { companyId },
      orderBy: { fecha: 'desc' },
      take: 10,
      include: {
        client: true,
        user: true
      }
    });

    res.json({
      totalLeads,
      totalConversations,
      totalTasks,
      completedTasks,
      conversionRate,
      leadsByStage,
      recentActivity
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load dashboard analytics' });
  }
});

export default router;
