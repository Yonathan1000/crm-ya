const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/backend/src/routes/conversations.routes.js', 'utf8');
const newEndpoint = 
// PATCH /:id/read - Marcar conversacion como leida
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await prisma.conversation.findFirst({
      where: { id, client: { companyId: req.user.companyId } }
    });
    if (!conversation) return res.status(404).json({ error: 'Not found' });
    
    await prisma.conversation.update({
      where: { id },
      data: { unreadCount: 0 }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

export default router;;
code = code.replace("export default router;", newEndpoint);
fs.writeFileSync('d:/Documentos/YA/backend/src/routes/conversations.routes.js', code);
