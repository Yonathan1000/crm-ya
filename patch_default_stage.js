const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/backend/src/controllers/metaWebhook.controller.js', 'utf8');
code = code.replace(/estado_lead: 'Nuevo'/g, "estado_lead: 'lead_nuevo'");
fs.writeFileSync('d:/Documentos/YA/backend/src/controllers/metaWebhook.controller.js', code);

code = fs.readFileSync('d:/Documentos/YA/backend/src/controllers/client.controller.js', 'utf8');
code = code.replace(/estado_lead: estado_lead \|\| 'Nuevo'/g, "estado_lead: estado_lead || 'lead_nuevo'");
fs.writeFileSync('d:/Documentos/YA/backend/src/controllers/client.controller.js', code);

code = fs.readFileSync('d:/Documentos/YA/backend/prisma/schema.prisma', 'utf8');
code = code.replace(/estado_lead String  @default\("Nuevo"\)/g, 'estado_lead String  @default("lead_nuevo")');
fs.writeFileSync('d:/Documentos/YA/backend/prisma/schema.prisma', code);
