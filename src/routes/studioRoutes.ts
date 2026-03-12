//Studio Routes

import { Router } from 'express';
import { createStudio, getStudios, getStudioById, updateStudio, deleteStudio, loginStudio } from '../controllers/studioController.ts';
import { authMiddleware } from '../middlewares/authMiddleware.ts';

const router = Router();

router.post('/studios', createStudio);
router.post('/studios/login', loginStudio);
router.get('/studios', authMiddleware, getStudios);
router.get('/studios/:id', authMiddleware, getStudioById);
router.put('/studios/:id', authMiddleware, updateStudio);
router.delete('/studios/:id', authMiddleware, deleteStudio);

export default router;