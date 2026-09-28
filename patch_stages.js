const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/frontend/src/components/PipelineBoard.jsx', 'utf8');
code = code.replace(
  "badgeText: 'text-green-700',\n  },\n];",
  "badgeText: 'text-green-700',\n  },\n  {\n    id: 'perdido',\n    title: 'Perdido',\n    borderColor: 'border-t-[#FEE2E2]',\n    textColor: 'text-[#EF4444]',\n    bgAccent: 'bg-[#FEE2E2]',\n    badgeBg: 'bg-red-100',\n    badgeText: 'text-red-700',\n  }\n];"
);
fs.writeFileSync('d:/Documentos/YA/frontend/src/components/PipelineBoard.jsx', code);
