import React, { useState } from 'react';
import { Users, Plug, Building2, ArrowRight, ArrowLeft, Check, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const OnboardingWizard = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  
  // Step 3
  const [teamName, setTeamName] = useState('');
  const [teamEmail, setTeamEmail] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleConnect = async (channel) => {
    try {
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/integrations/meta/auth-url`;
      window.open(url, '_blank');
      toast.success(`Conectando con ${channel}...`);
    } catch (error) {
      toast.error('Error al conectar');
    }
  };

  const handleAddMember = async () => {
    if (!teamName || !teamEmail) return toast.error('Ingresa nombre y correo');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre: teamName, email: teamEmail, password: 'temp1234' })
      });
      
      if (!res.ok) throw new Error('Error al agregar miembro');
      
      setTeamMembers([...teamMembers, { nombre: teamName, email: teamEmail }]);
      setTeamName('');
      setTeamEmail('');
      toast.success('Miembro agregado');
    } catch (error) {
      toast.error('Hubo un error al invitar al equipo');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Progress indicator */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-center">
          <div className="flex items-center space-x-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div className={`h-1 w-16 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-100'}`}></div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
              <Plug className="w-5 h-5" />
            </div>
            <div className={`h-1 w-16 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-100'}`}></div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Tu Empresa</h2>
                <p className="text-gray-500 mt-2">Cuéntanos un poco sobre tu negocio.</p>
              </div>
              <div className="space-y-4 max-w-sm mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la empresa</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500" placeholder="Ej. Mi Negocio" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industria/Sector</label>
                  <select value={industry} onChange={e => setIndustry(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500">
                    <option value="">Selecciona...</option>
                    <option value="Bienes Raíces">Bienes Raíces</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Servicios">Servicios</option>
                    <option value="Educación">Educación</option>
                    <option value="Salud">Salud</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
               <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Conecta tus Canales</h2>
                <p className="text-gray-500 mt-2">Integra tus redes sociales para recibir mensajes.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['WhatsApp', 'Facebook Messenger', 'Instagram'].map((channel) => (
                  <div key={channel} className="border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center space-y-3">
                    <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                      <Plug className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-gray-900">{channel}</span>
                    <button onClick={() => handleConnect(channel)} className="w-full py-2 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors">
                      Conectar
                    </button>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6">
                <button onClick={handleNext} className="text-gray-500 hover:text-gray-700 text-sm underline">
                  Saltar por ahora
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
               <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Invita a tu equipo</h2>
                <p className="text-gray-500 mt-2">Añade colaboradores para que te ayuden a responder.</p>
              </div>
              
              <div className="max-w-md mx-auto space-y-6">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Nombre" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex-1">
                    <input type="email" value={teamEmail} onChange={e => setTeamEmail(e.target.value)} placeholder="Email" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <button onClick={handleAddMember} className="bg-gray-900 text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center">Se les enviará una contraseña temporal</p>

                {teamMembers.length > 0 && (
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-100">
                      {teamMembers.map((member, i) => (
                        <li key={i} className="p-3 flex items-center justify-between bg-gray-50">
                          <span className="text-sm font-medium text-gray-900">{member.nombre}</span>
                          <span className="text-sm text-gray-500">{member.email}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between items-center">
          <button 
            onClick={handleBack} 
            disabled={step === 1}
            className={`flex items-center px-4 py-2 text-sm font-medium ${step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Atrás
          </button>
          
          {step < 3 ? (
            <button 
              onClick={handleNext}
              className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button 
              onClick={() => onComplete && onComplete()}
              className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Completar
              <Check className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default OnboardingWizard;
