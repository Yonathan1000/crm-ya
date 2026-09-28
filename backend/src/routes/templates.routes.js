import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET all templates
router.get('/', async (req, res, next) => {
  try {
    const templates = await prisma.messageTemplate.findMany({
      where: { companyId: req.user.companyId },
    });
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

// POST new template
router.post('/', async (req, res, next) => {
  try {
    const { name, content } = req.body;
    
    const newTemplate = await prisma.messageTemplate.create({
      data: {
        name,
        content,
        companyId: req.user.companyId,
      },
    });
    res.status(201).json(newTemplate);
  } catch (error) {
    next(error);
  }
});

// PUT update template
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, content } = req.body;
    
    const existingTemplate = await prisma.messageTemplate.findFirst({
      where: { id, companyId: req.user.companyId }
    });
    
    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const updatedTemplate = await prisma.messageTemplate.update({
      where: { id },
      data: {
        name,
        content,
      },
    });
    res.json(updatedTemplate);
  } catch (error) {
    next(error);
  }
});

// DELETE template
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const existingTemplate = await prisma.messageTemplate.findFirst({
      where: { id, companyId: req.user.companyId }
    });
    
    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }

    await prisma.messageTemplate.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
