import React, { useEffect, useRef, useState } from 'react';

/**
 * LeadDetailModal component displays comprehensive details of a lead in a sliding drawer.
 */
export default function LeadDetailModal({ lead, stage, isOpen, onClose, stages = [] }) {
  const modalRef = useRef(null);
  const [activities, setActivities] = useState([]);
  const [noteText, setNoteText] = useState('');

  const fetchActivities = async () => {
    if (!lead || !lead.id) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/interactions/client/${lead.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      if (modalRef.current) {
        modalRef.current.focus();
      }
      fetchActivities();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, lead]);

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ tipo: 'Nota', notas: noteText, client_id: lead.id })
      });
      setNoteText('');
      fetchActivities();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  if (!isOpen || !lead) return null;

  const safeLead = {
    name: lead.name || lead.nombre || 'Cliente sin nombre',
    company: lead.company || lead.empresa || 'Empresa desconocida',
    value: lead.value || 0,
    email: lead.email || 'No especificado',
    phone: lead.phone || lead.telefono || 'No especificado',
    assignee: lead.assignee || 'Sin asignar',
    createdAt: lead.createdAt || lead.fecha_creacion || 'Fecha desconocida',
    tags: lead.tags || [],
    ...lead
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex="-1"
        className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0 outline-none"
      >
        <div className="flex-shrink-0 border-b border-gray-200 px-6 py-5 flex items-center justify-between bg-gray-50">
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-gray-900 leading-tight">
              {safeLead.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{safeLead.company}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Cerrar modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Etapa Actual</span>
              <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                {stage?.name || safeLead.estado_lead || 'Sin etapa'}
              </span>
            </div>
          </div>

          <div className="mb-8 bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-sm">
                <svg className="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
                </svg>
                {safeLead.email !== 'No especificado' ? (
                  <a href={`mailto:${safeLead.email}`} className="text-blue-600 hover:underline">{safeLead.email}</a>
                ) : (
                  <span className="text-gray-500">{safeLead.email}</span>
                )}
              </div>
              <div className="flex items-center text-sm">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {safeLead.phone !== 'No especificado' ? (
                  <a href={`tel:${safeLead.phone}`} className="text-blue-600 hover:underline">{safeLead.phone}</a>
                ) : (
                  <span className="text-gray-500">{safeLead.phone}</span>
                )}
              </div>
              <div className="flex items-center text-sm">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Asignado a:</span>
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                    {safeLead.assignee.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-900 font-medium">{safeLead.assignee}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Etiquetas</h3>
            <div className="flex flex-wrap gap-2 items-center">
              {safeLead.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Actividad</h3>
            
            <div className="mb-6 relative">
              <textarea 
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg p-3 pb-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none resize-none"
                rows="3"
                placeholder="Escribe una nota sobre este lead..."
              ></textarea>
              <div className="absolute bottom-2 right-2 flex gap-2">
                <button onClick={handleSaveNote} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors">
                  Guardar
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {activities.length === 0 && <p className="text-gray-500 text-sm">No hay actividades recientes.</p>}
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    activity.tipo === 'Llamada' ? 'bg-green-100 text-green-600' :
                    activity.tipo === 'Email' ? 'bg-blue-100 text-blue-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {activity.tipo === 'Llamada' && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    )}
                    {activity.tipo === 'Email' && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                    {(activity.tipo !== 'Llamada' && activity.tipo !== 'Email') && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800"><span className="font-medium text-gray-900">{activity.tipo}:</span> {activity.notas}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(activity.fecha).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
