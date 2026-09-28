import React, { useState, useEffect } from 'react';

export default function PipelineStagesManager() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const colors = [
    { id: 'blue', name: 'Azul', bg: 'bg-blue-100', text: 'text-blue-700' },
    { id: 'yellow', name: 'Amarillo', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    { id: 'orange', name: 'Naranja', bg: 'bg-orange-100', text: 'text-orange-700' },
    { id: 'green', name: 'Verde', bg: 'bg-green-100', text: 'text-green-700' },
    { id: 'red', name: 'Rojo', bg: 'bg-red-100', text: 'text-red-700' }
  ];

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/pipeline-stages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar etapas');
      const data = await res.json();
      setStages(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    const newStage = {
      isNew: true,
      name: 'Nueva Etapa',
      color: 'blue',
      order: stages.length
    };
    setStages([...stages, newStage]);
  };

  const handleChange = (index, field, value) => {
    const newStages = [...stages];
    newStages[index][field] = value;
    setStages(newStages);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newStages = [...stages];
    const temp = newStages[index - 1].order;
    newStages[index - 1].order = newStages[index].order;
    newStages[index].order = temp;
    setStages(newStages.sort((a, b) => a.order - b.order));
  };

  const moveDown = (index) => {
    if (index === stages.length - 1) return;
    const newStages = [...stages];
    const temp = newStages[index + 1].order;
    newStages[index + 1].order = newStages[index].order;
    newStages[index].order = temp;
    setStages(newStages.sort((a, b) => a.order - b.order));
  };

  const handleRemove = async (index) => {
    const stage = stages[index];
    if (stage.isNew) {
      setStages(stages.filter((_, i) => i !== index));
      return;
    }
    
    if (confirm('¿Seguro que deseas eliminar esta etapa? Los clientes en esta etapa no desaparecerán pero no serán visibles correctamente en el embudo hasta que se les asigne otra.')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/pipeline-stages/${stage.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setStages(stages.filter((_, i) => i !== index));
      } catch (e) {
        alert('Error al eliminar');
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      for (const [idx, stage] of stages.entries()) {
        const payload = {
          name: stage.name,
          color: stage.color,
          order: idx
        };
        
        let url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/pipeline-stages`;
        let method = 'POST';
        
        if (!stage.isNew) {
          url += `/${stage.id}`;
          method = 'PUT';
        }
        
        await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      }
      await fetchStages();
      alert('Etapas guardadas correctamente');
    } catch (e) {
      setError('Ocurrió un error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Cargando etapas...</div>;

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Embudos de Venta</h3>
      <p className="text-sm text-gray-500 mb-6">Personaliza las etapas por las que pasa un cliente antes de cerrar una venta.</p>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

      <div className="space-y-3 mb-6">
        {stages.map((stage, idx) => (
          <div key={stage.id || idx} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex flex-col space-y-1">
              <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-gray-400 hover:text-indigo-600 disabled:opacity-30">?</button>
              <button onClick={() => moveDown(idx)} disabled={idx === stages.length - 1} className="text-gray-400 hover:text-indigo-600 disabled:opacity-30">?</button>
            </div>
            
            <div className="flex-1">
              <input 
                type="text" 
                value={stage.name} 
                onChange={e => handleChange(idx, 'name', e.target.value)}
                className="w-full font-medium text-gray-800 bg-white border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="w-32">
              <select 
                value={stage.color}
                onChange={e => handleChange(idx, 'color', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className={`w-8 h-8 rounded-full ${colors.find(c => c.id === stage.color)?.bg || 'bg-gray-100'}`}></div>

            <button onClick={() => handleRemove(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={handleAdd}
          className="flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Añadir Etapa
        </button>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}
