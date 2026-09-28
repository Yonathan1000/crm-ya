import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Auth Middleware and SuperAdmin Check
router.use(authMiddleware, (req, res, next) => {
  if (!req.user || !req.user.isSuperAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

// GET /companies -> Returns all companies with their users count
router.get('/companies', async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      }
    });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching companies', details: error.message });
  }
});

// PUT /companies/:id/plan -> Update planType and maxUsers / maxTemplates
router.put('/companies/:id/plan', async (req, res) => {
  try {
    const { id } = req.params;
    const { planType } = req.body;
    
    let maxUsers = 2; // BASIC
    let maxTemplates = 10;
    
    if (planType === 'PRO') {
      maxUsers = 3;
      maxTemplates = 30;
    } else if (planType === 'ENTERPRISE') {
      maxUsers = 4;
      maxTemplates = 50;
    } else if (planType !== 'BASIC' && planType !== 'FREE') {
      return res.status(400).json({ error: 'Invalid plan type' });
    }
    
    const company = await prisma.company.update({
      where: { id },
      data: { planType, maxUsers, maxTemplates }
    });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Error updating company plan', details: error.message });
  }
});

// PUT /companies/:id/limits -> Manually override limits (Upsell micro-transactions)
router.put('/companies/:id/limits', async (req, res) => {
  try {
    const { id } = req.params;
    const { maxUsers, maxTemplates } = req.body;
    
    const company = await prisma.company.update({
      where: { id },
      data: { 
        ...(maxUsers !== undefined && { maxUsers }),
        ...(maxTemplates !== undefined && { maxTemplates })
      }
    });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Error updating company limits', details: error.message });
  }
});

// PUT /companies/:id/status -> Toggle isActive
router.put('/companies/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean' });
    }
    
    const company = await prisma.company.update({
      where: { id },
      data: {
        isActive
      }
    });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Error updating company status', details: error.message });
  }
});

// PUT /companies/:id/premium -> Toggle premiumUnlocked
router.put('/companies/:id/premium', async (req, res) => {
  try {
    const { id } = req.params;
    const { premiumUnlocked } = req.body;
    
    if (typeof premiumUnlocked !== 'boolean') {
      return res.status(400).json({ error: 'premiumUnlocked must be a boolean' });
    }
    
    const company = await prisma.company.update({
      where: { id },
      data: { premiumUnlocked }
    });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Error updating premium status', details: error.message });
  }
});

export default router;
