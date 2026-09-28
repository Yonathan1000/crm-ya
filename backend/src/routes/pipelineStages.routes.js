import { Router } from 'express';
import { getStages, createStage, updateStage, deleteStage } from '../controllers/pipelineStages.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

router.get('/', getStages);
router.post('/', createStage);
router.put('/:id', updateStage);
router.delete('/:id', deleteStage);

export default router;
