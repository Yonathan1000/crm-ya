const fs = require('fs');
const path = require('path');

const dir = 'd:\\Documentos\\YA\\frontend\\src\\components';

function addAuthToFetch(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Insert token reading inside components if not exists?
  // Easier: replace `fetch(` with an async IIFE or we can just replace the fetch calls that match:
  // fetch('http...')
  
  // Actually, we can use regex to find `fetch(URL)` and `fetch(URL, options)`.
  const fetchRegex = /fetch\(([^,]+)(,\s*\{([\s\S]*?)\})?\)/g;
  let hasChanges = false;
  
  // We need to make sure we don't break existing headers.
  let newContent = content.replace(fetchRegex, (match, p1, p2, p3) => {
    // If it's not an API fetch, ignore
    if (!p1.includes('http://localhost:3001') && !p1.includes('/api/')) return match;

    hasChanges = true;
    let newOptions = p3 || '';
    
    // Add token
    const tokenStr = `
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('token')}\`,
        'Content-Type': 'application/json',
        ...((${newOptions || '{}'}).headers || {})
      }`;

    // Reconstruct options
    if (newOptions) {
      // Remove existing headers if we are merging? 
      // It's a bit tricky to parse JS objects with regex.
      // Let's just do a simple replacement for the files we know.
    }
    return match;
  });
}
