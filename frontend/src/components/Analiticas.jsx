import React, { useState, useEffect } from 'react';

const Analiticas = () => {
  const [rangoFecha, setRangoFecha] = useState('Últimos 7 días');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/analytics/dashboard`, {
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          }
        });
        if (!res.ok) throw new Error('Error al cargar analíticas');
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-6">Cargando analíticas...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  const { totalLeads = 0, totalConversations = 0, totalTasks = 0, completedTasks = 0, conversionRate = 0, leadsByStage = [] } = dashboardData || {};

  const estadisticas = [
    { id: 1, titulo: 'Total Leads', valor: totalLeads, incremento: '', tendencia: 'neutral' },
    { id: 2, titulo: 'Total Conversaciones', valor: totalConversations, incremento: '', tendencia: 'neutral' },
    { id: 3, titulo: 'Total Tareas', valor: totalTasks, incremento: '', tendencia: 'neutral' },
    { id: 4, titulo: 'Tasa de conversión', valor: `${conversionRate}%`, incremento: '', tendencia: 'neutral' },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Analíticas</h2>
        
        <div className="flex items-center gap-4">
          <select 
            value={rangoFecha}
            onChange={(e) => setRangoFecha(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-gray-700"
          >
            <option value="Últimos 7 días">Últimos 7 días</option>
            <option value="Este mes">Este mes</option>
            <option value="Este año">Este año</option>
          </select>
          
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar Reporte (PDF/CSV)
          </button>
        </div>
      </div>
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {estadisticas.map((est) => (
          <div key={est.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <h3 className="text-sm font-medium text-gray-600 mb-4">{est.titulo}</h3>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-gray-900">{est.valor}</span>
              {est.incremento && (
                <span className={`text-sm font-medium ${
                  est.tendencia === 'positiva' ? 'text-green-600' : est.tendencia === 'negativa' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {est.incremento}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Funnel de Ventas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Funnel de Ventas</h3>
        <div className="flex flex-col items-center">
          
          {leadsByStage.map((stage, idx) => {
            const widthClass = idx === 0 ? "max-w-2xl" : idx === 1 ? "max-w-xl" : idx === 2 ? "max-w-md" : "max-w-xs";
            const bgClass = idx === leadsByStage.length - 1 ? "bg-indigo-500" : `bg-indigo-${100 + (idx * 100)}`;
            const textColor = idx === leadsByStage.length - 1 ? "text-white" : "text-indigo-800";
            const valColor = idx === leadsByStage.length - 1 ? "text-white" : "text-indigo-900";
            const roundedClass = idx === 0 ? "rounded-t-lg" : idx === leadsByStage.length - 1 ? "rounded-b-lg" : "rounded-sm";

            return (
              <React.Fragment key={stage.stage || idx}>
                <div className={`w-full ${widthClass} ${bgClass} ${roundedClass} py-4 px-6 flex justify-between items-center ${idx < leadsByStage.length - 1 ? 'mb-1' : ''}`}>
                  <span className={`${textColor} font-semibold`}>{stage.stage || 'Etapa'}</span>
                  <span className={`${valColor} font-bold text-xl`}>{stage.count || 0}</span>
                </div>
                {idx < leadsByStage.length - 1 && (
                  <div className="text-xs text-gray-500 my-1 font-medium bg-gray-50 px-2 py-1 rounded-full">⬇</div>
                )}
              </React.Fragment>
            );
          })}
          
          {leadsByStage.length === 0 && (
            <div className="text-gray-500">No hay datos del funnel disponibles.</div>
          )}

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Tasa de conversión total: <span className="font-bold text-gray-900">{conversionRate}%</span></p>
          </div>
        </div>
      </div>
      
      {/* Sección principal de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento General</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm text-gray-600">Tareas Completadas</h4>
              <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm text-gray-600">Tareas Pendientes</h4>
              <p className="text-2xl font-bold text-gray-900">{totalTasks - completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Origen de Tráfico</h3>
          <div className="h-72 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center gap-4">
            <div className="w-32 h-32 rounded-full border-8 border-indigo-500 border-t-blue-400 border-r-green-400"></div>
            <p className="text-gray-600 text-sm">Gráfico circular (Espacio reservado)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analiticas;
