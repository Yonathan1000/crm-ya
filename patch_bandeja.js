const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/frontend/src/components/Bandeja.jsx', 'utf8');

code = code.replace("const [conversations, setConversations] = useState([]);", "const [conversations, setConversations] = useState([]);\n  const [pipelineStages, setPipelineStages] = useState([]);");

const fetchLogic = \
  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch stages
      try {
        const stagesRes = await fetch(\\\\\\/api/pipeline-stages\\\, {
          headers: { 'Authorization': \\\Bearer \\\\\\ }
        });
        if (stagesRes.ok) {
          setPipelineStages(await stagesRes.json());
        }
      } catch(e) {}

      const res = await fetch(\\\\\\/api/conversations\\\, {\;

code = code.replace(/const fetchConversations = async \(\) => \{\s*try \{\s*const token = localStorage\.getItem\('token'\);\s*const res = await fetch\(\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:3001'\}\/api\/conversations, \{/m, fetchLogic);

const selectHTML = \<select 
                  name="estado_lead"
                  value={editLeadData.estado_lead || ''}
                  onChange={handleLeadChange}
                  className="w-full py-2 px-3 bg-yellow-50 text-yellow-800 font-semibold text-sm rounded-lg border border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 capitalize"
                >
                  {pipelineStages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>\;

code = code.replace(/<select[\s\S]*?name="estado_lead"[\s\S]*?<\/select>/, selectHTML);

fs.writeFileSync('d:/Documentos/YA/frontend/src/components/Bandeja.jsx', code);
