/**
 * @fileoverview PipelineBoard — Tablero Kanban de pipeline de ventas inspirado en YA CRM.
 *
 * Muestra un tablero horizontal con columnas que representan etapas del proceso
 * de ventas. Cada columna contiene tarjetas de leads con información del cliente,
 * valor del lead, etiquetas, avatares con iniciales y acciones rápidas al pasar
 * el cursor (teléfono, email, menú).
 *
 * @module PipelineBoard
 * @requires react
 *
 * @example
 * import PipelineBoard from './components/PipelineBoard';
 *
 * function App() {
 *   return <PipelineBoard />;
 * }
 */

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader2, KanbanSquare } from 'lucide-react';
import LeadDetailModal from './LeadDetailModal';

/* ──────────────────────────── Iconos SVG inline ──────────────────────────── */

/** Icono de teléfono para acción rápida */
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

/** Icono de email para acción rápida */
const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

/** Icono de menú (tres puntos) para acciones adicionales */
const MoreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01" />
  </svg>
);

/** Icono de "+" para el botón de añadir lead */
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

/* ──────────────────────────── Configuración de columnas ──────────────────── */

/**
 * Definición de las etapas del pipeline con sus colores de acento.
 * @type {Array<{id: string, title: string, borderColor: string, textColor: string, bgAccent: string}>}
 */
const getColorConfig = (colorName) => {
  const configs = {
    blue: { borderColor: 'border-t-[#DBEAFE]', textColor: 'text-[#3B82F6]', bgAccent: 'bg-[#DBEAFE]', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700' },
    yellow: { borderColor: 'border-t-[#FEF3C7]', textColor: 'text-[#F59E0B]', bgAccent: 'bg-[#FEF3C7]', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700' },
    orange: { borderColor: 'border-t-[#FFEDD5]', textColor: 'text-[#F97316]', bgAccent: 'bg-[#FFEDD5]', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700' },
    green: { borderColor: 'border-t-[#DCFCE7]', textColor: 'text-[#22C55E]', bgAccent: 'bg-[#DCFCE7]', badgeBg: 'bg-green-100', badgeText: 'text-green-700' },
    red: { borderColor: 'border-t-[#FEE2E2]', textColor: 'text-[#EF4444]', bgAccent: 'bg-[#FEE2E2]', badgeBg: 'bg-red-100', badgeText: 'text-red-700' },
  };
  return configs[colorName] || configs.blue;
};

/* ──────────────────────────── Helpers ─────────────────────────────────────── */

/**
 * Formatea un valor numérico como moneda (USD simplificado).
 * @param {number} value — Monto a formatear.
 * @returns {string} Cadena con formato $X,XXX
 */
const formatCurrency = (value) =>
  `$${value.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`;

/* ──────────────────────────── Sub-componentes ─────────────────────────────── */

/**
 * Tarjeta individual de un lead dentro del tablero.
 *
 * @param {Object}  props
 * @param {Object}  props.lead — Datos del lead.
 * @param {Object}  props.stage — Configuración de la etapa (colores).
 * @param {Function} props.onCardClick — Callback al hacer click en la tarjeta.
 * @returns {JSX.Element}
 */
function LeadCard({ lead, stage, onCardClick }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ leadId: lead.id, fromStage: stage.id }));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <article
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onCardClick && onCardClick(lead)}
      role="listitem"
      aria-label={`Lead: ${lead.name}, ${formatCurrency(lead.value)}`}
      className={`group relative bg-white border border-gray-200 p-4 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer hover:bg-gray-50
                 ${isDragging ? 'opacity-50 scale-95' : ''}`}
    >
      {/* ── Fila principal: avatar + datos ── */}
      <div className="flex items-start gap-3">
        {/* Avatar con iniciales */}
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center
                      text-xs font-semibold tracking-wide text-white
                      ${stage.id === 'lead_nuevo' ? 'bg-blue-500'
                        : stage.id === 'en_contacto' ? 'bg-amber-500'
                        : stage.id === 'propuesta' ? 'bg-orange-500'
                        : 'bg-green-500'}`}
          aria-hidden="true"
        >
          {lead.avatar}
        </div>

        {/* Contenido textual */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate leading-tight">
            {lead.name}
          </h4>
          <p className="text-xs text-gray-500 truncate mt-0.5">{lead.company}</p>
        </div>

        {/* Valor del lead */}
        <span className="flex-shrink-0 text-sm font-bold text-gray-800">
          {formatCurrency(lead.value)}
        </span>
      </div>

      {/* ── Etiquetas / Tags ── */}
      {lead.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3" aria-label="Etiquetas del lead">
          {lead.tags.map((tag) => (
            <span
              key={tag.label}
              className={`inline-flex items-center gap-1 text-[11px] font-medium text-gray-600
                          bg-gray-50 rounded-full px-2 py-0.5`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${tag.color}`} aria-hidden="true" />
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {/* ── Pie: tiempo + asignado + acciones hover ── */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">{lead.timeAgo}</span>
          <span className="text-[11px] text-gray-300">•</span>
          <span className="text-[11px] text-gray-400">{lead.assignedTo}</span>
        </div>

        {/* Acciones rápidas – visibles al hover */}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100
                      transition-opacity duration-150"
          aria-label="Acciones rápidas"
        >
          <button
            type="button"
            aria-label={`Llamar a ${lead.name}`}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-500
                       transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <PhoneIcon />
          </button>
          <button
            type="button"
            aria-label={`Enviar email a ${lead.name}`}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-500
                       transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <EmailIcon />
          </button>
          <button
            type="button"
            aria-label={`Más opciones para ${lead.name}`}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600
                       transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreIcon />
          </button>
        </div>
      </div>
    </article>
  );
}

