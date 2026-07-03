import { Router } from 'express';
import {
  createStudio,
  getStudios,
  updateStudio,
  updateStudioType,
  updateBookingHorizon,
  updateOnboardingCompleted,
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
router.patch('/studios/me/type', authMiddleware, updateStudioType);
router.patch('/studios/me/booking-horizon', authMiddleware, updateBookingHorizon);
router.patch('/studios/me/onboarding', authMiddleware, updateOnboardingCompleted);
router.delete('/studios/me', authMiddleware, deleteStudio);

export default router;