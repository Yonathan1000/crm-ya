import { Router } from 'express';
import { register, login, me, updateProfile, updatePassword } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.put('/profile', authMiddleware, updateProfile);
router.put('/password', authMiddleware, updatePassword);

export default router;
