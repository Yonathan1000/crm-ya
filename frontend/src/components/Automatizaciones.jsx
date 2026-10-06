import React, { useState, useEffect } from 'react';
import BotBuilder from './BotBuilder';

export default function Automatizaciones() {
  const [automations, setAutomations] = useState([]);
  const [filter, setFilter] = useState('Todas las plantillas');
  const [showBuilder, setShowBuilder] = useState(false);
  
  const fetchAutomations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/automations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAutomations(data);
    } catch (error) {
      console.error('Error al cargar automatizaciones:', error);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/automations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (response.ok) {
        setAutomations(automations.map(auto => 
          auto.id === id ? { ...auto, isActive: newStatus, status: newStatus } : auto
        ));
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const simulateWebhook = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/automations/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: "IG_NEW_FOLLOWER", payload: { username: "Tester" } })
      });
      alert('Evento simulado enviado: IG_NEW_FOLLOWER');
    } catch (error) {
      console.error('Error al simular webhook:', error);
    }
  };

  const channels = ['Seleccionar todos', 'WhatsApp Business', 'Telegram', 'Instagram', 'TikTok', 'Messenger', 'Correo', 'Chat en vivo'];
  const filters = ['Todas las plantillas', 'Generar leads', 'Información comercial', 'Soporte', 'Ventas'];

  const getGradient = (index) => {
    const gradients = [
      'bg-gradient-to-br from-green-400 to-green-600',
      'bg-gradient-to-br from-pink-400 to-pink-600',
      'bg-gradient-to-br from-orange-400 to-orange-600',
      'bg-gradient-to-br from-blue-400 to-blue-600',
      'bg-gradient-to-br from-purple-400 to-purple-600',
      'bg-gradient-to-br from-teal-400 to-teal-600',
      'bg-gradient-to-br from-yellow-400 to-yellow-600',
      'bg-gradient-to-br from-red-400 to-red-600',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen p-8 font-sans flex text-gray-800" style={{ backgroundColor: '#F4F5F7' }}>
      {/* Left Sidebar */}
      <div className="w-1/4 pr-8 flex flex-col">
        <h2 className="text-3xl font-extrabold mb-6 text-gray-900">Crear un bot</h2>
        
        <button onClick={() => setShowBuilder(true)} className="w-full bg-white border border-gray-200 text-gray-800 py-3 rounded-xl font-bold mb-10 hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm transition">
          <span className="text-xl leading-none">+</span> Comenzar desde cero
        </button>
        
        <h3 className="font-bold text-gray-900 mb-4 text-lg">Canales</h3>
        <div className="flex flex-col gap-4">
          {channels.map((ch, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors" 
                defaultChecked={ch === 'Seleccionar todos'} 
              />
              <span className={`text-sm font-medium ${ch === 'Seleccionar todos' ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                {ch}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/4 flex flex-col pl-4">
        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((f, i) => (
            <button 
              key={i} 
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === f ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-sm'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* AI Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 mb-8 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <span className="text-2xl block">✨</span>
            </div>
            <div>
              <h4 className="font-bold text-lg">Prueba el agente de IA</h4>
              <p className="text-sm text-indigo-100 font-medium">comunicación automatizada con clientes 24/7</p>
            </div>
          </div>
          <button onClick={() => alert("Simulador de flujos próximamente")} className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition transform hover:scale-105">\n            Probar\n          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {automations.map((automation, index) => {
            const isActive = automation.isActive ?? automation.status;
            return (
              <div key={automation.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-72 hover:shadow-md transition-shadow relative">
                {/* Top Half Visual */}
                <div className={`h-32 ${getGradient(index)} p-4 flex flex-col justify-between items-center relative overflow-hidden`}>
                  {/* Toggle positioned top right */}
                  <div className="absolute top-3 right-3 z-10">
                    <button 
                      onClick={() => toggleStatus(automation.id, isActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shadow-sm ${isActive ? 'bg-green-400' : 'bg-black/20'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition shadow-sm ${isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  
                  {/* Dynamic Graphics based on Trigger Type */}
                  <div className="flex-grow flex items-center justify-center w-full mt-2">
                    {automation.triggerType === 'NEW_CONVERSATION' && (
                      <div className="bg-white/90 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 shadow-sm flex items-center gap-2">
                        <span>🤖</span> ¿En qué ayudo?
                      </div>
                    )}
                    {automation.triggerType === 'STAGE_CHANGE' && (
                      <div className="bg-white/90 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 shadow-sm flex items-center gap-2">
                        <span>❓</span> ¿Aún vienes mañana?
                      </div>
                    )}
                    {(automation.triggerType === 'IG_NEW_FOLLOWER' || automation.triggerType === 'IG_STORY_MENTION') && (
                      <div className="flex flex-col items-center gap-1">
                        <div className="bg-white px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                          <span className="text-pink-500">IG</span> Bienvenido(a)!
                        </div>
                      </div>
                    )}
                    {(automation.triggerType === 'MESSAGE_CONTAINS' && automation.name.includes('llamada')) && (
                      <div className="bg-[#B4F090] px-3 py-1.5 rounded-full text-sm font-bold text-gray-900 shadow-sm border border-green-200">
                        📞 +1-234-567-89
                      </div>
                    )}
                    {(automation.triggerType === 'TIKTOK_MESSAGE') && (
                      <div className="bg-white px-4 py-2 rounded-xl text-xs font-medium text-gray-800 shadow-sm flex items-center gap-2">
                        <span className="bg-black text-white text-[10px] px-1 rounded">TikTok</span> ¡Deja tu número!
                      </div>
                    )}
                    {automation.triggerType === 'IG_COMMENT' && (
                      <div className="bg-white px-4 py-2 rounded-xl text-xs font-medium text-gray-700 shadow-sm w-[80%] text-center">
                        Tu código es: DESC20
                      </div>
                    )}
                    {automation.triggerType === 'MESSAGE_CONTAINS' && !automation.name.includes('llamada') && (
                      <div className="bg-white/90 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 shadow-sm flex items-center gap-2">
                        <span>📅</span> Reserva confirmada
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Bottom Half */}
                <div className="p-5 flex flex-col flex-grow bg-white">
                  <h3 className="font-semibold text-gray-800 text-[15px] line-clamp-3 leading-snug" title={automation.name}>
                    {automation.name}
                  </h3>
                  
                  <div className="mt-auto">
                    <button onClick={() => alert("Instalando plantilla...")} className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-blue-600 text-sm font-bold rounded-xl border border-gray-200 transition-colors">\n                      Instalar\n                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Webhook Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={simulateWebhook}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-3.5 shadow-xl font-bold flex items-center gap-2 transition-transform transform hover:scale-105 ring-4 ring-blue-600/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Simular Evento
        </button>
      </div>
      {showBuilder && <BotBuilder onClose={() => { setShowBuilder(false); fetchAutomations(); }} />}
    </div>
  );
}
