import React, { useState } from 'react';

export default function LandingPage({ onLoginSuccess }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterTab, setIsRegisterTab] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [startTrial, setStartTrial] = useState(true); // Default to true so users test premium
  const [billingCycle, setBillingCycle] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const getPrice = (base) => {
    if (billingCycle === 1) return base;
    if (billingCycle === 3) return Math.round(base * 0.90); // 10% off
    if (billingCycle === 6) return Math.round(base * 0.85); // 15% off
    if (billingCycle === 9) return Math.round(base * 0.80); // 20% off
    return Math.round(base * 0.70); // 30% off for 12 months
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const endpoint = isRegisterTab ? '/api/auth/register' : '/api/auth/login';
      const body = isRegisterTab ? { nombre, email, password, startTrial } : { email, password };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      onLoginSuccess(data.user.isSuperAdmin ? 'superadmin' : 'admin', isRegisterTab);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => setIsLoginModalOpen(true);

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans text-gray-900 overflow-hidden relative">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <span className="text-3xl font-extrabold tracking-tight text-indigo-600">
                YA
              </span>
            </div>
            <div>
              <button
                type="button"
                onClick={openModal}
                className="inline-flex items-center px-6 py-2.5 border border-gray-200 text-sm font-semibold rounded-full text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-20 lg:pt-32 lg:pb-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl tracking-tight font-extrabold sm:text-6xl md:text-7xl">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 pb-2">
              CRM con IA para ventas por mensajería
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 font-light">
            Unifica WhatsApp, Instagram y Facebook en un solo pipeline y multiplica las conversiones de tu equipo.
          </p>
          <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center">
            <button
              onClick={openModal}
              className="w-full sm:w-auto flex items-center justify-center px-10 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-all transform hover:-translate-y-1"
            >
              Comenzar gratis
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-20 bg-[#F4F5F7] border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-indigo-600 font-bold tracking-wide uppercase">Omnicanal & IA</h2>
            <p className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Diseñado para acelerar tu crecimiento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 inline-flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-6 border border-indigo-100">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Bandeja de entrada unificada</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Centraliza todas tus conversaciones de WhatsApp, Facebook e Instagram. Responde al instante desde un solo lugar.
              </p>
            </div>

            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 inline-flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-6 border border-indigo-100">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Chatbots con Inteligencia Artificial</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Califica leads y responde preguntas frecuentes 24/7 de forma automática. Escala tus ventas sin incrementar tu equipo.
              </p>
            </div>

            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 inline-flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-6 border border-indigo-100">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Embudo de Ventas Visual (Kanban)</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Controla todo el proceso comercial. Mueve a tus prospectos de etapa en etapa con un sistema intuitivo de arrastrar y soltar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-indigo-600 font-bold tracking-wide uppercase">Planes y Precios</h2>
            <p className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Escala tu equipo sin fricciones
            </p>
            <div className="mt-8 flex justify-center items-center">
              <div className="bg-gray-100 p-1.5 rounded-2xl inline-flex flex-wrap justify-center gap-1 shadow-inner border border-gray-200">
                {[1, 3, 6, 9, 12].map(months => (
                  <button
                    key={months}
                    onClick={() => setBillingCycle(months)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${billingCycle === months ? 'bg-indigo-600 text-white shadow-md transform scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                  >
                    {months === 1 ? '1 Mes' : `${months} Meses`}
                    {months === 12 && <span className="ml-1.5 bg-emerald-400 text-emerald-900 text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">Ahorra 30%</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-[#F4F5F7] shadow-sm border border-gray-200 rounded-3xl p-8 flex flex-col hover:shadow-md transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Básico</h3>
              <p className="text-gray-600 mb-6">Para pequeñas empresas que inician su digitalización.</p>
              <div className="text-5xl font-extrabold text-gray-900 mb-1">
                ${getPrice(15)}
                <span className="text-xl font-normal text-gray-500">/mes</span>
              </div>
              <div className="text-sm font-semibold text-indigo-600 mb-6 h-5">
                {billingCycle > 1 ? `Cobro total: $${getPrice(15) * billingCycle}` : ''}
              </div>
              <ul className="flex-1 space-y-4 mb-8">
                <li className="flex items-start text-gray-700">
                  <span className="mr-3 text-indigo-500 font-bold">✓</span> <span>Hasta <strong>2 Vendedores</strong> en línea</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="mr-3 text-indigo-500 font-bold">✓</span> <span><strong>10 Plantillas</strong> de respuestas rápidas</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="mr-3 text-indigo-500 font-bold">✓</span> <span><strong>Bandeja Unificada:</strong> WhatsApp, FB e IG</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="mr-3 text-indigo-500 font-bold">✓</span> <span><strong>Embudo Kanban:</strong> Gestión visual de leads</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="mr-3 text-indigo-500 font-bold">✓</span> <span>Historial completo de clientes</span>
                </li>
                <li className="flex items-start text-emerald-600 font-medium text-[13px] mt-4 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 shadow-sm leading-tight">
                  <span className="mr-2 text-lg">💡</span> <strong>Escalabilidad:</strong> Agrega 1 vendedor extra o +20 plantillas por solo $3.50/mes.
                </li>
              </ul>
              <button onClick={openModal} className="w-full py-3 rounded-xl font-bold text-indigo-600 bg-white border border-gray-300 hover:bg-gray-50 transition-all">
                Empezar Básico
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white shadow-xl border-2 border-indigo-500 transform md:-translate-y-4 rounded-3xl p-8 flex flex-col relative">
              <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                Recomendado
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <p className="text-gray-600 mb-6">La solución completa para equipos de alto rendimiento.</p>
              <div className="text-5xl font-extrabold text-gray-900 mb-1">
                ${getPrice(25)}
                <span className="text-xl font-normal text-gray-500">/mes</span>
              </div>
              <div className="text-sm font-semibold text-indigo-600 mb-6 h-5">
                {billingCycle > 1 ? `Cobro total: $${getPrice(25) * billingCycle}` : ''}
              </div>
              <ul className="flex-1 space-y-4 mb-8">
                <li className="flex items-start text-gray-700">
                  <span className="mr-3 text-indigo-500 font-bold">✓</span> <span>Hasta <strong>3 Vendedores</strong> simultáneos</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="mr-3 text-indigo-500 font-bold">✓</span> <span><strong>30 Plantillas</strong> multimedia</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="mr-3 text-indigo-500 font-bold">✓</span> <span><strong>Chatbots con Inteligencia Artificial</strong></span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="mr-3 text-indigo-500 font-bold">✓</span> <span>Automatización de tareas y embudos</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="mr-3 text-indigo-500 font-bold">✓</span> <span>Analíticas y métricas de rendimiento</span>
                </li>
                <li className="flex items-start text-emerald-600 font-medium text-[13px] mt-4 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 shadow-sm leading-tight">
                  <span className="mr-2 text-lg">💡</span> <strong>Escalabilidad:</strong> Agrega 1 vendedor extra o +20 plantillas por solo $3.50/mes.
                </li>
              </ul>
              <button onClick={openModal} className="w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all">
                Prueba gratuita de 14 días
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-[#F4F5F7] shadow-sm border border-gray-200 rounded-3xl p-8 flex flex-col hover:shadow-md transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-6">Para corporativos con necesidades complejas.</p>
              <div className="text-5xl font-extrabold text-gray-900 mb-1">
                ${getPrice(40)}
                <span className="text-xl font-normal text-gray-500">/mes</span>
              </div>
              <div className="text-sm font-semibold text-indigo-600 mb-6 h-5">
                {billingCycle > 1 ? `Cobro total: $${getPrice(40) * billingCycle}` : ''}
              </div>
              <ul className="flex-1 space-y-4 mb-8">
                <li className="flex items-start text-gray-700">
                  <span className="mr-3 text-indigo-500 font-bold">✓</span> <span>Hasta <strong>4 Vendedores</strong> élite</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="mr-3 text-indigo-500 font-bold">✓</span> <span><strong>50 Plantillas</strong> avanzadas</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="mr-3 text-indigo-500 font-bold">✓</span> <span><strong>Acceso total API:</strong> Conecta con tu web/ERP</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="mr-3 text-indigo-500 font-bold">✓</span> <span>Gestión de Roles y Permisos estrictos</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="mr-3 text-indigo-500 font-bold">✓</span> <span>Soporte técnico VIP 24/7</span>
                </li>
                <li className="flex items-start text-emerald-600 font-medium text-[13px] mt-4 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 shadow-sm leading-tight">
                  <span className="mr-2 text-lg">💡</span> <strong>Escalabilidad:</strong> Agrega 1 vendedor extra o +20 plantillas por solo $3.50/mes.
                </li>
              </ul>
              <button onClick={openModal} className="w-full py-3 rounded-xl font-bold text-indigo-600 bg-white border border-gray-300 hover:bg-gray-50 transition-all">
                Contactar Ventas
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} YA. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed z-50 inset-0 flex items-center justify-center p-4 sm:p-0">
          <div 
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
            aria-hidden="true" 
            onClick={() => setIsLoginModalOpen(false)}
          ></div>

          <div className="relative bg-white rounded-3xl px-6 py-8 sm:p-10 text-left overflow-hidden shadow-2xl transform transition-all w-full max-w-md border border-gray-100">
            <div className="relative z-10">
              <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 text-center mb-2" id="modal-title">
                Bienvenido a YA
              </h3>
              
              <div className="flex border-b border-gray-200 mb-6 mt-4">
                <button
                  className={`flex-1 py-2 text-center font-semibold text-sm transition-colors ${!isRegisterTab ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setIsRegisterTab(false)}
                >
                  Iniciar Sesión
                </button>
                <button
                  className={`flex-1 py-2 text-center font-semibold text-sm transition-colors ${isRegisterTab ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setIsRegisterTab(true)}
                >
                  Crear Cuenta
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                  {errorMsg}
                </div>
              )}
              
              <form onSubmit={handleAuthSubmit}>
                {isRegisterTab && (
                  <div className="mb-4">
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      id="nombre"
                      className="block w-full bg-[#F4F5F7] border border-gray-200 rounded-xl py-3 px-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                      placeholder="Tu nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="block w-full bg-[#F4F5F7] border border-gray-200 rounded-xl py-3 px-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    placeholder="tu@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    className="block w-full bg-[#F4F5F7] border border-gray-200 rounded-xl py-3 px-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {isRegisterTab && (
                  <div className="mb-8 flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="startTrial" 
                      checked={startTrial} 
                      onChange={(e) => setStartTrial(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="startTrial" className="text-sm text-gray-600">
                      Activar mis <strong>14 días de prueba Premium</strong> gratuitos.
                    </label>
                  </div>
                )}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-md bg-indigo-600 text-lg font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Cargando...' : isRegisterTab ? 'Registrarme' : 'Entrar a YA'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
