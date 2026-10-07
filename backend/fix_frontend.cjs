const fs = require('fs');
const path = '../frontend/src/components/Bandeja.jsx';
let content = fs.readFileSync(path, 'utf8');

const newSelect = `
    const handleSelectConv = async (conv) => {
    setActiveConv(conv);
    
    // Obtener historial completo de la conversacion
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/conversations/${conv.id}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const fullMessages = await res.json();
        const updatedConv = { ...conv, messages: fullMessages };
        setActiveConv(updatedConv);
        setConversations(prev => prev.map(c => c.id === conv.id ? updatedConv : c));
      }
    } catch (err) {
      console.error('Failed to fetch full messages', err);
    }

    if (conv.unreadCount > 0) {
`;

if (!content.includes('const fullMessages = await res.json();')) {
  content = content.replace('    const handleSelectConv = async (conv) => {\n    setActiveConv(conv);\n    if (conv.unreadCount > 0) {', newSelect);
  fs.writeFileSync(path, content);
  console.log('Frontend parcheado');
} else {
  console.log('Ya estaba parcheado');
}
