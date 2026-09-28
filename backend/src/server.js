import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import clientRoutes from './routes/client.routes.js';
import interactionRoutes from './routes/interaction.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import automationsRoutes from './routes/automations.routes.js';
import conversationsRoutes from './routes/conversations.routes.js';
import templatesRoutes from './routes/templates.routes.js';
import superadminRoutes from './routes/superadmin.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import usersRoutes from './routes/users.routes.js';
import pipelineStagesRoutes from './routes/pipelineStages.routes.js';
import integrationsRoutes from './routes/integrations.routes.js';
import webhookRoutes from './routes/metaWebhook.routes.js';

import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const port = process.env.PORT || 3001;
const httpServer = createServer(app);

// Inicializar Socket.io
export const io = new Server(httpServer, {
  cors: {
    origin: '*', // En producción puedes limitar esto al dominio de Vercel
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado al WebSocket:', socket.id);
  
  // Los clientes se unirán a una sala con su companyId para recibir solo sus mensajes
  socket.on('join_company', (companyId) => {
    socket.join(companyId);
    console.log(`Socket ${socket.id} unido a la sala de la empresa: ${companyId}`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/automations', automationsRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/pipeline-stages', pipelineStagesRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/webhooks', webhookRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

httpServer.listen(port, () => {
  console.log(`Server and WebSockets are running on port ${port}`);
});
