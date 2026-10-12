const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

if (!code.includes("import { PrivacyPolicy, TermsOfService }")) {
  code = code.replace("import LandingPage from './components/LandingPage';", "import LandingPage from './components/LandingPage';\nimport { PrivacyPolicy, TermsOfService } from './components/LegalPages';");
}

if (!code.includes("currentView === 'privacy'")) {
  code = code.replace(
    "if (currentView === 'landing') return <LandingPage onNavigate={setCurrentView} />;",
    "if (currentView === 'landing') return <LandingPage onNavigate={setCurrentView} />;\n  if (currentView === 'privacy') return <PrivacyPolicy onBack={() => setCurrentView('landing')} />;\n  if (currentView === 'terms') return <TermsOfService onBack={() => setCurrentView('landing')} />;"
  );
  fs.writeFileSync('src/App.jsx', code);
  console.log('App.jsx modificado');
} else {
  console.log('Ya modificado');
}
