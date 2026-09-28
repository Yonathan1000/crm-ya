import prisma from '../config/db.js';

export const getStages = async (req, res) => {
  try {
    const stages = await prisma.pipelineStage.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { order: 'asc' }
    });
    res.json(stages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stages' });
  }
};

export const createStage = async (req, res) => {
  try {
    const { name, color, order } = req.body;
    const stage = await prisma.pipelineStage.create({
      data: {
        name,
        color: color || 'blue',
        order: order !== undefined ? order : 0,
        companyId: req.user.companyId
      }
    });
    res.status(201).json(stage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create stage' });
  }
};

export const updateStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, order } = req.body;
    const stage = await prisma.pipelineStage.findFirst({ where: { id, companyId: req.user.companyId } });
    if (!stage) return res.status(404).json({ error: 'Not found' });

    const updated = await prisma.pipelineStage.update({
      where: { id },
      data: { name, color, order }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stage' });
  }
};

export const deleteStage = async (req, res) => {
  try {
    const { id } = req.params;
    const stage = await prisma.pipelineStage.findFirst({ where: { id, companyId: req.user.companyId } });
    if (!stage) return res.status(404).json({ error: 'Not found' });

    // Move existing clients to another stage or leave them orphaned?
    // Let's just delete the stage. Clients will have an invalid stage id, which will fall back to the first stage in the UI.
    await prisma.pipelineStage.delete({ where: { id } });
    res.json({ message: 'Stage deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete stage' });
  }
};