/**
 * Columna del pipeline que representa una etapa de venta.
 *
 * @param {Object}   props
 * @param {Object}   props.stage — Configuración de la etapa.
 * @param {Object[]} props.leads — Leads que pertenecen a esta etapa.
 * @param {Function} props.onMoveLead — Callback para mover leads por arrastre.
 * @param {Function} props.onCardClick — Callback para el click en leads.
 * @param {Function} props.onNewLead — Callback para añadir un nuevo lead.
 * @returns {JSX.Element}
 */
function PipelineColumn({ stage, leads, onMoveLead, onCardClick, onNewLead }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const totalValue = leads.reduce((sum, l) => sum + l.value, 0);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.leadId && data.fromStage) {
        onMoveLead(data.leadId, data.fromStage, stage.id);
      }
    } catch (err) {
      console.error('Error parsing drag data:', err);
    }
  };

  const dragBorderClass = stage.textColor.replace('text-', 'border-');

  return (
    <section
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label={`Etapa: ${stage.title}`}
      className={`flex-shrink-0 w-[320px] md:w-auto md:flex-1 min-w-[280px] max-w-[380px]
                  flex flex-col bg-gray-100/80 rounded-xl border border-gray-200 border-t-4 ${stage.borderColor}
                  transition-colors duration-200
                  ${isDragOver 
                    ? `border-dashed border-2 border-b-2 border-l-2 border-r-2 border-t-4 ${dragBorderClass} bg-gray-200/80` 
                    : ''}`}
    >
      {/* ── Encabezado de columna ── */}
      <header className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className={`text-sm font-bold ${stage.textColor} tracking-wide uppercase`}>
              {stage.title}
            </h3>
            <span
              className={`inline-flex items-center justify-center text-[11px] font-bold
                          min-w-[22px] h-[22px] rounded-full px-1.5
                          ${stage.badgeBg} ${stage.badgeText}`}
              aria-label={`${leads.length} leads`}
            >
              {leads.length}
            </span>
          </div>
          <span className="text-xs font-semibold text-gray-700 bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-sm">
            {formatCurrency(totalValue)}
          </span>
        </div>
      </header>

      {/* ── Lista de tarjetas ── */}
      <div
        role="list"
        aria-label={`Leads en ${stage.title}`}
        className="flex-1 overflow-y-auto px-3 pb-2 space-y-2.5
                   scrollbar-thin scrollbar-thumb-gray-300 min-h-[150px]"
      >
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} stage={stage} onCardClick={onCardClick} />
        ))}
      </div>

      {/* ── Botón añadir lead ── */}
      <div className="px-3 pb-3 pt-1">
        <button
          type="button"
          onClick={() => onNewLead(stage.id)}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg
                     text-xs font-medium text-gray-400 hover:text-gray-600
                     hover:bg-white hover:shadow-sm border border-dashed border-gray-300
                     hover:border-gray-400 transition-all duration-150"
          aria-label={`Añadir lead a ${stage.title}`}
        >
          <PlusIcon />
          Añadir lead
        </button>
      </div>
    </section>
  );
}

