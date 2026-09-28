const fs = require('fs');
let code = fs.readFileSync('d:/Documentos/YA/backend/src/server.js', 'utf8');

code = code.replace("import usersRoutes from './routes/users.routes.js';", "import usersRoutes from './routes/users.routes.js';\nimport pipelineStagesRoutes from './routes/pipelineStages.routes.js';");
code = code.replace("app.use('/api/users', usersRoutes);", "app.use('/api/users', usersRoutes);\napp.use('/api/pipeline-stages', pipelineStagesRoutes);");

fs.writeFileSync('d:/Documentos/YA/backend/src/server.js', code);
