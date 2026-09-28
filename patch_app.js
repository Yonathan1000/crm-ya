const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/frontend/src/App.jsx', 'utf8');
code = code.replace(
  "const unreadNotifications = 3;",
  const unreadNotifications = 3;
  const [unreadBandeja, setUnreadBandeja] = useState(0);

  React.useEffect(() => {
    if (currentView !== 'app') return;
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(\\/api/conversations\, {
          headers: { 'Authorization': \Bearer \\ }
        });
        if (res.ok) {
          const convs = await res.json();
          let count = 0;
          convs.forEach(c => {
            const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;
            if (lastMsg && lastMsg.direction === 'INBOUND') {
              count++;
            }
          });
          setUnreadBandeja(count);
        }
      } catch(e) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [currentView]);
);
code = code.replace('<SidebarYA onNavChange={(id) => setActiveTab(id)} defaultActive="inicio" hasPremiumAccess={hasPremiumAccess} />', '<SidebarYA onNavChange={(id) => setActiveTab(id)} defaultActive="inicio" hasPremiumAccess={hasPremiumAccess} unreadCount={unreadBandeja} />');
fs.writeFileSync('d:/Documentos/YA/frontend/src/App.jsx', code);
