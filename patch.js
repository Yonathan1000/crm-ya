const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/frontend/src/components/Bandeja.jsx', 'utf8');
code = code.replace(/? 'bg-indigo-600 text-white rounded-br-none'/g, "? (msg.status === 'FAILED' ? 'bg-red-500 text-white rounded-br-none' : 'bg-indigo-600 text-white rounded-br-none')");
code = code.replace(/? 'text-indigo-100' : 'text-gray-400'/g, "? (msg.status === 'FAILED' ? 'text-red-100' : 'text-indigo-100') : 'text-gray-400'");
code = code.replace(/{formatTime\(msg.timestamp \|\| msg.created_at\)}/g, "{msg.status === 'FAILED' ? '?? Error al enviar (Meta bloqueó)' : formatTime(msg.timestamp || msg.created_at)}");
fs.writeFileSync('d:/Documentos/YA/frontend/src/components/Bandeja.jsx', code);
