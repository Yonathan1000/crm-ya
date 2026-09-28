import { Router } from 'express';
import { verifyWebhook, handleIncomingMessage } from '../controllers/metaWebhook.controller.js';

const router = Router();

// Rutas 100% públicas para que Meta (Facebook) pueda tocarlas
router.get('/meta', verifyWebhook);
router.post('/meta', handleIncomingMessage);

export default router;
