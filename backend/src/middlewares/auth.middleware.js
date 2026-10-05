import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

// Seguridad: Advertir si se usa el secret de desarrollo en producción
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'fallback_secret_for_dev') {
  console.error('⛔ [SECURITY] JWT_SECRET no está configurado en producción. ¡Configúralo de inmediato!');
}

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Distinguir entre token expirado vs. token manipulado/inválido
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token', code: 'TOKEN_INVALID' });
  }
};
