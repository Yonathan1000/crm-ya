const fs = require('fs');
const path = 'src/routes/conversations.routes.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(`          messages: {
            orderBy: {
              timestamp: 'desc',
            },
            take: 1
          },`, `          messages: {
            orderBy: {
              timestamp: 'asc', // Mostrar todos en orden cronologico
            }
          },`);

fs.writeFileSync(path, content);
console.log('Removido take: 1');
