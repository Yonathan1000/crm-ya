const fs = require('fs');
const file = 'frontend/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix unread count pagination change
content = content.replace(
  /const convs = await res\.json\(\);\s*let count = 0;\s*convs\.forEach\(/g,
  `const convsData = await res.json();
          const convs = convsData.data || convsData;
          let count = 0;
          convs.forEach(`
);

fs.writeFileSync(file, content);
console.log('App.jsx adaptada a paginación');
