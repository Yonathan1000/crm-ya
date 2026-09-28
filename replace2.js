const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/backend/src/controllers/auth.controller.js', 'utf8');

const search =       const company = await tx.company.create({
        data: {
          name: \Empresa de \\,
          planType: startTrial ? 'TRIAL' : 'BASIC',
          isActive: true,
          trialEndsAt: trialEnds,
          premiumUnlocked: false
        }
      });;

const replacement =       const company = await tx.company.create({
        data: {
          name: \Empresa de \\,
          planType: startTrial ? 'TRIAL' : 'BASIC',
          isActive: true,
          trialEndsAt: trialEnds,
          premiumUnlocked: false,
          pipelineStages: {
            create: [
              { name: 'Nuevo Prospecto', color: 'blue', order: 0 },
              { name: 'Contactado', color: 'yellow', order: 1 },
              { name: 'Propuesta', color: 'orange', order: 2 },
              { name: 'Ganado', color: 'green', order: 3 },
              { name: 'Perdido', color: 'red', order: 4 }
            ]
          }
        }
      });;

code = code.replace(search, replacement);
fs.writeFileSync('d:/Documentos/YA/backend/src/controllers/auth.controller.js', code);
