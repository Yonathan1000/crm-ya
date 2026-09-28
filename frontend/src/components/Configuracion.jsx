import React, { useState } from 'react';

export default function Configuracion() {
  const [activeTab, setActiveTab] = useState('perfil');
  const [userProfile, setUserProfile] = useState({ name: '', email: '' });

  // Canales states
  const [waStatus, setWaStatus] = useState('Desconectado');
  const [fbStatus, setFbStatus] = useState('Conectado');
  const [igStatus, setIgStatus] = useState('Desconectado');

  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [isFbIgModalOpen, setIsFbIgModalOpen] = useState(false);
  const [currentFbIgProvider, setCurrentFbIgProvider] = useState(''); // 'fb' or 'ig'

  const [integrations, setIntegrations] = useState([]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'meta_connected') {
      alert('¡Cuenta de Meta vinculada exitosamente!');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (params.get('error') === 'meta_failed') {
      alert('Hubo un error al vincular la cuenta de Meta.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const fetchIntegrations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/integrations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setIntegrations(data);
          const hasMeta = data.some(i => i.provider === 'META' && i.status === 'ACTIVE');
          if (hasMeta) {
            setFbStatus('Conectado');
            setIgStatus('Conectado');
            setWaStatus('Conectado'); // Temporalmente, en el futuro separaremos WA Cloud del general
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchIntegrations();

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserProfile({ name: data.nombre || '', email: data.email || '' });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleMetaAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/integrations/meta/auth-url`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Redirigir directamente al PopUp de Facebook
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error fetching auth url', error);
      alert('Error de conexión con el servidor.');
    }
  };

  const handleWaAction = () => {
    if (waStatus === 'Conectado') {
      setWaStatus('Desconectado');
    } else {
      handleMetaAuth(); // Usa el mismo flujo por ahora para simplificar WABA embebido
    }
  };

  const handleFbAction = () => {
    if (fbStatus === 'Conectado') {
      setFbStatus('Desconectado');
    } else {
      handleMetaAuth();
    }
  };

  const handleIgAction = () => {
    if (igStatus === 'Conectado') {
      setIgStatus('Desconectado');
    } else {
      handleMetaAuth();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Perfil</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Subir nueva foto</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input type="text" value={userProfile.name} readOnly className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-500 bg-gray-50 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                  <input type="email" value={userProfile.email} readOnly className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-500 bg-gray-50 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="tel" className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white" placeholder="+1 234 567 890" />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button className="py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Guardar cambios</button>
              </div>
            </div>
          </div>
        );
      case 'seguridad':
        return (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Seguridad</h3>
            <div className="space-y-8">
              <div className="max-w-md space-y-6">
                <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Cambiar Contraseña</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
                  <input type="password" className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                  <input type="password" className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                  <input type="password" className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white" />
                </div>
                <div className="pt-2 flex justify-end">
                  <button className="py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Actualizar contraseña</button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Autenticación en 2 Pasos (2FA)</h4>
                <div className="flex items-center justify-between py-2 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Proteger cuenta con 2FA</h5>
                    <p className="text-sm text-gray-500">Agrega una capa adicional de seguridad a tu cuenta.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Sesiones Activas</h4>
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 overflow-hidden">
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 text-green-600 rounded-full shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Windows PC - Chrome</p>
                        <p className="text-xs text-gray-500">Bogotá, Colombia • Sesión actual</p>
                      </div>
                    </div>
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 self-start sm:self-auto">Activa</span>
                  </div>
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 text-gray-600 rounded-full shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">iPhone 13 - Safari</p>
                        <p className="text-xs text-gray-500">Bogotá, Colombia • Hace 2 días</p>
                      </div>
                    </div>
                    <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800 font-medium self-start sm:self-auto">Cerrar sesión actual</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'preferencias':
        return (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Preferencias</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Notificaciones por email</h4>
                  <p className="text-sm text-gray-500">Recibe resúmenes y alertas por correo electrónico.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Sonidos en la app</h4>
                  <p className="text-sm text-gray-500">Reproduce un sonido cuando recibes un nuevo mensaje.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Notificaciones push</h4>
                  <p className="text-sm text-gray-500">Muestra notificaciones en el navegador o dispositivo móvil.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="pt-4 max-w-sm">
                <label className="block text-sm font-medium text-gray-700 mb-1">Zona horaria</label>
                <select className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white">
                  <option>UTC -05:00 (Hora del Este)</option>
                  <option>UTC -04:00 (Hora del Atlántico)</option>
                  <option>UTC +00:00 (Hora de Greenwich)</option>
                  <option>UTC +01:00 (Europa Central)</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'equipo':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Equipo y Miembros</h3>
              <button className="py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                Invitar Usuario
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-x-auto shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                          JP
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">Juan Pérez</div>
                          <div className="text-sm text-gray-500">juan@ejemplo.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Admin</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Activo</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button className="text-gray-400 hover:text-gray-500">Editar</button></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                          MG
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">María Gómez</div>
                          <div className="text-sm text-gray-500">maria@ejemplo.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Vendedor</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Activo</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button className="text-gray-400 hover:text-gray-500">Editar</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'facturacion':
        return (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Facturación y Planes</h3>
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Plan Actual: <span className="font-bold text-blue-600">Pro</span></h4>
                    <p className="text-sm text-gray-500">Próximo cobro: 15 de Octubre, 2026</p>
                  </div>
                  <button className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cambiar Plan</button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Método de Pago</h4>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded">
                      <span className="font-bold text-gray-700">VISA</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Visa terminada en 4242</p>
                      <p className="text-xs text-gray-500">Expira 12/28</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium self-start sm:self-auto">Actualizar</button>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Historial de Facturas</h4>
                <div className="border border-gray-200 rounded-lg overflow-x-auto shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15 Sep, 2026</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$49.00</td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Pagado</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button className="text-blue-600 hover:text-blue-900">Descargar</button></td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15 Ago, 2026</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$49.00</td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Pagado</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button className="text-blue-600 hover:text-blue-900">Descargar</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      case 'canales':
        return (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Canales de Comunicación (Omnicanal)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* WhatsApp Card */}
              <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp Cloud API</h4>
                <span className={`px-3 py-1 text-xs font-medium rounded-full mb-4 ${waStatus === 'Conectado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {waStatus}
                </span>
                <button onClick={handleWaAction} className="mt-auto w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
                  {waStatus === 'Conectado' ? 'Desvincular' : 'Vincular WhatsApp'}
                </button>
              </div>

              {/* Facebook Messenger Card */}
              <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.302 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.953-3.055-3.261-5.963 3.261 6.554-6.965 3.125 3.261 5.891-3.261-6.552 6.965z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Facebook Messenger</h4>
                <span className={`px-3 py-1 text-xs font-medium rounded-full mb-4 ${fbStatus === 'Conectado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {fbStatus}
                </span>
                <button onClick={handleFbAction} className="mt-auto w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
                  {fbStatus === 'Conectado' ? 'Desvincular' : 'Iniciar sesión en Facebook'}
                </button>
              </div>

              {/* Instagram Direct Card */}
              <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Instagram Direct</h4>
                <span className={`px-3 py-1 text-xs font-medium rounded-full mb-4 ${igStatus === 'Conectado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {igStatus}
                </span>
                <button onClick={handleIgAction} className="mt-auto w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
                  {igStatus === 'Conectado' ? 'Desvincular' : 'Iniciar sesión en Instagram'}
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="py-8 px-4 bg-gray-50 min-h-screen">
      <div className="mb-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
        <p className="text-sm text-gray-500 mt-1">Administra tu perfil, seguridad, preferencias, equipo, facturación y canales.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
        {/* Left Column - Navigation */}
        <div className="w-full md:w-64 bg-white shadow-sm rounded-xl border border-gray-200 p-4 h-fit shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('perfil')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'perfil'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Perfil
            </button>
            <button
              onClick={() => setActiveTab('seguridad')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'seguridad'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Seguridad
            </button>
            <button
              onClick={() => setActiveTab('preferencias')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'preferencias'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Preferencias
            </button>
            <button
              onClick={() => setActiveTab('equipo')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'equipo'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Equipo
            </button>
            <button
              onClick={() => setActiveTab('facturacion')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'facturacion'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Facturación
            </button>
            <button
              onClick={() => setActiveTab('canales')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'canales'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Canales (Omnicanal)
            </button>
          </nav>
        </div>

        {/* Right Column - Content */}
        <div className="flex-1 bg-white shadow-sm rounded-xl border border-gray-200 p-6 overflow-hidden">
          {renderTabContent()}
        </div>
      </div>

      {/* WhatsApp Modal */}
      {isWaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Conectar WhatsApp Cloud API</h3>
            <p className="text-sm text-gray-600 mb-4">Para conectar la Cloud API, ingresa tus credenciales de Meta for Developers.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
                <input type="text" className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm text-gray-900 bg-white" placeholder="EAAB..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
                <input type="text" className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm text-gray-900 bg-white" placeholder="103948..." />
              </div>
              
              <hr className="my-4 border-gray-200" />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL (Solo lectura)</label>
                <input type="text" readOnly value="https://tu-crm.com/api/webhooks/whatsapp" className="block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verify Token (Solo lectura)</label>
                <input type="text" readOnly value="crm_secure_2026" className="block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm text-gray-500" />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsWaModalOpen(false)} className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancelar</button>
              <button onClick={() => { setWaStatus('Conectado'); setIsWaModalOpen(false); }} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">Guardar Credenciales</button>
            </div>
          </div>
        </div>
      )}

      {/* FB / IG Modal */}
      {isFbIgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {currentFbIgProvider === 'fb' ? 'Conectar Facebook Messenger' : 'Conectar Instagram Direct'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">Serás redirigido a Facebook para otorgar permisos a OmniCRM para administrar tus mensajes.</p>
            
            <div className="mt-6 flex justify-center space-x-3">
              <button onClick={() => setIsFbIgModalOpen(false)} className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancelar</button>
              <button onClick={() => { 
                if(currentFbIgProvider === 'fb') setFbStatus('Conectado');
                else setIgStatus('Conectado');
                setIsFbIgModalOpen(false); 
              }} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Continuar con Facebook (OAuth)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
