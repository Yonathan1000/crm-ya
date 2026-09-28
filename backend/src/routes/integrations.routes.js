import { Router } from 'express';
import { getIntegrations, getFacebookAuthUrl, handleFacebookCallback } from '../controllers/integrations.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas protegidas (Requieren token del inquilino)
router.get('/', authMiddleware, getIntegrations);
router.get('/meta/auth-url', authMiddleware, getFacebookAuthUrl);

// Ruta pública (Meta nos redirige aquí, no trae Header Authorization, usa query code)
router.get('/meta/callback', handleFacebookCallback);

export default router;
