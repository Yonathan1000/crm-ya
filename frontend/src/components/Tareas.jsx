import React, { useState, useEffect } from 'react';

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [filtro, setFiltro] = useState('Todas');
  const [error, setError] = useState(null);
  
  // Formulario nueva tarea
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaPrioridad, setNuevaPrioridad] = useState('Media');

  const fetchTareas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar las tareas del servidor.');
      const data = await response.json();
      setTareas(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchTareas();
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nuevoTitulo.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: nuevoTitulo, priority: nuevaPrioridad, status: 'Pendiente' })
      });
      if (!response.ok) throw new Error('Error al crear la nueva tarea.');
      setNuevoTitulo('');
      setNuevaPrioridad('Media');
      fetchTareas();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleActualizar = async (id, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Error al actualizar la tarea.');
      fetchTareas();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEliminar = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al eliminar la tarea.');
      fetchTareas();
    } catch (err) {
      setError(err.message);
    }
  };

  const esVencida = (fechaVencimiento, estado) => {
    if (!fechaVencimiento) return false;
    if (estado === 'Completado') return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const vencimiento = new Date(fechaVencimiento + 'T00:00:00');
    return vencimiento < hoy;
  };

  const tareasFiltradas = tareas.filter((tarea) => {
    const estado = tarea.status || tarea.estado || 'Pendiente';
    const vencida = esVencida(tarea.fechaVencimiento, estado);
    if (filtro === 'Todas') return true;
    if (filtro === 'Pendientes') return estado !== 'Completado';
    if (filtro === 'Completadas') return estado === 'Completado';
    if (filtro === 'Vencidas') return vencida;
    return true;
  });

  const getPriorityClasses = (prioridad) => {
    switch (prioridad) {
      case 'Alta': return 'bg-red-50 text-red-700 border-red-200';
      case 'Media': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Baja': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusClasses = (estado) => {
    switch (estado) {
      case 'Completado': return 'bg-green-100 text-green-800';
      case 'En progreso': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return 'Sin fecha';
    const fecha = new Date(fechaStr + 'T00:00:00');
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const tabs = ['Todas', 'Pendientes', 'Completadas', 'Vencidas'];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tareas</h2>
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {/* Formulario para nueva tarea */}
      <form onSubmit={handleCrear} className="mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-grow w-full sm:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1">Título de la tarea</label>
          <input 
            type="text" 
            value={nuevoTitulo} 
            onChange={(e) => setNuevoTitulo(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border outline-none"
            placeholder="Ej. Preparar presentación..."
          />
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
          <select 
            value={nuevaPrioridad} 
            onChange={(e) => setNuevaPrioridad(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border bg-white outline-none"
          >
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
        <button 
          type="submit" 
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors"
        >
          Agregar Tarea
        </button>
      </form>

      {/* Tabs / Filters */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setFiltro(tab)}
            className={`py-2 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              filtro === tab 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tareasFiltradas.length > 0 ? (
          tareasFiltradas.map((tarea) => {
            const titulo = tarea.title || tarea.titulo;
            const estado = tarea.status || tarea.estado || 'Pendiente';
            const prioridad = tarea.priority || tarea.prioridad || 'Media';
            const vencida = esVencida(tarea.fechaVencimiento, estado);
            
            return (
              <div key={tarea.id} className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow relative group">
                {/* Botón Eliminar */}
                <button 
                  onClick={() => handleEliminar(tarea.id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar tarea"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>

                <div className="flex justify-between items-start mb-3 pr-6">
                  {/* Selector de Prioridad */}
                  <select 
                    value={prioridad}
                    onChange={(e) => handleActualizar(tarea.id, { priority: e.target.value })}
                    className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border cursor-pointer appearance-none outline-none ${getPriorityClasses(prioridad)}`}
                    title="Cambiar prioridad"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                  
                  {/* Botón para cambiar estado */}
                  <button 
                    onClick={() => handleActualizar(tarea.id, { status: estado === 'Completado' ? 'Pendiente' : 'Completado' })}
                    className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full shrink-0 cursor-pointer hover:opacity-80 transition-opacity ${getStatusClasses(estado)}`}
                    title={estado === 'Completado' ? 'Marcar como pendiente' : 'Marcar como completado'}
                  >
                    {estado}
                  </button>
                </div>
                
                <h3 className={`text-lg font-bold text-gray-900 leading-tight mb-2 ${estado === 'Completado' ? 'line-through text-gray-500' : ''}`}>
                  {titulo}
                </h3>
                
                {tarea.descripcion && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                    {tarea.descripcion}
                  </p>
                )}
                
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  {/* Vencimiento */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Vencimiento</span>
                    <span className={`text-sm font-medium ${vencida ? 'text-red-600' : 'text-gray-700'}`}>
                      {formatFecha(tarea.fechaVencimiento)}
                      {vencida && <span className="ml-1 text-xs text-red-500">(Vencida)</span>}
                    </span>
                  </div>
                  
                  {/* Asignado */}
                  {tarea.asignadoA && (
                    <div className="flex items-center space-x-2" title={`Asignado a: ${tarea.asignadoA.nombre}`}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${tarea.asignadoA.color} text-xs font-bold ring-2 ring-white`}>
                        {tarea.asignadoA.iniciales}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-gray-500 text-lg">No hay tareas que coincidan con este filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tareas;
