import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET all automations
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const rules = await prisma.automationRule.findMany({
      where: { companyId: req.user.companyId },
    });
    res.json(rules);
  } catch (error) {
    next(error);
  }
});

// POST new automation rule
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { name, triggerType, triggerCondition, actionType, actionPayload, isActive } = req.body;
    const newRule = await prisma.automationRule.create({
      data: {
        name,
        triggerType,
        triggerCondition,
        actionType,
        actionPayload,
        isActive: isActive ?? true,
        companyId: req.user.companyId,
      },
    });
    res.status(201).json(newRule);
  } catch (error) {
    next(error);
  }
});

// PUT update automation active status (and other fields if necessary)
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive, name, triggerType, triggerCondition, actionType, actionPayload } = req.body;
    
    const existingRule = await prisma.automationRule.findFirst({
      where: { id, companyId: req.user.companyId }
    });
    if (!existingRule) {
      return res.status(404).json({ error: 'Automation rule not found' });
    }

    const updatedRule = await prisma.automationRule.update({
      where: { id },
      data: {
        isActive,
        name,
        triggerType,
        triggerCondition,
        actionType,
        actionPayload,
      },
    });
    res.json(updatedRule);
  } catch (error) {
    next(error);
  }
});

// DELETE automation rule
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const existingRule = await prisma.automationRule.findFirst({
      where: { id, companyId: req.user.companyId }
    });
    if (!existingRule) {
      return res.status(404).json({ error: 'Automation rule not found' });
    }

    await prisma.automationRule.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// POST /webhook (Webhook Engine for Bots)
// Rate limiting should be applied here
router.post('/webhook', async (req, res, next) => {
  try {
    const { event, payload } = req.body;

    if (!event || !payload) {
      return res.status(400).json({ success: false, error: 'Missing event or payload' });
    }

    const rules = await prisma.automationRule.findMany({
      where: {
        isActive: true,
        triggerType: event,
      },
    });

    const executedRules = [];

    for (const rule of rules) {
      const username = payload.username;
      
      if (!username) continue; // Safety check

      // 1. Find or create Client
      let client = await prisma.client.findFirst({
        where: { username, companyId: rule.companyId },
      });
      
      if (!client) {
        client = await prisma.client.create({
          data: {
            username,
            nombre: username,
            companyId: rule.companyId,
          },
        });
      }

      // 2. Find or create Conversation
      let conversation = await prisma.conversation.findFirst({
        where: { clientId: client.id },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            clientId: client.id,
          },
        });
      }

      // 3. Create outbound Message
      let messageContent = 'Auto-reply';
      try {
        const parsedPayload = JSON.parse(rule.actionPayload || '{}');
        messageContent = parsedPayload.message || messageContent;
      } catch (e) {
         if (typeof rule.actionPayload === 'string') {
             messageContent = rule.actionPayload;
         }
      }
      
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: messageContent,
          direction: 'OUTBOUND',
        },
      });

      // 4. Increment executionCount
      await prisma.automationRule.update({
        where: { id: rule.id },
        data: {
          executionCount: { increment: 1 },
        },
      });

      executedRules.push(rule.id);
    }

    res.json({ success: true, executedRules });
  } catch (error) {
    next(error);
  }
});

export default router;
