const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend', 'src', 'components');

function replaceInFile(filePath) {
    if (!filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace fetch('http://localhost:3001/api...') with fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api...`)
    // Replace fetch(`http://localhost:3001/api...`) with fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api...`)
    
    // Using a regex to catch different quote styles
    content = content.replace(/['"`]http:\/\/localhost:3001([^'"`]*)['"`]/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}$1`");

    fs.writeFileSync(filePath, content, 'utf8');
}

function traverseDirectory(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            traverseDirectory(fullPath);
        } else {
            replaceInFile(fullPath);
        }
    });
}

traverseDirectory(directoryPath);
console.log('URLs actualizadas en el frontend.');
