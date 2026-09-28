const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/frontend/src/components/Configuracion.jsx', 'utf8');

code = code.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport PipelineStagesManager from './PipelineStagesManager';");

const injection = "case 'embudos':\n          return <PipelineStagesManager />;\n        case 'canales':";

code = code.replace("case 'canales':", injection);

fs.writeFileSync('d:/Documentos/YA/frontend/src/components/Configuracion.jsx', code);
