import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export default function Bandeja() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [message, setMessage] = useState('');
  
  const [templates, setTemplates] = useState([]);
  const [showTemplatePopover, setShowTemplatePopover] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');

  // --- LEAD EDITING STATE ---
  const [editLeadData, setEditLeadData] = useState({});
  const [isSavingLead, setIsSavingLead] = useState(false);

  useEffect(() => {
    if (activeConv?.client) {
      setEditLeadData({
        nombre: activeConv.client.nombre || '',
        telefono: activeConv.client.telefono || '',
        email: activeConv.client.email || '',
        empresa: activeConv.client.empresa || '',
        estado_lead: activeConv.client.estado_lead || 'Nuevo'
      });
    }
  }, [activeConv]);

  const handleLeadChange = (e) => {
    const { name, value } = e.target;
    setEditLeadData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveLead = async () => {
    if (!activeConv?.client?.id) return;
    setIsSavingLead(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/clients/${activeConv.client.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editLeadData)
      });
      const updatedClient = await res.json();
      
      setActiveConv(prev => ({ ...prev, client: updatedClient }));
      setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, client: updatedClient } : c));
    } catch(e) {
      console.error('Error al guardar lead:', e);
    } finally {
      setIsSavingLead(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setConversations(data);
      if (data.length > 0) {
        setActiveConv((prev) => {
          if (!prev) return data[0];
          const updated = data.find(c => c.id === prev.id);
          return updated || data[0];
        });
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchTemplates();
    
    // --- LÓGICA DE SOCKET.IO ---
    const token = localStorage.getItem('token');
    if (!token) return;

    // Decodificar el token para sacar el companyId (En un caso real se usa JWT decode, aquí hacemos fetch primero o usamos el socket server)
    // Para simplificar, le diremos al servidor que detecte el companyId basandose en el token, o que mande el companyId desde el frontend
    const payload = JSON.parse(atob(token.split('.')[1]));
    const companyId = payload.companyId;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001');
    
    socket.on('connect', () => {
      socket.emit('join_company', companyId);
    });

    socket.on('new_message', (data) => {
      console.log('Mensaje en tiempo real recibido:', data);
      setConversations(prevConvs => {
        const convExists = prevConvs.find(c => c.id === data.conversationId);
        
        if (convExists) {
          // Actualizar conversacion existente
          return prevConvs.map(c => {
            if (c.id === data.conversationId) {
              const updatedMessages = [...(c.messages || []), data.message];
              const updatedConv = { ...c, messages: updatedMessages };
              
              // Actualizar ventana activa si estamos parados ahí
              setActiveConv(prevActive => {
                if (prevActive && prevActive.id === data.conversationId) {
                  return updatedConv;
                }
                return prevActive;
              });

              return updatedConv;
            }
            return c;
          });
        } else {
          // Si es nueva conversación, agregarla (podríamos recargar todo o construir el objeto)
          fetchConversations(); // Recargar todo es más fácil para capturar los Joins
          return prevConvs;
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!message.trim() || !activeConv) return;
    
    const contentToSend = message;
    setMessage('');
    setShowTemplatePopover(false);

    const optimisticMessage = {
      id: Date.now(),
      content: contentToSend,
      direction: 'OUTBOUND',
      created_at: new Date().toISOString()
    };

    const updatedActive = {
      ...activeConv,
      messages: [...(activeConv.messages || []), optimisticMessage]
    };

    setActiveConv(updatedActive);
    setConversations(prev => prev.map(c => c.id === activeConv.id ? updatedActive : c));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/conversations/${activeConv.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: contentToSend, direction: 'OUTBOUND' })
      });
      
      if (!res.ok) {
        throw new Error('Error de Meta');
      }
      
      // Si todo sale bien, lo dejamos como estaba y recargamos para tener el ID real de la base de datos
      fetchConversations();
    } catch (err) {
      console.error("Error sending message:", err);
      // Marcar el mensaje como FAILED en el UI
      const failedMessage = { ...optimisticMessage, status: 'FAILED' };
      const failedActive = {
        ...activeConv,
        messages: activeConv.messages ? activeConv.messages.map(m => m.id === optimisticMessage.id ? failedMessage : m) : [failedMessage]
      };
      setActiveConv(failedActive);
      setConversations(prev => prev.map(c => c.id === activeConv.id ? failedActive : c));
    }
  };

  const handleMessageChange = (e) => {
    const val = e.target.value;
    setMessage(val);
    
    const words = val.split(' ');
    const lastWord = words[words.length - 1];
    
    if (lastWord.startsWith('/')) {
      setShowTemplatePopover(true);
      setTemplateSearch(lastWord.substring(1).toLowerCase());
    } else {
      setShowTemplatePopover(false);
    }
  };

  const handleSelectTemplate = (templateContent) => {
    const words = message.split(' ');
    words[words.length - 1] = templateContent;
    setMessage(words.join(' '));
    setShowTemplatePopover(false);
  };

  const filteredTemplates = templates.filter(t => t.name.toLowerCase().includes(templateSearch));

  const renderIcon = (platform) => {
    const plat = platform?.toLowerCase();
    if (plat === 'whatsapp') {
      return (
        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/></svg>
      );
    }
    if (plat === 'instagram') {
      return (
        <svg className="w-3 h-3 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      );
    }
    if (plat === 'messenger') {
      return (
        <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.896 1.424 5.485 3.665 7.187V22l3.344-1.836c.94.26 1.942.4 2.991.4 5.523 0 10-4.145 10-9.259S17.523 2 12 2zm1.094 12.355l-2.8-2.985-5.467 2.985 6.002-6.388 2.871 2.985 5.395-2.985-6.001 6.388z"/></svg>
      );
    }
    return null;
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const messagesEndRef = React.useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const sortedConversations = [...conversations].sort((a, b) => {
    const lastMsgA = a.messages && a.messages.length > 0 ? a.messages[a.messages.length - 1] : null;
    const lastMsgB = b.messages && b.messages.length > 0 ? b.messages[b.messages.length - 1] : null;
    const timeA = lastMsgA ? new Date(lastMsgA.timestamp || lastMsgA.created_at).getTime() : new Date(a.created_at || 0).getTime();
    const timeB = lastMsgB ? new Date(lastMsgB.timestamp || lastMsgB.created_at).getTime() : new Date(b.created_at || 0).getTime();
    return timeB - timeA;
  });

  return (
    <div className="flex h-full w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-gray-800">
      
      {/* Columna Izquierda: Lista de Chats */}
      <div className="w-1/4 border-r border-gray-200 flex flex-col bg-[#F4F5F7]">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold mb-3">Lista de Chats</h2>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Buscar en chats..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {sortedConversations.map((conv) => {
            const clientName = conv.client?.nombre || 'Cliente Desconocido';
            const platform = conv.channel?.platform || 'Desconocido';
            const lastMessage = conv.messages && conv.messages.length > 0 
              ? conv.messages[conv.messages.length - 1] 
              : null;
            
            return (
              <div 
                key={conv.id} 
                onClick={() => setActiveConv(conv)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${activeConv?.id === conv.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm truncate">{clientName}</span>
                  <span className="text-xs text-gray-500">{formatTime(lastMessage?.created_at)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="truncate mr-2">{lastMessage?.content || 'Sin mensajes'}</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-gray-400 uppercase">
                  {renderIcon(platform)}
                  {platform}
                </div>
              </div>
            );
          })}
          {conversations.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              No hay conversaciones disponibles.
            </div>
          )}
        </div>
      </div>

      {/* Columna Central: Ventana de Chat */}
      <div className="w-2/4 flex flex-col bg-[#F4F5F7] border-r border-gray-200">
        {activeConv ? (
          <>
            <div className="shrink-0 p-4 bg-white border-b border-gray-200 flex items-center shadow-sm z-10">
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold mr-3">
                {(activeConv.client?.nombre || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-bold text-gray-800">{activeConv.client?.nombre || 'Cliente'}</h2>
                <p className="text-xs text-gray-500 capitalize">{activeConv.channel?.platform || 'Desconocido'}</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(activeConv.messages || []).map((msg) => {
                const isOutbound = msg.direction === 'OUTBOUND';
                return (
                  <div key={msg.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isOutbound 
                        ? (msg.status === 'FAILED' ? 'bg-red-500 text-white rounded-br-none' : 'bg-indigo-600 text-white rounded-br-none') 
                        : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-[10px] mt-1 text-right ${isOutbound ? (msg.status === 'FAILED' ? 'text-red-100' : 'text-indigo-100') : 'text-gray-400'}`}>
                        {msg.status === 'FAILED' ? '?? Error al enviar (Meta)' : formatTime(msg.timestamp || msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="shrink-0 p-4 bg-white border-t border-gray-200 relative">
              {showTemplatePopover && filteredTemplates.length > 0 && (
                <div className="absolute bottom-full left-4 mb-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 text-xs font-semibold text-gray-500">
                    Plantillas (Presiona click para insertar)
                  </div>
                  <ul className="max-h-48 overflow-y-auto">
                    {filteredTemplates.map(tpl => (
                      <li 
                        key={tpl.id}
                        onClick={() => handleSelectTemplate(tpl.content)}
                        className="px-4 py-2 hover:bg-indigo-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                      >
                        <div className="font-semibold text-sm text-indigo-700">/{tpl.name}</div>
                        <div className="text-xs text-gray-500 truncate mt-0.5">{tpl.content}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={message}
                  onChange={handleMessageChange}
                  placeholder="Escribe un mensaje... Usa '/' para plantillas" 
                  className="flex-1 px-4 py-2 bg-[#F4F5F7] border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button type="submit" className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-sm disabled:opacity-50" disabled={!message.trim()}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Selecciona una conversación para empezar a chatear.
          </div>
        )}
      </div>

      {/* Columna Derecha: Detalles del Lead */}
      <div className="w-1/4 bg-white flex flex-col p-6 overflow-y-auto">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex justify-between items-center">
          Detalles del Lead
          {activeConv && (
            <button 
              onClick={handleSaveLead}
              disabled={isSavingLead}
              className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full hover:bg-indigo-100 transition font-semibold"
            >
              {isSavingLead ? 'Guardando...' : 'Guardar'}
            </button>
          )}
        </h3>
        
        {activeConv ? (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-3xl mb-4">
                {(editLeadData.nombre || '?').charAt(0).toUpperCase()}
              </div>
              <input 
                type="text"
                name="nombre"
                value={editLeadData.nombre || ''}
                onChange={handleLeadChange}
                className="text-xl font-bold text-gray-800 text-center w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none transition-colors pb-1"
                placeholder="Nombre del Lead"
              />
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Origen del Lead</label>
                <div className="w-full py-2 px-3 bg-gray-50 text-gray-700 text-sm rounded-lg border border-gray-200 capitalize flex items-center gap-2">
                  {renderIcon(activeConv.channel?.platform)}
                  {activeConv.channel?.platform || 'Desconocido'}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Etapa en Pipeline</label>
                <select 
                  name="estado_lead"
                  value={editLeadData.estado_lead || 'Nuevo'}
                  onChange={handleLeadChange}
                  className="w-full py-2 px-3 bg-yellow-50 text-yellow-800 font-semibold text-sm rounded-lg border border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 capitalize"
                >
                  <option value="Nuevo">Nuevo Prospecto</option>
                  <option value="Contactado">Contactado</option>
                  <option value="Negociación">Negociación</option>
                  <option value="Ganado">Ganado</option>
                  <option value="Perdido">Perdido</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Teléfono</label>
                <input 
                  type="text"
                  name="telefono"
                  value={editLeadData.telefono || ''}
                  onChange={handleLeadChange}
                  className="w-full py-2 px-3 bg-white text-gray-800 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Email</label>
                <input 
                  type="email"
                  name="email"
                  value={editLeadData.email || ''}
                  onChange={handleLeadChange}
                  className="w-full py-2 px-3 bg-white text-gray-800 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="cliente@correo.com"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Empresa</label>
                <input 
                  type="text"
                  name="empresa"
                  value={editLeadData.empresa || ''}
                  onChange={handleLeadChange}
                  className="w-full py-2 px-3 bg-white text-gray-800 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nombre de la empresa"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-sm text-gray-500 mt-10">
            No hay detalles disponibles.
          </div>
        )}
      </div>

    </div>
  );
}
