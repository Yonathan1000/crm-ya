import React, { useState } from 'react';

export default function BotBuilder({ onClose }) {
  const [name, setName] = useState('Mi Nuevo Bot');
  const [triggerType, setTriggerType] = useState('NEW_CONVERSATION');
  const [triggerCondition, setTriggerCondition] = useState({ keyword: '' });
  const [actionPayload, setActionPayload] = useState({ message: '' });

  const handleSave = async () => {
    try {
      const conditionToSave = ['MESSAGE_CONTAINS', 'IG_COMMENT', 'TIKTOK_MESSAGE'].includes(triggerType) ? triggerCondition : {};
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/automations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name,
          triggerType,
          triggerCondition: JSON.stringify(conditionToSave),
          actionType: 'SEND_MESSAGE',
          actionPayload: JSON.stringify(actionPayload)
        })
      });
      
      if (response.ok) {
        onClose();
      } else {
        console.error('Failed to save automation');
      }
    } catch (error) {
      console.error('Error saving automation:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-4 w-1/3">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-medium text-sm transition">
            Cerrar
          </button>
        </div>
        <div className="w-1/3 flex justify-center">
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="text-center font-bold text-lg text-gray-800 border-none bg-transparent focus:ring-0 w-full outline-none"
            placeholder="Nombre del bot"
          />
        </div>
        <div className="w-1/3 flex justify-end">
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-sm transition">
            Guardar e Instalar
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-y-auto p-6 shadow-sm z-10">
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Ajustes del Bot</h3>
          
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-800 mb-3">Canales Vinculados</label>
            <div className="flex flex-col gap-3">
              {['WhatsApp', 'Instagram', 'Messenger', 'TikTok'].map(ch => (
                <label key={ch} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors" />
                  <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{ch}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-800 mb-2">Disparador (Trigger)</label>
            <select 
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            >
              <option value="NEW_CONVERSATION">Mensaje entrante</option>
              <option value="MESSAGE_CONTAINS">Palabra clave en mensaje</option>
              <option value="STAGE_CHANGE">Cambio de etapa en Pipeline</option>
              <option value="IG_COMMENT">Palabra clave en comentarios (IG)</option>
              <option value="IG_STORY_MENTION">Mención en Historia (IG)</option>
              <option value="IG_NEW_FOLLOWER">Nuevo Seguidor (IG)</option>
              <option value="TIKTOK_MESSAGE">Mensaje en TikTok</option>
            </select>
          </div>

          {['MESSAGE_CONTAINS', 'IG_COMMENT', 'TIKTOK_MESSAGE'].includes(triggerType) && (
            <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <label className="block text-sm font-semibold text-blue-900 mb-2">Palabra clave</label>
              <input 
                type="text" 
                value={triggerCondition.keyword}
                onChange={(e) => setTriggerCondition({ keyword: e.target.value })}
                placeholder="Ej: precio"
                className="w-full border border-blue-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              />
            </div>
          )}
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-gray-100 flex flex-col items-center justify-start pt-16 overflow-y-auto relative">
          
          {/* Node 1: Trigger */}
          <div className="bg-white border-2 border-blue-500 rounded-2xl w-80 shadow-md flex flex-col relative z-10 transition-transform hover:scale-[1.02]">
            <div className="bg-blue-50 border-b border-blue-100 p-3 rounded-t-xl flex items-center gap-2">
              <span className="text-blue-600 text-lg">⚡</span>
              <span className="text-sm font-bold text-blue-900">Disparador</span>
            </div>
            <div className="p-5">
              <p className="text-sm font-medium text-gray-700 text-center">
                {triggerType === 'NEW_CONVERSATION' && 'Cualquier mensaje entrante'}
                {['MESSAGE_CONTAINS', 'IG_COMMENT', 'TIKTOK_MESSAGE'].includes(triggerType) && (triggerCondition.keyword ? `Palabra clave: "${triggerCondition.keyword}"` : 'Palabra clave requerida')}
                {triggerType === 'STAGE_CHANGE' && 'Cambio de etapa en Pipeline'}
                {triggerType === 'IG_STORY_MENTION' && 'Cuando te mencionen en historia'}
                {triggerType === 'IG_NEW_FOLLOWER' && 'Cuando recibas nuevo seguidor'}
              </p>
            </div>
          </div>

          {/* Arrow */}
          <div className="h-12 w-0.5 bg-gray-300 relative">
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 border-r-2 border-b-2 border-gray-300 rotate-45"></div>
          </div>

          {/* Node 2: Action */}
          <div className="bg-white border-2 border-green-500 rounded-2xl w-80 shadow-md flex flex-col mt-1 relative z-10 transition-transform hover:scale-[1.02]">
            <div className="bg-green-50 border-b border-green-100 p-3 rounded-t-xl flex items-center gap-2">
              <span className="text-green-600 text-lg">✉️</span>
              <span className="text-sm font-bold text-green-900">Enviar Mensaje</span>
            </div>
            <div className="p-4 bg-white rounded-b-xl">
              <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Respuesta del bot</label>
              <textarea 
                rows={4}
                value={actionPayload.message}
                onChange={(e) => setActionPayload({ message: e.target.value })}
                placeholder="Escribe el mensaje aquí..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-500 outline-none resize-none transition-shadow"
              ></textarea>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
