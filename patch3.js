const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/backend/src/controllers/auth.controller.js', 'utf8');
code = code.replace('premiumUnlocked: false', 'premiumUnlocked: false, pipelineStages: { create: [ { name: \"Nuevo Prospecto\", color: \"blue\", order: 0 }, { name: \"Contactado\", color: \"yellow\", order: 1 }, { name: \"Propuesta\", color: \"orange\", order: 2 }, { name: \"Ganado\", color: \"green\", order: 3 }, { name: \"Perdido\", color: \"red\", order: 4 } ] }');
fs.writeFileSync('d:/Documentos/YA/backend/src/controllers/auth.controller.js', code);
