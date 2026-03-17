import { Router } from 'express';
import {
  getDashboardSummary,
  getDashboardCashflow,
  getDashboardCategories,
  getDashboardPaymentMethods,
  getDashboardEmployees,
  getDashboardRecentTransactions,
} from '../controllers/dashboardController.ts';

import { authMiddleware } from '../middlewares/authMiddleware.ts';

const router = Router();

router.get('/dashboard/summary', authMiddleware, getDashboardSummary);
router.get('/dashboard/cashflow', authMiddleware, getDashboardCashflow);
router.get('/dashboard/categories', authMiddleware, getDashboardCategories);
router.get('/dashboard/payment-methods', authMiddleware, getDashboardPaymentMethods);
router.get('/dashboard/employees', authMiddleware, getDashboardEmployees);
router.get('/dashboard/recent-transactions', authMiddleware, getDashboardRecentTransactions);

export default router;