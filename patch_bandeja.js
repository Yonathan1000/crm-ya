const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/frontend/src/components/Bandeja.jsx', 'utf8');

const newHandleSelect = \
  const handleSelectConv = async (conv) => {
    setActiveConv(conv);
    if (conv.unreadCount > 0) {
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
      try {
        const token = localStorage.getItem('token');
        await fetch(\\\\\\/api/conversations/\\\/read\\\, {
          method: 'PATCH',
          headers: { 'Authorization': \\\Bearer \\\\\\ }
        });
      } catch (err) {
        console.error('Failed to mark as read', err);
      }
    }
  };
\;

code = code.replace("onClick={() => setActiveConv(conv)}", "onClick={() => handleSelectConv(conv)}");
code = code.replace("const handleSendMessage = async (e) => {", newHandleSelect + "\\n  const handleSendMessage = async (e) => {");

const oldClassName = "className={p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition }";
const newClassName = "className={p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition }";

code = code.replace(oldClassName, newClassName);
fs.writeFileSync('d:/Documentos/YA/frontend/src/components/Bandeja.jsx', code);
