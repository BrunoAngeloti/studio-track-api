import { Router } from 'express';
import {
  createWeeklyAvailability,
  getWeeklyAvailabilities,
  updateWeeklyAvailability,
  deleteWeeklyAvailability,
} from '../controllers/weeklyAvailabilityController';

import { authMiddleware } from '../middlewares/authMiddleware';
import { requireActiveSubscription } from '../middlewares/requireActiveSubscription';

const router = Router();

router.post('/weekly-availabilities', authMiddleware, requireActiveSubscription, createWeeklyAvailability);
router.get('/weekly-availabilities', authMiddleware, requireActiveSubscription, getWeeklyAvailabilities);
router.put('/weekly-availabilities/:id', authMiddleware, requireActiveSubscription, updateWeeklyAvailability);
router.delete('/weekly-availabilities/:id', authMiddleware, requireActiveSubscription, deleteWeeklyAvailability);

export default router;