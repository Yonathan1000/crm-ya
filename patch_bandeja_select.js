const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/frontend/src/components/Bandeja.jsx', 'utf8');

const selectRegex = /<option value="lead_nuevo">Nuevo Prospecto<\/option>[\s\S]*?<option value="perdido">Perdido<\/option>/;
const dynamicSelect = "{pipelineStages.map(stage => (<option key={stage.id} value={stage.id}>{stage.name}</option>))}";

code = code.replace(selectRegex, dynamicSelect);
fs.writeFileSync('d:/Documentos/YA/frontend/src/components/Bandeja.jsx', code);
