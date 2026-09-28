const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/frontend/src/components/Bandeja.jsx', 'utf8');
const searchStr = "className={\p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition \\}";
const replaceStr = "className={\p-4 border-b border-gray-100 cursor-pointer transition \\}";
const newCode = code.split(searchStr).join(replaceStr);
fs.writeFileSync('d:/Documentos/YA/frontend/src/components/Bandeja.jsx', newCode);
