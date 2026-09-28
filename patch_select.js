const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/frontend/src/components/Bandeja.jsx', 'utf8');
code = code.replace('<option value="Nuevo">', '<option value="lead_nuevo">');
code = code.replace('<option value="Contactado">', '<option value="en_contacto">');
code = code.replace(/"Negociaci.n"/, '"propuesta"');
code = code.replace(/>Negociaci.n</, '>Propuesta<');
code = code.replace('<option value="Ganado">', '<option value="ganado">');
code = code.replace('<option value="Perdido">', '<option value="perdido">');
fs.writeFileSync('d:/Documentos/YA/frontend/src/components/Bandeja.jsx', code);
