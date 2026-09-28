import React, { useState } from 'react';
import SidebarYA from './components/SidebarYA';
import PipelineBoard from './components/PipelineBoard';
import LandingPage from './components/LandingPage';
import DashboardInicio from './components/DashboardInicio';
import Contactos from './components/Contactos';
import Tareas from './components/Tareas';
import Analiticas from './components/Analiticas';
import Automatizaciones from './components/Automatizaciones';
import Configuracion from './components/Configuracion';
import Bandeja from './components/Bandeja';
import Plantillas from './components/Plantillas';
import SuperAdminPanel from './components/SuperAdminPanel';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [activeTab, setActiveTab] = useState('inicio');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Si estamos en landing y ya revisamos sesión, no hacemos nada a menos que nos logueemos
    if (currentView === 'landing' && !isCheckingSession) return;

    if (token) {
      setIsCheckingSession(true);
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          const initials = data.user.nombre ? data.user.nombre.substring(0, 2).toUpperCase() : 'US';
          setCurrentUser({ ...data.user, initials });
          // Solo forzar cambio de vista si estamos chequeando la sesión inicial al cargar la página
          if (currentView === 'landing' && isCheckingSession) {
             setCurrentView(data.user.isSuperAdmin ? 'superadmin' : 'app');
          }
        } else {
          localStorage.removeItem('token');
          setCurrentView('landing');
        }
        setIsCheckingSession(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setCurrentView('landing');
        setIsCheckingSession(false);
      });
    } else {
      setCurrentView('landing');
      setIsCheckingSession(false);
    }
  }, [currentView]);

  const unreadNotifications = 3;
  const [unreadBandeja, setUnreadBandeja] = useState(0);

  React.useEffect(() => {
    if (currentView !== "app") return;
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/conversations`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const convs = await res.json();
          let count = 0;
          convs.forEach(c => {
            count += c.unreadCount || 0;
          });
          setUnreadBandeja(count);
        }
      } catch(e) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [currentView]);

  if (isCheckingSession) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F5F7] text-gray-500 font-medium">Reconectando con la matriz...</div>;
  }

  if (currentView === 'landing') {
    return <LandingPage onLoginSuccess={(role) => {
      if (role === 'superadmin') {
        setCurrentView('superadmin');
      } else {
        setCurrentView('app');
      }
    }} />;
  }

  if (currentView === 'superadmin') {
    return <SuperAdminPanel onExit={() => setCurrentView('landing')} />;
  }

  if (currentView === 'app' && !currentUser) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7]">Cargando...</div>;
  }

  const isPremium = currentUser?.company?.premiumUnlocked || false;
  const isTrial = currentUser?.company?.planType === 'TRIAL';
  
  // Calculate if trial is active
  let trialActive = false;
  let trialDays = 0;
  if (isTrial && currentUser?.company?.trialEndsAt) {
    const diff = new Date(currentUser.company.trialEndsAt) - new Date();
    trialDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
    trialActive = trialDays > 0;
  }
  
  const hasPremiumAccess = isPremium || trialActive;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F5F7] font-sans text-gray-800">
      <SidebarYA onNavChange={(id) => setActiveTab(id)} defaultActive="inicio" hasPremiumAccess={hasPremiumAccess} unreadCount={unreadBandeja} />

      <div className="flex-1 ml-[72px] flex flex-col h-screen overflow-hidden">
        <header className="shrink-0 z-30 flex items-center justify-between h-14 px-6 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800 tracking-tight capitalize">{activeTab}</h1>
            {isTrial && trialActive && (
              <span className="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-600 rounded-lg">
                Prueba: {trialDays} días
              </span>
            )}
            {isTrial && !trialActive && !isPremium && (
              <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-600 rounded-lg">
                Prueba Expirada
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 ml-6 shrink-0">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Prospecto
            </button>

            <button
              type="button"
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
              )}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold select-none border border-blue-200">
                  {currentUser?.initials}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg ring-1 ring-black/5 z-50 py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">{currentUser?.nombre}</p>
                      <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        {currentUser?.role}
                      </span>
                    </div>
                    <button type="button" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                      Mi perfil
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setActiveTab('configuracion'); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      Configuración
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('token');
                        setCurrentView('landing');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-4">
          {activeTab === 'inicio' && <DashboardInicio />}
          {activeTab === 'bandeja' && <Bandeja />}
          {activeTab === 'pipeline' && <PipelineBoard />}
          {activeTab === 'contactos' && <Contactos />}
          {activeTab === 'tareas' && <Tareas />}
          {activeTab === 'analiticas' && <Analiticas />}
          {activeTab === 'configuracion' && <Configuracion />}
          
          {/* Premium Protected Routes */}
          {(activeTab === 'automatizaciones' || activeTab === 'plantillas') && !hasPremiumAccess && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Herramienta Premium Bloqueada</h2>
              <p className="text-gray-500 max-w-md">Para acceder a esta función necesitas una suscripción activa. Contacta al administrador del sistema.</p>
            </div>
          )}
          {activeTab === 'automatizaciones' && hasPremiumAccess && <Automatizaciones />}
          {activeTab === 'plantillas' && hasPremiumAccess && <Plantillas />}
          
          {!['inicio', 'bandeja', 'pipeline', 'contactos', 'tareas', 'analiticas', 'automatizaciones', 'configuracion', 'plantillas'].includes(activeTab) && (
            <div className="p-6 text-gray-800 bg-white rounded-xl border border-gray-200 shadow-sm">
              Vista seleccionada: <span className="font-semibold capitalize">{activeTab}</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
// Trigger Vercel Deploy

