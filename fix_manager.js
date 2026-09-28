const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/frontend/src/components/PipelineStagesManager.jsx', 'utf8');

const wrongFetch = "await fetch(/api/pipeline-stages, {";
const correctFetch = "await fetch(\\\\\\/api/pipeline-stages\\\, {";

code = code.replace(wrongFetch, correctFetch);
code = code.replace(/'Authorization': Bearer  \}/g, "'Authorization': \\\Bearer \\\\\\ }");

const wrongFetch2 = "let url = /api/pipeline-stages;";
const correctFetch2 = "let url = \\\\\\/api/pipeline-stages\\\;";
code = code.replace(wrongFetch2, correctFetch2);

fs.writeFileSync('d:/Documentos/YA/frontend/src/components/PipelineStagesManager.jsx', code);
