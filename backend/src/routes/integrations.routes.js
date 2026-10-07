import express from 'express';
import { getIntegrations, getFacebookAuthUrl, handleFacebookCallback, saveManualWhatsapp } from '../controllers/integrations.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getIntegrations);
router.get('/meta/auth-url', authMiddleware, getFacebookAuthUrl);
router.get('/meta/callback', handleFacebookCallback);
router.post('/whatsapp/manual', authMiddleware, saveManualWhatsapp); // NUEVO ENDPOINT

export default router;
