import React, { useState, useEffect } from 'react';

export default function SuperAdminPanel({ onExit }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inquilinos');

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/superadmin/companies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCompanies(data);
        else setCompanies([]);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handlePlanChange = (companyId, newPlan) => {
    const token = localStorage.getItem('token') || '';
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/superadmin/companies/${companyId}/plan`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ planType: newPlan })
    })
    .then(res => res.json())
    .then(updatedCompany => {
      setCompanies(companies.map(c => c.id === companyId ? { ...c, ...updatedCompany } : c));
    });
  };

  const handleLimitChange = (company, limitType, delta) => {
    const token = localStorage.getItem('token') || '';
    const newLimit = Math.max(1, (company[limitType] || 0) + delta);
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/superadmin/companies/${company.id}/limits`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ [limitType]: newLimit })
    })
    .then(res => res.json())
    .then(updatedCompany => {
      setCompanies(companies.map(c => c.id === company.id ? { ...c, ...updatedCompany } : c));
    });
  };

  const handleStatusToggle = (company) => {
    const token = localStorage.getItem('token') || '';
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/superadmin/companies/${company.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ isActive: !company.isActive })
    })
    .then(res => res.json())
    .then(updatedCompany => {
      setCompanies(companies.map(c => c.id === company.id ? { ...c, ...updatedCompany } : c));
    });
  };

  const handlePremiumToggle = (company) => {
    const token = localStorage.getItem('token') || '';
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/superadmin/companies/${company.id}/premium`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ premiumUnlocked: !company.premiumUnlocked })
    })
    .then(res => res.json())
    .then(updatedCompany => {
      setCompanies(companies.map(c => c.id === company.id ? { ...c, ...updatedCompany } : c));
    });
  };

  const getTrialDaysRemaining = (dateString) => {
    if (!dateString) return null;
    const end = new Date(dateString);
    const now = new Date();
    const diff = end - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onExit) onExit();
  };

  const renderContent = () => {
    if (activeTab === 'metricas') {
      return (
        <div className="p-10 text-center text-gray-500 flex flex-col justify-center items-center h-full">
          <svg className="w-16 h-16 mx-auto text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <h2 className="text-2xl font-bold text-white mb-2">Métricas Globales (Próximamente)</h2>
          <p>Los gráficos consolidados del sistema se están recopilando para el próximo parche.</p>
        </div>
      );
    }
    if (activeTab === 'facturacion') {
      return (
        <div className="p-10 text-center text-gray-500 flex flex-col justify-center items-center h-full">
          <svg className="w-16 h-16 mx-auto text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          <h2 className="text-2xl font-bold text-white mb-2">Facturación y Logs (Próximamente)</h2>
          <p>Portal de pasarela de pagos (Stripe) y reportes en fase de integración.</p>
        </div>
      );
    }
    if (activeTab === 'ajustes') {
      return (
        <div className="p-10 text-center text-gray-500 flex flex-col justify-center items-center h-full">
          <svg className="w-16 h-16 mx-auto text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          <h2 className="text-2xl font-bold text-white mb-2">Ajustes del Sistema (Próximamente)</h2>
          <p>Las configuraciones core del servidor no requieren cambios por ahora.</p>
        </div>
      );
    }

    return (
      <div className="p-10 space-y-8">
        {/* KPI Dashboard */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Ingreso (MRR)</h3>
            <div className="flex items-end gap-3"><span className="text-4xl font-black text-white">$0</span></div>
          </div>
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all">
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Inquilinos</h3>
            <div className="flex items-end gap-3"><span className="text-4xl font-black text-white">{companies.length}</span></div>
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#0d0d0d]">
            <div>
              <h2 className="text-xl font-bold text-white">Gestión de Inquilinos</h2>
              <p className="text-sm text-gray-500 mt-1">Controla límites, planes, pagos y accesos a herramientas Premium.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#050505] text-gray-500 text-xs uppercase tracking-widest">
                  <th className="px-8 py-4 font-semibold">Empresa</th>
                  <th className="px-8 py-4 font-semibold">Suscripción & Trial</th>
                  <th className="px-8 py-4 font-semibold">Premium Tools</th>
                  <th className="px-8 py-4 font-semibold">Uso (Usuarios)</th>
                  <th className="px-8 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="5" className="px-8 py-12 text-center text-gray-600">Obteniendo datos de la matriz...</td></tr>
                ) : companies.map(company => {
                  const trialDays = getTrialDaysRemaining(company.trialEndsAt);
                  return (
                    <tr key={company.id} className={`hover:bg-white/[0.02] transition-colors group ${!company.isActive ? 'opacity-50 grayscale' : ''}`}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center text-white font-bold">
                            {(company.name || 'X').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-bold text-sm flex items-center gap-2">
                              {company.name}
                              {!company.isActive && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase">Suspendida</span>}
                            </div>
                            <div className="text-gray-500 text-xs font-mono mt-0.5">{company.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-2">
                          <select 
                            value={company.planType || 'FREE'}
                            onChange={(e) => handlePlanChange(company.id, e.target.value)}
                            className="appearance-none font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer outline-none border transition-all bg-gray-800 text-gray-300 border-gray-700 w-32"
                          >
                            <option value="FREE">FREE</option>
                            <option value="BASIC">BASIC</option>
                            <option value="PRO">PRO</option>
                            <option value="TRIAL">TRIAL</option>
                          </select>
                          {company.planType === 'TRIAL' && trialDays !== null && (
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold w-max ${trialDays > 0 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                              {trialDays > 0 ? `Quedan ${trialDays} días de prueba` : 'Prueba Expirada'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <button 
                          onClick={() => handlePremiumToggle(company)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-2 ${company.premiumUnlocked ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'bg-gray-800/50 border-gray-700 text-gray-500 hover:text-gray-300'}`}
                        >
                          <div className={`w-2 h-2 rounded-full ${company.premiumUnlocked ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-gray-600'}`}></div>
                          {company.premiumUnlocked ? 'Premium Desbloqueado' : 'Bloqueado (Esperando Pago)'}
                        </button>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1 bg-[#111] border border-white/10 rounded px-1.5 py-0.5 w-max">
                          <button onClick={() => handleLimitChange(company, 'maxUsers', -1)} className="text-gray-500 hover:text-white px-1 font-bold">-</button>
                          <span className="text-gray-300 text-xs font-mono min-w-[30px] text-center">{company._count?.users || 0} / {company.maxUsers || 0}</span>
                          <button onClick={() => handleLimitChange(company, 'maxUsers', 1)} className="text-gray-500 hover:text-white px-1 font-bold">+</button>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleStatusToggle(company)} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${company.isActive ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>
                            {company.isActive ? 'Suspender' : 'Reactivar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0A] border-r border-white/5 flex flex-col z-10">
        <div className="h-20 flex items-center px-8 border-b border-white/5">
          <span className="text-white font-bold tracking-widest uppercase text-sm">Nivel Dios</span>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          <button onClick={() => setActiveTab('inquilinos')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'inquilinos' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>Inquilinos (Tenants)</button>
          <button onClick={() => setActiveTab('metricas')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'metricas' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>Métricas Globales</button>
          <button onClick={() => setActiveTab('facturacion')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'facturacion' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>Facturación y Logs</button>
          <button onClick={() => setActiveTab('ajustes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'ajustes' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>Ajustes del Sistema</button>
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all">
            Apagar Matriz
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col z-10 h-screen overflow-y-auto">
        <header className="h-20 px-10 flex items-center justify-between border-b border-white/5 bg-[#050505]">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Centro de Mando</h1>
          </div>
        </header>
        {renderContent()}
      </main>
    </div>
  );
}
