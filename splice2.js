const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/frontend/src/components/Configuracion.jsx', 'utf8');
const search = "onClick={() => setActiveTab('canales')}";
const idx = code.indexOf(search);
if (idx !== -1) {
  const tick = String.fromCharCode(96);
  const injection = "onClick={() => setActiveTab('embudos')}\n" + 
    "                className={" + tick + "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors " + tick + "}\n" + 
    "              >\n" + 
    "                Embudos de Venta\n" + 
    "              </button>\n" + 
    "              <button\n" + 
    "                " + search;
  const newCode = code.slice(0, idx) + injection + code.slice(idx + search.length);
  fs.writeFileSync('d:/Documentos/YA/frontend/src/components/Configuracion.jsx', newCode);
}
