// Studio Routes

import { Router } from 'express';
import {
  createStudio,
  getStudios,
  updateStudio,
  deleteStudio,
  loginStudio
} from '../controllers/studioController.ts';

import { authMiddleware } from '../middlewares/authMiddleware.ts';

const router = Router();

router.post('/studios', createStudio);
router.post('/studios/login', loginStudio);

router.get('/studios/me', authMiddleware, getStudios);
router.put('/studios/me', authMiddleware, updateStudio);
router.delete('/studios/me', authMiddleware, deleteStudio);

export default router;