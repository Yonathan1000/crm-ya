import React, { useState, useEffect } from 'react';

const Contactos = () => {
  const [contactos, setContactos] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchContactos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/clients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const responseData = await response.json();
      const data = responseData.data || responseData;
      setContactos(data);
    } catch (error) {
      console.error('Error fetching contactos:', error);
    }
  };

  useEffect(() => {
    fetchContactos();
  }, []);

  // Cálculos de paginación
  const totalItems = contactos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = contactos.slice(startIndex, endIndex);

  // Lógica de los checkboxes
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(currentItems.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleExportCSV = () => {
    const csv = ['Nombre,Email,Teléfono,Empresa,Estado'];
    contactos.forEach(c => csv.push(`${c.nombre},${c.email},${c.telefono},${c.empresa},${c.estado_lead}`));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contactos.csv';
    a.click();
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const isAllSelected = currentItems.length > 0 && selectedIds.length === currentItems.length;

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      for (const id of selectedIds) {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/clients/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      setSelectedIds([]);
      fetchContactos();
    } catch (error) {
      console.error('Error deleting contactos:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Cabecera con título y botones de acción globales */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contactos</h2>
        <div className="flex space-x-3">
          <button onClick={() => alert("Modal de importación CSV próximamente")} className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">            Importar Contactos          </button>
          <button onClick={handleExportCSV} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">            Exportar CSV          </button>
        </div>
      </div>

      {/* Barra de Acciones Masivas (Aparece al seleccionar) */}
      {selectedIds.length > 0 && (
        <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex justify-between items-center animate-fade-in">
          <span className="text-sm font-medium text-indigo-800">
            {selectedIds.length} contacto{selectedIds.length !== 1 ? 's' : ''} seleccionado{selectedIds.length !== 1 ? 's' : ''}
          </span>
          <div className="flex space-x-3">
            <button onClick={() => alert("Asignación masiva próximamente")} className="px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">              Asignar            </button>
            <button onClick={handleExportCSV} className="px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">              Exportar            </button>
            <button 
              onClick={handleDelete}
              className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-md shadow-sm text-sm font-medium text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {/* Contenedor de la Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 w-12">
                  <input 
                    type="checkbox" 
                    checked={isAllSelected} 
                    onChange={handleSelectAll} 
                    className="w-4 h-4 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500 cursor-pointer" 
                  />
                </th>
                <th className="p-4 text-sm font-semibold text-gray-900">Nombre</th>
                <th className="p-4 text-sm font-semibold text-gray-900">Empresa</th>
                <th className="p-4 text-sm font-semibold text-gray-900">Email</th>
                <th className="p-4 text-sm font-semibold text-gray-900">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((contacto) => (
                <tr 
                  key={contacto.id} 
                  className={`border-b border-gray-200 transition-colors last:border-b-0 ${
                    selectedIds.includes(contacto.id) 
                      ? 'bg-indigo-50/40 hover:bg-indigo-50/60' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(contacto.id)}
                      onChange={() => handleSelectOne(contacto.id)}
                      className="w-4 h-4 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">{contacto.nombre}</td>
                  <td className="p-4 text-sm text-gray-600">{contacto.empresa}</td>
                  <td className="p-4 text-sm text-gray-600">{contacto.email}</td>
                  <td className="p-4 text-sm text-gray-600">{contacto.telefono}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginación */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{totalItems === 0 ? 0 : startIndex + 1}</span> - <span className="font-medium">{Math.min(endIndex, totalItems)}</span> de <span className="font-medium">{totalItems}</span>
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setCurrentPage(p => Math.max(1, p - 1));
                setSelectedIds([]); // Limpiar selección al cambiar de página
              }}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => {
                setCurrentPage(p => Math.min(totalPages, p + 1));
                setSelectedIds([]); // Limpiar selección al cambiar de página
              }}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contactos;
