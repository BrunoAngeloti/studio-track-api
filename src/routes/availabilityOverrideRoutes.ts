import { Router } from 'express';
import {
  createAvailabilityOverride,
  getAvailabilityOverrides,
  updateAvailabilityOverride,
  deleteAvailabilityOverride,
} from '../controllers/availabilityOverridesController';

import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/availability-overrides', authMiddleware, createAvailabilityOverride);
router.get('/availability-overrides', authMiddleware, getAvailabilityOverrides);
router.put('/availability-overrides/:id', authMiddleware, updateAvailabilityOverride);
router.delete('/availability-overrides/:id', authMiddleware, deleteAvailabilityOverride);

export default router;