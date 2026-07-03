import { Router } from 'express';
import {
  createAvailabilityOverride,
  getAvailabilityOverrides,
  updateAvailabilityOverride,
  deleteAvailabilityOverride,
} from '../controllers/availabilityOverridesController';

import { authMiddleware } from '../middlewares/authMiddleware';
import { requireActiveSubscription } from '../middlewares/requireActiveSubscription';

const router = Router();

router.post('/availability-overrides', authMiddleware, requireActiveSubscription, createAvailabilityOverride);
router.get('/availability-overrides', authMiddleware, requireActiveSubscription, getAvailabilityOverrides);
router.put('/availability-overrides/:id', authMiddleware, requireActiveSubscription, updateAvailabilityOverride);
router.delete('/availability-overrides/:id', authMiddleware, requireActiveSubscription, deleteAvailabilityOverride);

export default router;