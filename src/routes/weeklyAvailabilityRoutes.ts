import { Router } from 'express';
import {
  createWeeklyAvailability,
  getWeeklyAvailabilities,
  updateWeeklyAvailability,
  deleteWeeklyAvailability,
} from '../controllers/weeklyAvailabilityController';

import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/weekly-availabilities', authMiddleware, createWeeklyAvailability);
router.get('/weekly-availabilities', authMiddleware, getWeeklyAvailabilities);
router.put('/weekly-availabilities/:id', authMiddleware, updateWeeklyAvailability);
router.delete('/weekly-availabilities/:id', authMiddleware, deleteWeeklyAvailability);

export default router;