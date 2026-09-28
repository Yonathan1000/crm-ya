import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

/**
 * @typedef {Object} Lead
 * @property {string} id - Identificador único del lead
 * @property {string} name - Nombre del contacto
 * @property {string} [company] - Nombre de la empresa
 * @property {string} [email] - Correo electrónico
 * @property {string} stage - Etapa en el embudo (Lead Nuevo, En Contacto, Propuesta, Ganado, etc.)
 * @property {string} assignee - Persona asignada
 * @property {number} value - Valor monetario del lead
 * @property {string[]} tags - Etiquetas asociadas
 * @property {string} date - Fecha de creación
 */

/**
 * @typedef {Object} FilterBarProps
 * @property {Lead[]} leads - Lista completa de leads para extraer opciones y filtrar
 * @property {function(Lead[]): void} onFilterChange - Callback llamado cuando los resultados filtrados cambian
 * @property {string} searchQuery - Término de búsqueda actual
 * @property {function(string): void} onSearchChange - Callback llamado cuando la búsqueda cambia
 */

const STAGE_OPTIONS = ["Lead Nuevo", "En Contacto", "Propuesta", "Ganado"];

const VALUE_RANGES = [
  { label: "Todos", min: 0, max: Infinity, id: "all" },
  { label: "< $10,000", min: 0, max: 9999, id: "range_1" },
  { label: "$10,000 - $30,000", min: 10000, max: 30000, id: "range_2" },
  { label: "$30,000 - $50,000", min: 30001, max: 50000, id: "range_3" },
  { label: "> $50,000", min: 50001, max: Infinity, id: "range_4" },
];

const SORT_OPTIONS = [
  { label: "Valor (mayor a menor)", field: "value", order: "desc", id: "val_desc" },
  { label: "Valor (menor a mayor)", field: "value", order: "asc", id: "val_asc" },
  { label: "Nombre (A-Z)", field: "name", order: "asc", id: "name_asc" },
  { label: "Nombre (Z-A)", field: "name", order: "desc", id: "name_desc" },
  { label: "Fecha (más reciente)", field: "date", order: "desc", id: "date_desc" },
  { label: "Fecha (más antiguo)", field: "date", order: "asc", id: "date_asc" },
];

// Hook personalizado para clic afuera
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

/**
 * Componente de barra de filtros y búsqueda para embudo de CRM.
 * @param {FilterBarProps} props
 */
