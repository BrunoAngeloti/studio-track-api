import { Router } from 'express';
import {
  getDashboardSummary,
  getDashboardCashflow,
  getDashboardCategories,
  getDashboardPaymentMethods,
  getDashboardEmployees,
  getDashboardRecentTransactions,
} from '../controllers/dashboardController';

import { authMiddleware } from '../middlewares/authMiddleware';
import { requireActiveSubscription } from '../middlewares/requireActiveSubscription';

const router = Router();

router.get('/dashboard/summary', authMiddleware, requireActiveSubscription, getDashboardSummary);
router.get('/dashboard/cashflow', authMiddleware, requireActiveSubscription, getDashboardCashflow);
router.get('/dashboard/categories', authMiddleware, requireActiveSubscription, getDashboardCategories);
router.get('/dashboard/payment-methods', authMiddleware, requireActiveSubscription, getDashboardPaymentMethods);
router.get('/dashboard/employees', authMiddleware, requireActiveSubscription, getDashboardEmployees);
router.get('/dashboard/recent-transactions', authMiddleware, requireActiveSubscription, getDashboardRecentTransactions);

export default router;