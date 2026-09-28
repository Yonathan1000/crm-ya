import prisma from '../config/db.js';

export const getAll = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { companyId: req.user.companyId }
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findFirst({
      where: { id, companyId: req.user.companyId }
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }
    
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch client' });
  }
};

export const create = async (req, res) => {
  try {
    const { nombre, empresa, email, telefono, estado_lead } = req.body;
    const client = await prisma.client.create({
      data: {
        nombre,
        empresa,
        email,
        telefono,
        estado_lead: estado_lead || 'Nuevo',
        asignado_a_userId: req.user.id,
        companyId: req.user.companyId
      }
    });
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create client' });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const client = await prisma.client.findFirst({ where: { id, companyId: req.user.companyId } });
    if (!client) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: updateData
    });
    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update client' });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await prisma.client.findFirst({ where: { id, companyId: req.user.companyId } });
    if (!client) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    await prisma.client.delete({ where: { id } });
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete client' });
  }
};
