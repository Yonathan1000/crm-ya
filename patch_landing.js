const fs = require('fs');
const file = 'frontend/src/components/LandingPage.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /onLoginSuccess\(data\.user\.isSuperAdmin \? 'superadmin' : 'admin'\);/g,
  `onLoginSuccess(data.user.isSuperAdmin ? 'superadmin' : 'admin', isRegisterTab);`
);

fs.writeFileSync(file, content);
console.log('LandingPage.jsx fix aplicado');
