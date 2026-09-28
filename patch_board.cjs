const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/frontend/src/components/PipelineBoard.jsx', 'utf8');

// Replace static STAGES with dynamic state and fetch logic
const searchStages = /const STAGES = \[[\s\S]*?\];/;
const replaceStages = `const getColorConfig = (colorName) => {
  const configs = {
    blue: { borderColor: 'border-t-blue-200', textColor: 'text-blue-500', bgAccent: 'bg-blue-100', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700' },
    yellow: { borderColor: 'border-t-yellow-200', textColor: 'text-yellow-500', bgAccent: 'bg-yellow-100', badgeBg: 'bg-yellow-100', badgeText: 'teyt-yellow-700' },
    orange: { borderColor: 'border-t-orange-200', textColor: 'text-orange-500', bgAccent: 'bg-orange-100', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700' },
    green: { borderColor: 'border-t-green-200', textColor: 'text-green-500', bgAccent: 'bg-green-100', badgeBg: 'bg-green-100', badgeText: 'text-green-700' },
    red: { borderColor: 'border-t-red-200', textColor: 'text-red-500', bgAccent: 'bg-red-100', badgeBg: 'bg-red-100', badgeText: 'text-red-700' },
  };
  return configs[colorName] || configs.blue;
};`;
code = code.replace(searchStages, replaceStages);

// Inject state for stages
code = code.replace("const [leads, setLeads] = useState([]);", "const [stages, setStages] = useState([]);\n  const [leads, setLeads] = useState([]);");

// Update fetchLeads to fetch stages first
const fetchLogic = `
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': \`Bearer ${token}\`, 'Content-Type': 'application/json' };
        
        // Fetch Stages
        const stagesRes = await fetch(\`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/pipeline-stages\`, { headers });
        let loadedStages = [];
        if (stagesRes.ok) {
           const dbStages = await stagesRes.json();
           loadedStages = dbStages.map(s => ({
             id: s.id,
             title: s.name,
             ...getColorConfig(s.color)
           }));
           setStages(loadedStages);
        }

        // Fetch Leads
        const response = await fetch(\`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/clients\`, { headers });
        if (!response.ok) throw new Error('Falló la carga de leads');
        const data = await response.json();
        
        const formattedLeads = data.map(client => {
          let matchedStageId = loadedStages.length > 0 ? loadedStages[0].id : 'lead_nuevo';
          if (client.estado_lead) {
             const found = loadedStages.find(s => s.id === client.estado_lead || s.title.toLowerCase() === client.estado_lead.toLowerCase().trim());
             if (found) matchedStageId = found.id;
          }
          
`;

code = code.replace(/const fetchLeads = async \(\) => \\{[\S\s]*?if \(client.estado_lead\) \\{[\S\s]*?\\}\s*if \(found\) matchedStageId = found.id;\s*\\}/m, fetchLogic);

code = code.replace(/STAGES.map/g, "stages.map");
const stagesFindRegex = /STAGES.find/g
bcode = code.replace(stagesFindRegex, "stages.find");

fs.writeFileSync('d:/Documentos/YA/frontend/src/components/PipelineBoard.jsx', bcode);