export function FilterBar({ leads = [], onFilterChange, searchQuery, onSearchChange }) {
  const [localSearch, setLocalSearch] = useState(searchQuery || "");
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Estado de los filtros
  const [filters, setFilters] = useState({
    stages: [],
    assignees: [],
    valueRange: "all",
    tags: [],
    sort: null
  });

  // Opciones dinámicas extraídas de los leads
  const assignees = useMemo(() => {
    const set = new Set(leads.map(l => l.assignee).filter(Boolean));
    return Array.from(set);
  }, [leads]);

  const allTags = useMemo(() => {
    const set = new Set();
    leads.forEach(l => l.tags?.forEach(tag => set.add(tag)));
    return Array.from(set);
  }, [leads]);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  // Sincronizar query externa
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== localSearch) {
      setLocalSearch(searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Aplicar filtros y ordenamiento
  useEffect(() => {
    let result = [...leads];

    // Búsqueda textual
    if (localSearch) {
      const q = localSearch.toLowerCase();
      result = result.filter(l => 
        l.name?.toLowerCase().includes(q) || 
        l.company?.toLowerCase().includes(q) || 
        l.email?.toLowerCase().includes(q)
      );
    }

    // Etapas
    if (filters.stages.length > 0) {
      result = result.filter(l => filters.stages.includes(l.stage));
    }

    // Asignados
    if (filters.assignees.length > 0) {
      result = result.filter(l => filters.assignees.includes(l.assignee));
    }

    // Etiquetas
    if (filters.tags.length > 0) {
      result = result.filter(l => l.tags?.some(tag => filters.tags.includes(tag)));
    }

    // Valor
    if (filters.valueRange !== "all") {
      const range = VALUE_RANGES.find(r => r.id === filters.valueRange);
      if (range) {
        result = result.filter(l => l.value >= range.min && l.value <= range.max);
      }
    }

    // Ordenamiento
    if (filters.sort) {
      const sortOpt = SORT_OPTIONS.find(s => s.id === filters.sort);
      if (sortOpt) {
        result.sort((a, b) => {
          let valA = a[sortOpt.field];
          let valB = b[sortOpt.field];
          
          if (sortOpt.field === 'date') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
          }

          if (valA < valB) return sortOpt.order === 'asc' ? -1 : 1;
          if (valA > valB) return sortOpt.order === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    if (onFilterChange) {
      onFilterChange(result);
    }
  }, [leads, localSearch, filters, onFilterChange]);

  const handleToggleDropdown = (dropdownName) => {
    setActiveDropdown(prev => prev === dropdownName ? null : dropdownName);
  };

  const closeDropdown = () => setActiveDropdown(null);

  const toggleFilterArray = (field, value) => {
    setFilters(prev => {
      const arr = prev[field];
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...arr, value] };
      }
    });
  };

  const setFilterSingle = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    closeDropdown();
  };

  const removeFilterChip = (type, value) => {
    if (type === 'stages' || type === 'assignees' || type === 'tags') {
      toggleFilterArray(type, value);
    } else if (type === 'valueRange') {
      setFilters(prev => ({ ...prev, valueRange: 'all' }));
    } else if (type === 'sort') {
      setFilters(prev => ({ ...prev, sort: null }));
    }
  };

  const clearAllFilters = () => {
    setFilters({
      stages: [],
      assignees: [],
      valueRange: "all",
      tags: [],
      sort: null
    });
    setLocalSearch("");
  };

  const activeFiltersCount = filters.stages.length + filters.assignees.length + filters.tags.length + (filters.valueRange !== 'all' ? 1 : 0) + (filters.sort ? 1 : 0);

  // Render helpers
  const renderActiveChips = () => {
    const chips = [];

    filters.stages.forEach(s => chips.push({ type: 'stages', label: `Etapa: ${s}`, value: s }));
    filters.assignees.forEach(a => chips.push({ type: 'assignees', label: `Asignado: ${a}`, value: a }));
    filters.tags.forEach(t => chips.push({ type: 'tags', label: `Etiqueta: ${t}`, value: t }));
    
    if (filters.valueRange !== 'all') {
      const r = VALUE_RANGES.find(x => x.id === filters.valueRange);
      chips.push({ type: 'valueRange', label: `Valor: ${r.label}`, value: r.id });
    }
    
    if (filters.sort) {
      const s = SORT_OPTIONS.find(x => x.id === filters.sort);
      chips.push({ type: 'sort', label: `Orden: ${s.label}`, value: s.id });
    }

    if (chips.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 mt-4">
        {chips.map((chip, idx) => (
          <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200 shadow-sm transition-colors hover:bg-blue-100">
            {chip.label}
            <button 
              onClick={() => removeFilterChip(chip.type, chip.value)}
              className="text-blue-400 hover:text-blue-600 focus:outline-none"
              aria-label={`Eliminar filtro ${chip.label}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </span>
        ))}
        <button 
          onClick={clearAllFilters}
          className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 ml-2 transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    );
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 pb-4 px-4 pt-4 mb-4 flex flex-col shadow-sm rounded-t-md">
      <div className="flex flex-col md:flex-row items-center gap-4">
        
        {/* Barra de Búsqueda */}
        <div className="relative flex-grow w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
            placeholder="Buscar por nombre, empresa o correo..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            aria-label="Buscar leads"
          />
        </div>

        {/* Botones de Filtros */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          
          {/* Badge de Filtros Activos (Opcional visual) */}
          <div className="flex items-center text-gray-500 mr-2" aria-hidden="true">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{activeFiltersCount}</span>
            )}
          </div>

          <DropdownMenu 
            label="Etapa" 
            isOpen={activeDropdown === 'stage'} 
            onToggle={() => handleToggleDropdown('stage')}
            closeDropdown={closeDropdown}
          >
            {STAGE_OPTIONS.map(stage => (
              <CheckboxItem 
                key={stage} 
                label={stage} 
                checked={filters.stages.includes(stage)} 
                onChange={() => toggleFilterArray('stages', stage)} 
              />
            ))}
          </DropdownMenu>

          <DropdownMenu 
            label="Asignado a" 
            isOpen={activeDropdown === 'assignee'} 
            onToggle={() => handleToggleDropdown('assignee')}
            closeDropdown={closeDropdown}
          >
            {assignees.length === 0 ? <div className="px-4 py-2 text-sm text-gray-500">Sin opciones</div> : null}
            {assignees.map(a => (
              <CheckboxItem 
                key={a} 
                label={a} 
                checked={filters.assignees.includes(a)} 
                onChange={() => toggleFilterArray('assignees', a)} 
              />
            ))}
          </DropdownMenu>

          <DropdownMenu 
            label="Valor" 
            isOpen={activeDropdown === 'value'} 
            onToggle={() => handleToggleDropdown('value')}
            closeDropdown={closeDropdown}
          >
            {VALUE_RANGES.map(range => (
              <RadioItem 
                key={range.id}
                label={range.label}
                checked={filters.valueRange === range.id}
                onChange={() => setFilterSingle('valueRange', range.id)}
              />
            ))}
          </DropdownMenu>

          <DropdownMenu 
            label="Etiquetas" 
            isOpen={activeDropdown === 'tags'} 
            onToggle={() => handleToggleDropdown('tags')}
            closeDropdown={closeDropdown}
          >
            {allTags.length === 0 ? <div className="px-4 py-2 text-sm text-gray-500">Sin opciones</div> : null}
            {allTags.map(tag => (
              <CheckboxItem 
                key={tag} 
                label={tag} 
                checked={filters.tags.includes(tag)} 
                onChange={() => toggleFilterArray('tags', tag)} 
              />
            ))}
          </DropdownMenu>

          <DropdownMenu 
            label="Ordenar por" 
            isOpen={activeDropdown === 'sort'} 
            onToggle={() => handleToggleDropdown('sort')}
            closeDropdown={closeDropdown}
          >
            {SORT_OPTIONS.map(opt => (
              <RadioItem 
                key={opt.id}
                label={opt.label}
                checked={filters.sort === opt.id}
                onChange={() => setFilterSingle('sort', opt.id)}
              />
            ))}
          </DropdownMenu>

        </div>
      </div>

      {renderActiveChips()}
    </div>
  );
}

export default FilterBar;

// --- Subcomponentes internos ---

function DropdownMenu({ label, isOpen, onToggle, closeDropdown, children }) {
  const ref = useRef(null);
  useOnClickOutside(ref, closeDropdown);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        className={`inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isOpen ? 'bg-gray-50 border-gray-400' : ''}`}
        onClick={onToggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {label}
        <svg className="-mr-1 ml-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute z-10 right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transform opacity-100 scale-100 transition-all duration-200">
          <div className="py-1 max-h-60 overflow-auto" role="menu" aria-orientation="vertical">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function CheckboxItem({ label, checked, onChange }) {
  return (
    <label className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition-colors" role="menuitem">
      <input
        type="checkbox"
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
        checked={checked}
        onChange={onChange}
      />
      <span className="ml-3 block truncate">{label}</span>
    </label>
  );
}

function RadioItem({ label, checked, onChange }) {
  return (
    <label className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition-colors" role="menuitem">
      <input
        type="radio"
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
        checked={checked}
        onChange={onChange}
      />
      <span className="ml-3 block truncate">{label}</span>
    </label>
  );
}
