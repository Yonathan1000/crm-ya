const fs = require('fs');
const path = 'prisma/schema.prisma';
let schema = fs.readFileSync(path, 'utf8');

// Remover el duplicado que acabamos de meter
schema = schema.replace(/payments\s+Payment\[\]\s+plan\s+String\s+@default\("FREE"\)/, 'payments    Payment[]');

fs.writeFileSync(path, schema);
console.log('Duplicado corregido');
