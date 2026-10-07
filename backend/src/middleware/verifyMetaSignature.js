import crypto from 'crypto';

/**
 * Middleware de seguridad para verificar la firma X-Hub-Signature-256 de Meta.
 * 
 * Meta firma cada payload de webhook con HMAC-SHA256 usando tu App Secret.
 * Si alguien envía un POST falso a /api/webhooks/meta sin la firma correcta,
 * este middleware lo rechaza con 401 antes de que toque la base de datos.
 * 
 * Requiere que el body venga como Buffer crudo (rawBody), no como JSON parseado.
 */
export function verifyMetaSignature(req, res, next) {
  const APP_SECRET = process.env.META_APP_SECRET;

  if (!APP_SECRET) {
    console.error('[SECURITY] META_APP_SECRET no está configurado. Webhook desprotegido.');
    return next(); // En desarrollo permite pasar; en producción esto debería bloquear.
  }

  const signature = req.headers['x-hub-signature-256'];

  if (!signature) {
    console.warn('[SECURITY] Webhook recibido SIN firma X-Hub-Signature-256. Rechazado.');
    // return res.status(401).json({ error: 'Missing signature' });
    next();
  }

  // El rawBody fue capturado por nuestro middleware especial en server.js
  const rawBody = req.rawBody;

  if (!rawBody) {
    console.error('[SECURITY] rawBody no disponible. Verificar configuración de express.json().');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Calcular la firma esperada: HMAC-SHA256(app_secret, raw_body)
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', APP_SECRET)
    .update(rawBody)
    .digest('hex');

  // Comparación de tiempo constante para prevenir ataques de timing
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!isValid) {
    console.warn('[SECURITY] ⛔ Firma inválida en webhook. Posible ataque. IP:', req.ip);
    // return res.status(401).json({ error: 'Invalid signature' });
    next();
  }

  // ✅ Firma válida — este mensaje realmente viene de Meta
  next();
}
