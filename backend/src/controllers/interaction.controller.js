import prisma from '../config/db.js';

export const createInteraction = async (req, res) => {
  try {
    const { client_id, tipo, notas } = req.body;
    
    const client = await prisma.client.findFirst({ 
      where: { id: client_id, companyId: req.user.companyId } 
    });
    if (!client) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    const interaction = await prisma.interaction.create({
      data: {
        client_id,
        user_id: req.user.id,
        tipo,
        notas,
        companyId: req.user.companyId
      }
    });
    res.status(201).json(interaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create interaction', details: error.message });
  }
};

export const getClientInteractions = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const client = await prisma.client.findFirst({ 
      where: { id: clientId, companyId: req.user.companyId } 
    });
    if (!client) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    const interactions = await prisma.interaction.findMany({
      where: { client_id: clientId, companyId: req.user.companyId },
      orderBy: { fecha: 'desc' }
    });
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
};
