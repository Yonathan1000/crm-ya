import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET all tasks
router.get('/', async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { companyId: req.user.companyId },
    });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// GET task by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findFirst({
      where: { id, companyId: req.user.companyId },
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// POST new task
router.post('/', async (req, res, next) => {
  try {
    const { title, description, status, dueDate, assignedToId } = req.body;
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedToId,
        companyId: req.user.companyId,
      },
    });
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
});

// PUT update task
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, dueDate, assignedToId } = req.body;
    
    // Check if task exists and belongs to company
    const existingTask = await prisma.task.findFirst({
      where: { id, companyId: req.user.companyId }
    });
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedToId,
      },
    });
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
});

// DELETE task
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const existingTask = await prisma.task.findFirst({
      where: { id, companyId: req.user.companyId }
    });
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
