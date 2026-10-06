import prisma from '../config/db.js';

export const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const where = { companyId: req.user.companyId };
    
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit
      }),
      prisma.client.count({ where })
    ]);
    
    res.json({
      data: clients,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
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
        estado_lead: estado_lead || (await prisma.pipelineStage.findFirst({ where: { companyId: req.user.companyId }, orderBy: { order: 'asc' } }))?.id || 'lead_nuevo',
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
