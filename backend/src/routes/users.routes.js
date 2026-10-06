import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middleware/checkRole.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /profile - Returns current user's full profile
router.get('/profile', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        role: true,
        isSuperAdmin: true,
        companyId: true,
        company: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// PUT /profile - Updates nombre, email, telefono
router.put('/profile', async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { nombre, email, telefono },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        role: true,
        companyId: true
      }
    });
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /password - Changes password
router.put('/password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect old password' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash }
    });
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// GET /team - Returns all users in the same company
router.get('/team', async (req, res) => {
  try {
    const team = await prisma.user.findMany({
      where: { companyId: req.user.companyId },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        role: true
      }
    });
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// POST /team - Create a new team member
router.post('/team', checkRole('COMPANY_ADMIN'), async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const newUser = await prisma.user.create({
      data: {
        nombre,
        email,
        passwordHash,
        role: 'SALES_REP',
        companyId: req.user.companyId,
        isApproved: true
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        role: true
      }
    });
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

// DELETE /team/:id - Remove a team member
router.delete('/team/:id', checkRole('COMPANY_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const userToDelete = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!userToDelete || userToDelete.companyId !== req.user.companyId) {
      return res.status(404).json({ error: 'User not found or access denied' });
    }
    
    await prisma.user.delete({
      where: { id }
    });
    
    res.json({ message: 'Team member removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

export default router;
