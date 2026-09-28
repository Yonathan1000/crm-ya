const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/backend/src/controllers/metaWebhook.controller.js', 'utf8');
code = code.replace(
  "                const savedMessage = await prisma.message.create({",
  "                await prisma.conversation.update({ where: { id: conversation.id }, data: { unreadCount: { increment: 1 } } });\n                const savedMessage = await prisma.message.create({"
);
code = code.replace(
  "                  const savedMessage = await prisma.message.create({",
  "                  await prisma.conversation.update({ where: { id: conversation.id }, data: { unreadCount: { increment: 1 } } });\n                  const savedMessage = await prisma.message.create({"
);
fs.writeFileSync('d:/Documentos/YA/backend/src/controllers/metaWebhook.controller.js', code);