/* ──────────────────────────── Componente principal ─────────────────────────── */

/**
 * PipelineBoard — Tablero Kanban de pipeline de ventas.
 *
 * Renderiza un tablero con desplazamiento horizontal (scroll) en móvil y
 * distribución en cuadrícula (grid) en escritorio. Cada columna representa
 * una etapa del proceso de ventas y contiene tarjetas de leads.
 *
 * @returns {JSX.Element} Tablero Kanban completo.
 */
export function PipelineBoard() {
  const [stages, setstages] = useState([]);
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch stages
      const stagesRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/pipeline-stages`, { headers });
      let loadedstages = [];
      if (stagesRes.ok) {
        const dbstages = await stagesRes.json();
        loadedstages = dbstages.map(s => ({
          id: s.id,
          title: s.name,
          ...getColorConfig(s.color)
        }));
        setstages(loadedstages);
      }

      // 2. Fetch Leads
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/clients`, { headers });
      if (!response.ok) throw new Error('Falló la carga de leads');
      const data = await response.json();
      
      const formattedLeads = data.map(client => {
        let matchedStageId = loadedstages.length > 0 ? loadedstages[0].id : 'lead_nuevo';
        if (client.estado_lead) {
           const found = loadedstages.find(s => 
             s.id === client.estado_lead || 
             s.title.toLowerCase() === client.estado_lead.toLowerCase().trim()
           );
           if (found) matchedStageId = found.id;
        }

        return {
          id: client.id,
          name: client.nombre || client.name || 'Sin Nombre',
          company: client.empresa || client.company || 'Sin Empresa',
          value: client.valor || 0,
          email: client.email || '',
          phone: client.phone || '',
          avatar: (client.nombre || client.name || 'S')[0].toUpperCase(),
          tags: [], // Could be populated from DB if available
          timeAgo: 'Reciente',
          assignedTo: 'Sin Asignar',
          stage: matchedStageId
        };
      });
      setLeads(formattedLeads);
    } catch (err) {
      console.error('Error al cargar leads:', err);
      toast.error('Error al cargar leads');
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLeads(leads);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredLeads(leads.filter(l => 
        l.name.toLowerCase().includes(lowerQuery) || 
        l.company.toLowerCase().includes(lowerQuery)
      ));
    }
  }, [leads, searchQuery]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleMoveLead = async (leadId, fromStage, toStage) => {
    if (fromStage === toStage) return;
    
    const lead = leads.find(l => String(l.id) === String(leadId));
    if (!lead) return;

    const toStageData = stages.find(s => s.id === toStage);

    // 1. Actualización Optimista (La UI se actualiza instantáneamente)
    setLeads(prev => prev.map(l => 
      String(l.id) === String(leadId) ? { ...l, stage: toStage } : l
    ));

    toast.success(`${lead.name} movido a ${toStageData.title}`);

    // 2. Sincronización Real con el Backend
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/clients/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ estado_lead: toStage })
      });

      if (!response.ok) {
        throw new Error('Falló la sincronización con el servidor');
      }
    } catch (error) {
      console.error('Error al actualizar el lead en BD:', error);
      // Revertimos la UI si el servidor falló
      setLeads(prev => prev.map(l => 
        String(l.id) === String(leadId) ? { ...l, stage: fromStage } : l
      ));
      toast.error(`Error de red al mover a ${lead.name}`);
    }
  };

  const handleNewLead = async (stageId = 'lead_nuevo') => {
    const nombre = window.prompt('Nombre del nuevo lead:');
    if (!nombre) return;
    const empresa = window.prompt('Empresa del nuevo lead:');
    if (!empresa) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          nombre,
          empresa,
          estado_lead: stageId
        })
      });

      if (!response.ok) throw new Error('Error al crear lead en el servidor');

      toast.success('Lead creado exitosamente');
      
      // Refetch leads to see the newly added lead with its generated ID
      fetchLeads();
    } catch (error) {
      console.error(error);
      toast.error('Error al crear lead');
    }
  };

  const handleCardClick = (lead) => {
    setSelectedLead(lead);
    const stage = stages.find(s => s.id === lead.stage);
    setSelectedStage(stage);
  };

  const closeLeadModal = () => {
    setSelectedLead(null);
    setSelectedStage(null);
  };

  const exportToCSV = () => {
    toast.success('Exportando pipeline a CSV...');
  };

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* ── Barra superior y Action Bar ── */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Pipeline de Ventas</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {filteredLeads.length} leads · Valor total:{' '}
            <span className="font-semibold text-gray-700">
              {formatCurrency(filteredLeads.reduce((s, l) => s + l.value, 0))}
            </span>
          </p>
        </div>

        {/* Action Bar (Búsqueda, Filtros, Exportar, Nuevo Lead) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar leads..." 
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full md:w-auto"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filtros Dropdown */}
          <select 
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            defaultValue="filtros"
          >
            <option value="filtros" disabled>Filtros rápidos</option>
            <option value="mis_leads">Asignados a mí</option>
            <option value="sin_asignar">Sin asignar</option>
            <option value="valor_alto">Valor Alto (&gt;$1000)</option>
            <option value="recientes">Creados recientemente</option>
          </select>

          {/* Exportar CSV */}
          <button 
            onClick={exportToCSV}
            className="text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar CSV
          </button>

          {/* Nuevo Lead */}
          <button
            type="button"
            onClick={() => handleNewLead('lead_nuevo')}
            className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700
                       px-4 py-1.5 rounded-md transition-colors shadow-sm flex items-center gap-1.5"
          >
            <PlusIcon />
            Nuevo lead
          </button>
        </div>
      </header>

      {/* ── Tablero de columnas ── */}
      <main className="p-4 md:p-6 max-w-screen-2xl mx-auto mt-2">
        <div
          className="flex gap-4 md:gap-5 overflow-x-auto pb-4
                     md:grid md:grid-cols-4 md:overflow-x-visible
                     snap-x snap-mandatory md:snap-none"
          role="region"
          aria-label="Tablero de pipeline de ventas"
        >
          {stages.map((stage) => (
            <div key={stage.id} className="snap-start">
              <PipelineColumn
                stage={stage}
                leads={filteredLeads.filter((l) => l.stage === stage.id)}
                onMoveLead={handleMoveLead}
                onCardClick={handleCardClick}
                onNewLead={handleNewLead}
              />
            </div>
          ))}
        </div>
      </main>

      {/* ── Modal de Detalle de Lead ── */}
      {selectedLead && (
        <LeadDetailModal 
          lead={selectedLead} 
          stage={selectedStage} 
          onClose={closeLeadModal} 
        />
      )}

      {/* ── Toast de notificación ── */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg bg-gray-800 text-white font-medium text-sm
          ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
      >
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

export default PipelineBoard;

