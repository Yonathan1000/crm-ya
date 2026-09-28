const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/frontend/src/App.jsx', 'utf8');
code = code.replace(
  'const unreadNotifications = 3;',
  'const unreadNotifications = 3;\n  const [unreadBandeja, setUnreadBandeja] = useState(0);\n\n  React.useEffect(() => {\n    if (currentView !== \"app\") return;\n    const fetchUnread = async () => {\n      try {\n        const token = localStorage.getItem(\"token\");\n        if (!token) return;\n        const res = await fetch(${import.meta.env.VITE_API_URL || \"http://localhost:3001\"}/api/conversations, {\n          headers: { \"Authorization\": Bearer  }\n        });\n        if (res.ok) {\n          const convs = await res.json();\n          let count = 0;\n          convs.forEach(c => {\n            const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;\n            if (lastMsg && lastMsg.direction === \"INBOUND\") {\n              count++;\n            }\n          });\n          setUnreadBandeja(count);\n        }\n      } catch(e) {}\n    };\n    fetchUnread();\n    const interval = setInterval(fetchUnread, 5000);\n    return () => clearInterval(interval);\n  }, [currentView]);'
);
code = code.replace('<SidebarYA onNavChange={(id) => setActiveTab(id)} defaultActive="inicio" hasPremiumAccess={hasPremiumAccess} />', '<SidebarYA onNavChange={(id) => setActiveTab(id)} defaultActive="inicio" hasPremiumAccess={hasPremiumAccess} unreadCount={unreadBandeja} />');
fs.writeFileSync('d:/Documentos/YA/frontend/src/App.jsx', code);
