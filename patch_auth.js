const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/backend/src/controllers/auth.controller.js', 'utf8');

const newCompanyData = \data: {
          name: \\\Empresa de \\\\\\,
          planType: startTrial ? 'TRIAL' : 'BASIC',
          isActive: true,
          trialEndsAt: trialEnds,
          premiumUnlocked: false,
          pipelineStages: {
            create: [
              { id: 'lead_nuevo', name: 'Nuevo Prospecto', color: 'blue', order: 0 },
              { id: 'en_contacto', name: 'Contactado', color: 'yellow', order: 1 },
              { id: 'propuesta', name: 'Propuesta', color: 'orange', order: 2 },
              { id: 'ganado', name: 'Ganado', color: 'green', order: 3 },
              { id: 'perdido', name: 'Perdido', color: 'red', order: 4 }
            ]
          }
        }\;

code = code.replace(/data: \{\s*name: \Empresa de \$\{nombre\}\,\s*planType: startTrial \? 'TRIAL' : 'BASIC',\s*isActive: true,\s*trialEndsAt: trialEnds,\s*premiumUnlocked: false\s*\}/, newCompanyData);
fs.writeFileSync('d:/Documentos/YA/backend/src/controllers/auth.controller.js', code);
