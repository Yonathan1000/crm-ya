import React, { useState, useEffect } from 'react';

export default function Plantillas() {
  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, content })
      });
      setName('');
      setContent('');
      fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/templates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  return (
    <div className="flex h-full w-full gap-4 text-gray-800">
      {/* Columna Izquierda: Lista de Plantillas */}
      <div className="w-1/2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-[#F4F5F7]">
          <h2 className="text-lg font-bold text-gray-800">Mis Plantillas</h2>
          <p className="text-sm text-gray-500">Administra tus respuestas rápidas para usar con el comando /</p>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {templates.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-10">No hay plantillas creadas. ¡Crea tu primera plantilla a la derecha!</p>
          ) : (
            templates.map((tpl) => (
              <div key={tpl.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition bg-white relative group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-sm inline-block">/{tpl.name}</h3>
                  <button 
                    onClick={() => handleDelete(tpl.id)}
                    className="text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                    title="Eliminar plantilla"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{tpl.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Columna Derecha: Crear Plantilla */}
      <div className="w-1/2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-[#F4F5F7]">
          <h2 className="text-lg font-bold text-gray-800">Nueva Plantilla</h2>
          <p className="text-sm text-gray-500">Crea una nueva respuesta rápida</p>
        </div>
        <div className="p-6 flex-1">
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del comando</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 font-bold">/</span>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                  placeholder="saludo" 
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Solo letras, números, guiones y guiones bajos.</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contenido de la plantilla</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="¡Hola! ¿En qué puedo ayudarte hoy?" 
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[150px] resize-y"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <button 
                type="button" 
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Adjuntar archivo
              </button>
              
              <button 
                type="submit" 
                disabled={!name.trim() || !content.trim()}
                className="ml-auto inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar Plantilla
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
