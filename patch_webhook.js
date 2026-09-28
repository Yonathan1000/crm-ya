const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/backend/src/controllers/metaWebhook.controller.js', 'utf8');

const regexFb = /estado_lead: 'lead_nuevo',(\s*companyId: channel.companyId)/g;
code = code.replace(regexFb, "estado_lead: (await prisma.pipelineStage.findFirst({ where: { companyId: channel.companyId }, orderBy: { order: 'asc' } }))?.id || 'lead_nuevo',");

fs.writeFileSync('d:/Documentos/YA/backend/src/controllers/metaWebhook.controller.js', code);
