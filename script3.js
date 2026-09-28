const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/frontend/src/components/SidebarYA.jsx', 'utf8');
const search = '<span className="flex-shrink-0">{item.icon}</span>';
const replace = '<div className="relative flex-shrink-0">{item.icon}{item.id === "bandeja" && unreadCount > 0 && (<span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">{unreadCount > 99 ? "99+" : unreadCount}</span>)}</div>';
code = code.replace(search, replace);
fs.writeFileSync('d:/Documentos/YA/frontend/src/components/SidebarYA.jsx', code);
