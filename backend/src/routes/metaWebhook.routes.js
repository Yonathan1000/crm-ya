import { Router } from 'express';
import { verifyWebhook, handleIncomingMessage } from '../controllers/metaWebhook.controller.js';
import { verifyMetaSignature } from '../middleware/verifyMetaSignature.js';

const router = Router();

// GET: Verificación inicial de Meta (handshake) — acepta tanto / como /meta
router.get('/', verifyWebhook);
router.get('/meta', verifyWebhook);

// POST: Recepción de mensajes — acepta tanto / como /meta
router.post('/', verifyMetaSignature, handleIncomingMessage);
router.post('/meta', verifyMetaSignature, handleIncomingMessage);

router.get('/logs', (req, res) => {
  res.json(global.webhookLogs || []);
});
export default router;

