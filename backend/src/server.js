import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
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

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// ── Rate Limiting ──────────────────────────────────────────────────────────
// Limita las peticiones por IP para prevenir ataques de fuerza bruta y DDoS

// Rate Limiter estricto para login/registro (5 intentos por minuto)
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  message: { error: 'Demasiados intentos. Espera 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate Limiter general para la API (100 peticiones por minuto por IP)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Límite de peticiones excedido. Intenta de nuevo en un momento.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Webhook: capturar rawBody ANTES de parsear JSON ────────────────────────
// Meta firma el body crudo con HMAC-SHA256. Si Express parsea el JSON primero,
// perdemos los bytes originales y no podemos verificar la firma.
app.use('/api/webhooks', express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));

// JSON parser para el resto de rutas (sin captura de rawBody)
app.use(express.json());

// ── Rutas ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/clients', apiLimiter, clientRoutes);
app.use('/api/interactions', apiLimiter, interactionRoutes);
app.use('/api/tasks', apiLimiter, tasksRoutes);
app.use('/api/automations', apiLimiter, automationsRoutes);
app.use('/api/conversations', apiLimiter, conversationsRoutes);
app.use('/api/templates', apiLimiter, templatesRoutes);
app.use('/api/superadmin', apiLimiter, superadminRoutes);
app.use('/api/analytics', apiLimiter, analyticsRoutes);
app.use('/api/users', apiLimiter, usersRoutes);
app.use('/api/pipeline-stages', apiLimiter, pipelineStagesRoutes);
app.use('/api/integrations', apiLimiter, integrationsRoutes);
app.use('/api/webhooks', webhookRoutes); // Sin rate limiter — Meta envía muchos eventos

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

httpServer.listen(port, () => {
  console.log(`Server and WebSockets are running on port ${port}`);
});
