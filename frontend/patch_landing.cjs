const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.jsx', 'utf8');

if (!code.includes("onNavigate('privacy')")) {
  code = code.replace(
    `<a href="#" className="hover:text-blue-400">Privacidad</a>`,
    `<button onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }} className="hover:text-blue-400">Privacidad</button>`
  );
  code = code.replace(
    `<a href="#" className="hover:text-blue-400">Términos</a>`,
    `<button onClick={(e) => { e.preventDefault(); onNavigate('terms'); }} className="hover:text-blue-400">Términos</button>`
  );
  fs.writeFileSync('src/components/LandingPage.jsx', code);
  console.log('LandingPage.jsx modificado');
} else {
  console.log('Ya modificado');
}
