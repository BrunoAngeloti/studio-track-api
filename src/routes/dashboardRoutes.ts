import { Router } from 'express';
import {
  getDashboardSummary,
  getDashboardTimeline,
  getDashboardCategories,
  getDashboardRepasses,
} from '../controllers/dashboardController.ts';

const router = Router();

router.get('/dashboard/summary', getDashboardSummary);
router.get('/dashboard/timeline', getDashboardTimeline);
router.get('/dashboard/categories', getDashboardCategories);
router.get('/dashboard/repasses', getDashboardRepasses);

export default router;