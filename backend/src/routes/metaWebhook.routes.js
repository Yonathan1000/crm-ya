import { Router } from 'express';
import { verifyWebhook, handleIncomingMessage } from '../controllers/metaWebhook.controller.js';
import { verifyMetaSignature } from '../middleware/verifyMetaSignature.js';

const router = Router();

// GET: Verificación inicial de Meta (handshake) — debe ser público
router.get('/meta', verifyWebhook);

// POST: Recepción de mensajes — protegido con verificación de firma HMAC-SHA256
router.post('/meta', verifyMetaSignature, handleIncomingMessage);


router.get('/logs', (req, res) => {
  res.json(global.webhookLogs || []);
});
export default router;

