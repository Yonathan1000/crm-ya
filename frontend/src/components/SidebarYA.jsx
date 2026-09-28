import React, { useState } from 'react';

const NAV_ITEMS = [
  {
    id: 'inicio',
    label: 'Inicio',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'bandeja',
    label: 'Bandeja',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
  {
    id: 'plantillas',
    label: 'Plantillas',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V19l-4 2v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    ),
  },
  {
    id: 'contactos',
    label: 'Contactos',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM8 2v4m8-4v4m-4 4a3 3 0 100-6 3 3 0 000 6zm-5 6h10" />
      </svg>
    ),
  },
  {
    id: 'tareas',
    label: 'Tareas',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
      </svg>
    ),
  },
  {
    id: 'analiticas',
    label: 'Analíticas',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V9m6 10V5M5 19v-4m14 4V11" />
      </svg>
    ),
  },
  {
    id: 'automatizaciones',
    label: 'Automatizaciones',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

const SETTINGS_ITEM = {
  id: 'configuracion',
  label: 'Configuración',
  icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-1.18 1.902-1.18 2.202 0a1.724 1.724 0 002.573 1.066c1.014-.644 2.22.562 1.576 1.576a1.724 1.724 0 001.066 2.573c1.18.3 1.18 1.902 0 2.202a1.724 1.724 0 00-1.066 2.573c.644 1.014-.562 2.22-1.576 1.576a1.724 1.724 0 00-2.573 1.066c-.3 1.18-1.902 1.18-2.202 0a1.724 1.724 0 00-2.573-1.066c-1.014.644-2.22-.562-1.576-1.576a1.724 1.724 0 00-1.066-2.573c-1.18-.3-1.18-1.902 0-2.202a1.724 1.724 0 001.066-2.573c-.644-1.014.562-2.22 1.576-1.576a1.724 1.724 0 002.573-1.066zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

export function SidebarYA({ defaultActive = 'inicio', onNavChange, hasPremiumAccess = true }) {
  const [activeId, setActiveId] = useState(defaultActive);
  const [expanded, setExpanded] = useState(false);
  
  // Decodificar JWT basico
  const getUserFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { name: 'Usuario', initials: 'U' };
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      const name = payload.email ? payload.email.split('@')[0] : 'Usuario';
      const initials = name.substring(0, 2).toUpperCase();
      return { name, initials };
    } catch (e) {
      return { name: 'Usuario', initials: 'U' };
    }
  };
  
  const [user, setUser] = useState(getUserFromToken());

  const handleSelect = (id) => {
    setActiveId(id);
    onNavChange?.(id);
  };

  const renderNavItem = (item) => {
    const isActive = activeId === item.id;
    const isLocked = (item.id === 'plantillas' || item.id === 'automatizaciones') && !hasPremiumAccess;

    return (
      <li key={item.id}>
        <button
          type="button"
          onClick={() => handleSelect(item.id)}
          title={!expanded ? (isLocked ? 'Premium Requerido' : item.label) : undefined}
          aria-label={item.label}
          aria-current={isActive ? 'page' : undefined}
          className={`
            group relative flex items-center w-full gap-3 px-5 py-3
            text-sm font-medium transition-all duration-300
            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset
            ${
              isActive
                ? 'text-blue-700 bg-blue-50/50 border-l-[3px] border-blue-600 pl-[17px]'
                : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 border-l-[3px] border-transparent pl-[17px]'
            }
          `}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          <span
            className={`whitespace-nowrap transition-opacity duration-200 flex flex-1 items-center justify-between ${
              expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
            }`}
          >
            {item.label}
            {isLocked && expanded && (
              <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </span>
        </button>
      </li>
    );
  };

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      role="navigation"
      aria-label="Barra lateral principal"
      className={`
        fixed top-0 left-0 z-40 h-screen
        bg-white/70 backdrop-blur-xl border-r border-gray-200
        flex flex-col justify-between
        transition-[width] duration-300 ease-in-out
        ${expanded ? 'w-[200px]' : 'w-16'}
      `}
    >
      <div>
        <div className="flex items-center justify-center h-14 border-b border-gray-200">
          <div
            className={`
              flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold
              transition-all duration-200 shadow-sm
              ${expanded ? 'w-9 h-9 text-lg' : 'w-8 h-8 text-base'}
            `}
            aria-label="YA CRM"
          >
            K
          </div>
          {expanded && (
            <span className="ml-2 text-sm font-semibold text-gray-800 whitespace-nowrap">
              YA
            </span>
          )}
        </div>

        <nav className="mt-2">
          <ul className="flex flex-col gap-0.5" role="list">
            {NAV_ITEMS.map(renderNavItem)}
          </ul>
        </nav>
      </div>

      <div className="mb-2">
        <ul role="list">
          {renderNavItem(SETTINGS_ITEM)}
        </ul>

        <div
          className="flex items-center gap-3 px-5 py-3 mt-1 border-t border-gray-200"
          title={!expanded ? user.name : undefined}
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`Avatar de ${user.name}`}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-200"
            />
          ) : (
            <span
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 text-xs font-bold flex-shrink-0 border border-gray-200"
              aria-label={`Avatar de ${user.name}`}
            >
              {user.initials}
            </span>
          )}

          <span
            className={`text-sm text-gray-800 font-medium whitespace-nowrap transition-opacity duration-200 ${
              expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
            }`}
          >
            {user.name}
          </span>
        </div>
      </div>
    </aside>
  );
}

export default SidebarYA;
