export const checkRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    // Allow superadmins to bypass
    if (req.user?.isSuperAdmin) return next();
    return res.status(403).json({ error: 'Acceso denegado. No tienes los permisos necesarios.' });
  }
  next();
};
