import React, { useEffect, useRef } from 'react';

// Mock activity data
const mockActivities = [
  { id: 1, type: 'note', text: 'Nota agregada: Cliente muy interesado en la nueva línea de productos.', time: 'Hoy, 10:30 AM' },
  { id: 2, type: 'call', text: 'Llamada realizada: Duración 5 minutos.', time: 'Ayer, 16:45 PM' },
  { id: 3, type: 'email', text: 'Email enviado: Propuesta comercial.', time: '23 Sep, 09:15 AM' },
];

/**
 * LeadDetailModal component displays comprehensive details of a lead in a sliding drawer.
 *
 * @param {Object} props
 * @param {Object} props.lead - The lead data object.
 * @param {Object} props.stage - The stage configuration object for the current lead.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {Function} props.onClose - Callback function to close the modal.
 * @param {Array} props.stages - Array of all stages for the progress indicator.
 * @returns {React.JSX.Element|null} The LeadDetailModal component.
 */
export const LeadDetailModal = ({ lead, stage, isOpen, onClose, stages = [] }) => {
  const modalRef = useRef(null);

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // Focus trap initial focus
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !lead) return null;

  // Ensure robust defaults for lead properties
  const safeLead = {
    name: lead.name || 'Cliente sin nombre',
    company: lead.company || 'Empresa desconocida',
    value: lead.value || 0,
    email: lead.email || 'No especificado',
    phone: lead.phone || 'No especificado',
    assignee: lead.assignee || 'Sin asignar',
    createdAt: lead.createdAt || 'Fecha desconocida',
    tags: lead.tags || [],
    ...lead
  };

  const safeStage = stage || { name: 'Sin etapa', color: 'bg-gray-200', text: 'text-gray-800' };

  // Initials for avatar
  const initials = safeLead.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Progress indicator logic
  const currentStageIndex = stages.findIndex((s) => s.id === safeStage.id) !== -1 
    ? stages.findIndex((s) => s.id === safeStage.id) 
    : 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex="-1"
        className="w-full max-w-[400px] h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out overflow-hidden outline-none translate-x-0"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
      >
        {/* Header section */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${safeStage.color} ${safeStage.text}`}>
              {initials}
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-bold text-gray-900">{safeLead.name}</h2>
              <p className="text-sm text-gray-500">{safeLead.company}</p>
              <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${safeStage.color} ${safeStage.text}`}>
                {safeStage.name}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Lead value section */}
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Valor del trato</div>
            <div className="text-3xl font-bold text-gray-900 mb-4">
              ${safeLead.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            
            {/* Stage progress indicator */}
            {stages.length > 0 && (
              <div className="flex items-center gap-2 mt-4">
                {stages.map((s, idx) => (
                  <div key={s.id || idx} className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div 
                      className={`h-full ${s.color || 'bg-blue-500'} transition-all duration-300`}
                      style={{ width: idx <= currentStageIndex ? '100%' : '0%' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact info section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Información de Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
              <div className="flex items-center text-sm">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-500">Creado: {safeLead.createdAt}</span>
              </div>
            </div>
          </div>

          {/* Tags section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Etiquetas</h3>
            <div className="flex flex-wrap gap-2 items-center">
              {safeLead.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span>
                  {tag}
                </span>
              ))}
              <button className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200 border-dashed">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Añadir
              </button>
            </div>
          </div>

          {/* Activity/Notes section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Actividad</h3>
            
            {/* Note input */}
            <div className="mb-6 relative">
              <textarea 
                className="w-full text-sm border border-gray-300 rounded-lg p-3 pb-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none resize-none"
                rows="3"
                placeholder="Escribe una nota sobre este lead..."
              ></textarea>
              <div className="absolute bottom-2 right-2 flex gap-2">
                <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors" title="Añadir adjunto">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors">
                  Guardar
                </button>
              </div>
            </div>

            {/* Activity feed */}
            <div className="space-y-4">
              {mockActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    activity.type === 'call' ? 'bg-green-100 text-green-600' :
                    activity.type === 'email' ? 'bg-blue-100 text-blue-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {activity.type === 'call' && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    )}
                    {activity.type === 'email' && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                    {activity.type === 'note' && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-100 flex-1">
                    <p className="text-gray-800">{activity.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons at bottom */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm">
            Mover a siguiente etapa
          </button>
          <div className="flex gap-2">
            <button className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2.5 px-4 rounded-lg transition-colors">
              Editar
            </button>
            <button className="px-4 py-2.5 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;

