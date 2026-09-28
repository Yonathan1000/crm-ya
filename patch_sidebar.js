const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/frontend/src/components/SidebarYA.jsx', 'utf8');
code = code.replace(
  '<span className="flex-shrink-0">{item.icon}</span>',
  <div className="relative flex-shrink-0">
              {item.icon}
              {item.id === 'bandeja' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
);
fs.writeFileSync('d:/Documentos/YA/frontend/src/components/SidebarYA.jsx', code);
