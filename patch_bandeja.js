const fs = require('fs');
const file = 'frontend/src/components/Bandeja.jsx';
let content = fs.readFileSync(file, 'utf8');

// Ajustar el fetchConversations para manejar paginación { data: [...] }
content = content.replace(
  /const data = await res\.json\(\);\s*setConversations\(data\);/g,
  `const responseData = await res.json();
      const data = responseData.data || [];
      setConversations(data);`
);

fs.writeFileSync(file, content);
console.log('Bandeja.jsx adaptada a paginación');
