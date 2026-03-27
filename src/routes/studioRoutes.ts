import { Router } from 'express';
import {
  createStudio,
  getStudios,
  updateStudio,
  deleteStudio,
  loginStudio,
  getPublicStudioByUsername,
} from '../controllers/studioController';

import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/studios', createStudio);
router.post('/studios/login', loginStudio);

// pública
router.get('/public/studios/:username', getPublicStudioByUsername);

// privadas
router.get('/studios/me', authMiddleware, getStudios);
router.put('/studios/me', authMiddleware, updateStudio);
router.delete('/studios/me', authMiddleware, deleteStudio);

export default router;