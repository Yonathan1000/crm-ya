const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/backend/src/controllers/client.controller.js', 'utf8');

code = code.replace(/estado_lead: estado_lead \|\| 'lead_nuevo',/g, "estado_lead: estado_lead || (await prisma.pipelineStage.findFirst({ where: { companyId: req.user.companyId }, orderBy: { order: 'asc' } }))?.id || 'lead_nuevo',");

fs.writeFileSync('d:/Documentos/YA/backend/src/controllers/client.controller.js', code);
