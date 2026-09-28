import React, { useState, useEffect } from 'react';

/**
 * Componente para la vista "Inicio" (News/Dashboard).
 * Contiene banner de bienvenida, acciones rápidas, métricas, feed de actividad y noticias.
 *
 * @returns {JSX.Element}
 */
export default function DashboardInicio() {
  const hoy = new Intl.DateTimeFormat('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date());

  const [leadsCount, setLeadsCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);
  const [actividadReciente, setActividadReciente] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [clientsRes, tasksRes, analyticsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/clients`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/tasks`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/analytics/dashboard`, { headers })
        ]);
        
        if (clientsRes.ok) {
          const clientsData = await clientsRes.json();
          setLeadsCount(clientsData.length);
        }
        
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          const pendientes = tasksData.filter(t => {
            const status = (t.estado || t.status || '').toLowerCase();
            return status === 'pendiente' || status === 'pending';
          });
          setTasksCount(pendientes.length > 0 ? pendientes.length : tasksData.length);
        }

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setActividadReciente(analyticsData.recentActivity || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchDashboardData();
  }, []);

  /** Noticias fijas / Bienvenida del CRM */
  const noticias = [
    {
      id: 1,
      titulo: '¡Bienvenido a YA CRM!',
      fecha: hoy,
      contenido: 'Tu plataforma está lista y conectada. Explora el panel, gestiona tus contactos y potencia tus ventas.',
      tipo: 'feature',
    }
  ];

  return (
    <div className="p-6 bg-transparent min-h-full overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ── Welcome Banner & Quick Actions ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">¡Bienvenido de vuelta! 👋</h2>
            <p className="text-gray-600 text-lg capitalize">
              {hoy}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Lead
            </button>
            <button className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Nueva Tarea
            </button>
            <button className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Invitar Usuario
            </button>
          </div>
        </div>

        {/* ── Quick Metrics ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="text-sm font-semibold text-gray-600 mb-1 tracking-wide uppercase">Leads Activos</div>
            <div className="text-4xl font-black text-gray-900">{leadsCount}</div>
            <div className="text-sm font-medium text-emerald-700 mt-3 flex items-center bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Total actualizado
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="text-sm font-semibold text-gray-600 mb-1 tracking-wide uppercase">Tareas Pendientes</div>
            <div className="text-4xl font-black text-gray-900">{tasksCount}</div>
            <div className="text-sm font-medium text-amber-700 mt-3 flex items-center bg-amber-500/10 w-fit px-2 py-1 rounded-md">
              Requieren atención
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="text-sm font-semibold text-gray-600 mb-1 tracking-wide uppercase">Ventas cerradas (Semana)</div>
            <div className="text-4xl font-black text-gray-900">$4,500</div>
            <div className="text-sm font-medium text-emerald-700 mt-3 flex items-center bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +5% vs sem. pasada
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Activity Feed ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Actividad Reciente
              </h3>
            </div>
            <div className="p-6 flex-1">
              <div className="flow-root">
                <ul className="-mb-8">
                  {actividadReciente.length === 0 && <p className="text-gray-500 text-sm">No hay actividad reciente.</p>}
                  {actividadReciente.map((evento, eventIdx) => (
                    <li key={evento.id || eventIdx}>
                      <div className="relative pb-8">
                        {eventIdx !== actividadReciente.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center ring-8 ring-white">
                              <span className="text-indigo-600 font-bold text-xs uppercase">
                                {evento.user?.nombre ? evento.user.nombre.charAt(0) : 'U'}
                              </span>
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-700">
                                <span className="font-semibold text-gray-900">{evento.user?.nombre || 'Usuario'}</span>{' '}
                                agregó una <b>{evento.tipo}</b>: {evento.notas}
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              <time>{new Date(evento.fecha).toLocaleDateString()}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors w-full text-center">
                Ver toda la actividad
              </button>
            </div>
          </div>

          {/* ── CRM News ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Noticias del CRM
              </h3>
            </div>
            <div className="divide-y divide-gray-200 flex-1">
              {noticias.map((noticia) => (
                <div key={noticia.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      noticia.tipo === 'feature' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {noticia.tipo === 'feature' ? 'Nueva Función' : 'Aviso'}
                    </span>
                    <span className="text-sm font-medium text-gray-600">{noticia.fecha}</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{noticia.titulo}</h4>
                  <p className="text-base text-gray-900 leading-relaxed">{noticia.contenido}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
