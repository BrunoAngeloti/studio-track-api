import { Router } from 'express';
import {
  getDashboardSummary,
  getDashboardTimeline,
  getDashboardCategories,
  getDashboardRepasses,
} from '../controllers/dashboardController.ts';
import { authMiddleware } from '../middlewares/authMiddleware.ts';

const router = Router();

router.get('/dashboard/summary', authMiddleware, getDashboardSummary);
router.get('/dashboard/timeline', authMiddleware, getDashboardTimeline);
router.get('/dashboard/categories', authMiddleware, getDashboardCategories);
router.get('/dashboard/repasses', authMiddleware, getDashboardRepasses);

export default router;