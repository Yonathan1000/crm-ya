const fs = require('fs');
const file = 'frontend/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Agregar el import del OnboardingWizard
if (!content.includes('import OnboardingWizard')) {
  content = content.replace(
    /import LandingPage from '\.\/components\/LandingPage';/,
    `import LandingPage from './components/LandingPage';\nimport OnboardingWizard from './components/OnboardingWizard';`
  );
}

// Agregar el state showOnboarding
if (!content.includes('const [showOnboarding, setShowOnboarding]')) {
  content = content.replace(
    /const \[unreadBandeja, setUnreadBandeja\] = useState\(0\);/,
    `const [unreadBandeja, setUnreadBandeja] = useState(0);\n  const [showOnboarding, setShowOnboarding] = useState(false);`
  );
}

// Interceptar login success para verificar si se requiere onboarding
content = content.replace(
  /const handleLoginSuccess = \(view\) => \{[\s\S]*?setCurrentView\(view\);\s*\};/,
  `const handleLoginSuccess = (view, isNewUser = false) => {
    setIsCheckingSession(true);
    // Refresh user state immediately
    const token = localStorage.getItem('token');
    fetch(\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/me\`, {
      headers: { 'Authorization': \`Bearer \${token}\` }
    }).then(r => r.json()).then(data => {
      if (data.user) {
         setCurrentUser({ ...data.user, initials: data.user.nombre.substring(0, 2).toUpperCase() });
         if (isNewUser) {
           setShowOnboarding(true);
         }
         setCurrentView(view);
      }
    }).finally(() => setIsCheckingSession(false));
  };`
);

// Poner el OnboardingWizard overlay en la vista 'app'
content = content.replace(
  /<div className="min-h-screen bg-\[#F4F5F7\] font-sans text-gray-900 flex flex-col overflow-hidden">/,
  `<div className="min-h-screen bg-[#F4F5F7] font-sans text-gray-900 flex flex-col overflow-hidden">
      {showOnboarding && <OnboardingWizard onComplete={() => setShowOnboarding(false)} />}`
);

fs.writeFileSync(file, content);
console.log('Onboarding inyectado en App.jsx');
