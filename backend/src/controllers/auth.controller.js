import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

export const register = async (req, res) => {
  try {
    const { nombre, email, password, startTrial } = req.body;
    
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está en uso' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    
    // Create Company and User in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const trialEnds = startTrial ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null;
      
      const company = await tx.company.create({
        data: {
          name: `Empresa de ${nombre}`,
          planType: startTrial ? 'TRIAL' : 'BASIC',
          isActive: true,
          trialEndsAt: trialEnds,
          premiumUnlocked: false, pipelineStages: { create: [ { name: "Nuevo Prospecto", color: "blue", order: 0 }, { name: "Contactado", color: "yellow", order: 1 }, { name: "Propuesta", color: "orange", order: 2 }, { name: "Ganado", color: "green", order: 3 }, { name: "Perdido", color: "red", order: 4 } ] }
        }
      });

      const user = await tx.user.create({
        data: {
          nombre,
          email,
          password_hash,
          role: 'COMPANY_ADMIN',
          companyId: company.id,
          isApproved: true
        }
      });
      
      return { company, user };
    });

    const token = jwt.sign(
      { id: result.user.id, email: result.user.email, role: result.user.role, isSuperAdmin: result.user.isSuperAdmin, companyId: result.company.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: result.user.id,
        nombre: result.user.nombre,
        email: result.user.email,
        role: result.user.role,
        isSuperAdmin: result.user.isSuperAdmin,
        companyId: result.company.id
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, isSuperAdmin: user.isSuperAdmin, companyId: user.companyId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        companyId: user.companyId
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        role: true,
        isSuperAdmin: true,
        companyId: true,
        company: {
          select: {
            planType: true,
            premiumUnlocked: true,
            trialEndsAt: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user', details: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { nombre, email } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { nombre, email }
    });
    res.json({ message: 'Perfil actualizado', user });
  } catch(error) {
    res.status(500).json({ error: 'Error actualizando perfil' });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Contraseña actual incorrecta' });

    const password_hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password_hash }
    });

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch(error) {
    res.status(500).json({ error: 'Error actualizando contraseña' });
  }
};
