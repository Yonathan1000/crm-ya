import { Router } from 'express';
import { createInteraction, getClientInteractions } from '../controllers/interaction.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createInteraction);
router.get('/client/:clientId', getClientInteractions);

export default router;
