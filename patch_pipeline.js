const fs = require('fs');
const file = 'frontend/src/components/PipelineBoard.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const clientsData = await clientsRes\.json\(\);/g,
  `const clientsResData = await clientsRes.json();
      const clientsData = clientsResData.data || clientsResData;`
);

fs.writeFileSync(file, content);
console.log('PipelineBoard.jsx adaptada a paginación');
