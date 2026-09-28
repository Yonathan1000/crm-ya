const fs = require('fs');
const path = require('path');

const dir = 'd:\\Documentos\\YA\\frontend\\src\\components';

function addAuthHeaderToFetch(content) {
  // Regex to match fetch('http...') or fetch(`http...`)
  // and inject headers.
  return content.replace(/fetch\(\s*(`[^`]+`|'[^']+'|"[^"]+"|[^,]+)\s*(?:,\s*(\{[\s\S]*?\}))?\s*\)/g, (match, url, optionsStr) => {
    // If it's not a URL string we care about, we still patch it just in case if it's relative or to our API.
    if (!url.includes('http') && !url.includes('/api/')) return match;
    
    // Check if options exist
    if (optionsStr) {
      if (!optionsStr.includes('Authorization')) {
        // Inject headers
        const newOptions = optionsStr.replace(/\{/, `{ headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\`, 'Content-Type': 'application/json', ...((${optionsStr}).headers || {}) }, `);
        return `fetch(${url}, ${newOptions})`;
      }
      return match; // Already has auth or something
    } else {
      return `fetch(${url}, { headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\`, 'Content-Type': 'application/json' } })`;
    }
  });
}

const filesToPatch = [
  'PipelineBoard.jsx',
  'Automatizaciones.jsx',
  'Bandeja.jsx',
  'Contactos.jsx',
  'Tareas.jsx',
  'Plantillas.jsx',
  'BotBuilder.jsx'
];

for (const file of filesToPatch) {
  const p = path.join(dir, file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    content = addAuthHeaderToFetch(content);
    
    // Specific patches
    if (file === 'BotBuilder.jsx') {
      content = content.replace(/companyId:\s*'company-1'\s*,?/g, '');
    }
    
    fs.writeFileSync(p, content, 'utf-8');
    console.log(`Patched ${file}`);
  }
}

// SidebarYA.jsx patch
const sidebarPath = path.join(dir, 'SidebarYA.jsx');
if (fs.existsSync(sidebarPath)) {
  let content = fs.readFileSync(sidebarPath, 'utf-8');
  content = content.replace(/const MOCK_USER = \{[\s\S]*?\};/, `
  const [userData, setUserData] = useState({ name: 'Usuario', initials: 'U', avatarUrl: null });
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3001/api/users/profile', {
          headers: { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          const name = data.nombre || 'Usuario';
          setUserData({
            name,
            initials: name.substring(0, 2).toUpperCase(),
            avatarUrl: data.avatarUrl || null
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);
  `);
  content = content.replace(/MOCK_USER\.name/g, 'userData.name');
  content = content.replace(/MOCK_USER\.initials/g, 'userData.initials');
  content = content.replace(/MOCK_USER\.avatarUrl/g, 'userData.avatarUrl');
  if (!content.includes('useEffect')) {
    content = content.replace(/import React, \{ useState \} from 'react';/, "import React, { useState, useEffect } from 'react';");
  }
  fs.writeFileSync(sidebarPath, content, 'utf-8');
  console.log('Patched SidebarYA.jsx');
}

// PipelineBoard.jsx patch 2
const pipelinePath = path.join(dir, 'PipelineBoard.jsx');
if (fs.existsSync(pipelinePath)) {
  let content = fs.readFileSync(pipelinePath, 'utf-8');
  content = content.replace(/const mockAssignees = \[.*?\];/s, `
  const mockAssignees = [...new Set(leads.map(l => l.assignedTo).filter(Boolean))];
  `);
  content = content.replace(/const mockTags = \[.*?\];/s, `
  const mockTags = [...new Set(leads.flatMap(l => l.tags || []))];
  `);
  fs.writeFileSync(pipelinePath, content, 'utf-8');
  console.log('Patched PipelineBoard.jsx tags');
}

// LeadDetailModal.jsx
const leadDetailPath = path.join(dir, 'LeadDetailModal.jsx');
if (fs.existsSync(leadDetailPath)) {
  let content = fs.readFileSync(leadDetailPath, 'utf-8');
  content = addAuthHeaderToFetch(content);
  content = content.replace(/const mockActivities = \[[\s\S]*?\];/, `
  const [mockActivities, setMockActivities] = useState([]);
  useEffect(() => {
    if (!lead || !lead.id) return;
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(\`http://localhost:3001/api/interactions/client/\${lead.id}\`, {
          headers: { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          setMockActivities(data);
        }
      } catch (err) { console.error(err); }
    };
    fetchActivities();
  }, [lead]);
  `);
  // Note save button
  content = content.replace(/console\.log\('Guardando nota:', newNote\);/, `
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3001/api/interactions', {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'Nota', notas: newNote, client_id: lead.id })
      });
      // Refresh activities if needed, for now just clear
    } catch (err) { console.error(err); }
  `);
  if (!content.includes('useEffect')) {
    content = content.replace(/import React, \{ useState \} from 'react';/, "import React, { useState, useEffect } from 'react';");
  }
  fs.writeFileSync(leadDetailPath, content, 'utf-8');
  console.log('Patched LeadDetailModal.jsx');
}

// DashboardInicio.jsx
const dashboardPath = path.join(dir, 'DashboardInicio.jsx');
if (fs.existsSync(dashboardPath)) {
  let content = fs.readFileSync(dashboardPath, 'utf-8');
  content = addAuthHeaderToFetch(content);
  content = content.replace(/const noticias = \[[\s\S]*?\];/, `
  const noticias = [
    {
      id: 1,
      titulo: '¡Bienvenido al CRM YA!',
      fecha: 'Novedades',
      contenido: 'Tu plataforma está lista. Empieza creando tu primer lead o revisando tus tareas pendientes.',
      tipo: 'feature',
    }
  ];
  `);
  content = content.replace(/const actividadReciente = \[[\s\S]*?\];/, `
  const [actividadReciente, setActividadReciente] = useState([]);
  useEffect(() => {
    const fetchActividad = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3001/api/analytics/dashboard', {
          headers: { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.recentActivity) setActividadReciente(data.recentActivity);
        }
      } catch (err) {}
    };
    fetchActividad();
  }, []);
  `);
  fs.writeFileSync(dashboardPath, content, 'utf-8');
  console.log('Patched DashboardInicio.jsx');
}

