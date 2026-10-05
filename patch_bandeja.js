const fs = require('fs');

let content = fs.readFileSync('frontend/src/components/Bandeja.jsx', 'utf8');

// Imports
content = content.replace(
  import React, { useState, useEffect } from 'react';,
  import React, { useState, useEffect } from 'react';\nimport toast from 'react-hot-toast';\nimport { MessageSquareDashed, Loader2, SearchX } from 'lucide-react';
);

// Loading state
content = content.replace(
  const [templateSearch, setTemplateSearch] = useState('');,
  const [templateSearch, setTemplateSearch] = useState('');\n  const [isLoadingChats, setIsLoadingChats] = useState(true);
);

// Stop loading in fetchConversations
content = content.replace(
  } catch (err) {,
  } catch (err) {\n      console.error('Error fetching conversations:', err);\n    } finally {\n      setIsLoadingChats(false);\n    }\n  };\n\n  const stub = (e) => {
);
content = content.replace(  const stub = (e) => {,   // placeholder);

// Toast in saving lead
content = content.replace(
  setActiveConv(prev => ({ ...prev, client: updatedClient }));,
  setActiveConv(prev => ({ ...prev, client: updatedClient }));\n      toast.success('Perfil actualizado correctamente');
);
content = content.replace(
  console.error('Error al guardar lead:', e);,
  console.error('Error al guardar lead:', e);\n      toast.error('Error al guardar los cambios');
);

// Sending message success
content = content.replace(
  etchConversations();\n    } catch (err) {,
  etchConversations();\n    } catch (err) {
);

// Empty States and Loaders UI
const centerColumnRegex = /<div className="w-2\/4 flex flex-col bg-\[#F4F5F7\] border-r border-gray-200">[\s\S]*?(?=<!-- Columna Derecha)/;
content = content.replace(
  <div className="w-2/4 flex flex-col bg-[#F4F5F7] border-r border-gray-200">
        {activeConv ? (,
  <div className="w-2/4 flex flex-col bg-[#F4F5F7] border-r border-gray-200 relative">
        {isLoadingChats ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Cargando conversaciones...</p>
          </div>
        ) : activeConv ? (
);

content = content.replace(
            <div className="flex-1 flex items-center justify-center text-gray-500">
            Selecciona una conversación para empezar a chatear.
          </div>,
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquareDashed className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">Tu Bandeja de Entrada</h3>
            <p className="text-sm text-gray-500 max-w-xs text-center">Selecciona un chat en el menú de la izquierda para empezar a conversar o responder.</p>
          </div>
);


// Lista de chats vacío
content = content.replace(
  {conversations.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              No hay conversaciones disponibles.
            </div>
          )},
  {conversations.length === 0 && !isLoadingChats && (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
              <SearchX className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-600">Aún no hay chats</p>
              <p className="text-xs text-gray-400 mt-1">Tus nuevos mensajes de redes sociales aparecerán aquí.</p>
            </div>
          )}
          
          {isLoadingChats && (
            <div className="p-4 space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
);


fs.writeFileSync('frontend/src/components/Bandeja.jsx', content);
console.log('Bandeja editada exitosamente');
