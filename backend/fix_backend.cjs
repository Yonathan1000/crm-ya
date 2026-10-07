const fs = require('fs');
const path = 'src/routes/conversations.routes.js';
let content = fs.readFileSync(path, 'utf8');

const newRoute = `
// GET /:id/messages - Obtener todos los mensajes de una conversacion
router.get('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await prisma.conversation.findFirst({
      where: { id, client: { companyId: req.user.companyId } },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });
    
    if (!conversation) return res.status(404).json({ error: 'Not found' });
    res.json(conversation.messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});
`;

if (!content.includes('GET /:id/messages')) {
  content = content.replace('// POST /:id/messages', newRoute + '\n// POST /:id/messages');
  fs.writeFileSync(path, content);
}
