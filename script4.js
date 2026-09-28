const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/frontend/src/components/Bandeja.jsx', 'utf8');
code = code.replace(
  "className={\p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition \\}",
  "className={\p-4 border-b border-gray-100 cursor-pointer transition \\}"
);
fs.writeFileSync('d:/Documentos/YA/frontend/src/components/Bandeja.jsx', code);
