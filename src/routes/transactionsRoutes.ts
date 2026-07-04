import { Router } from 'express';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  approveTransaction,
  rejectTransaction,
  deleteTransaction,
} from '../controllers/transactionsController';

import { authMiddleware } from '../middlewares/authMiddleware';
import { requireActiveSubscription } from '../middlewares/requireActiveSubscription';

const router = Router();

router.post('/transactions', authMiddleware, requireActiveSubscription, createTransaction);
router.get('/transactions', authMiddleware, requireActiveSubscription, getTransactions);
router.get('/transactions/:id', authMiddleware, requireActiveSubscription, getTransactionById);
router.put('/transactions/:id', authMiddleware, requireActiveSubscription, updateTransaction);
router.patch('/transactions/:id/approve', authMiddleware, requireActiveSubscription, approveTransaction);
router.patch('/transactions/:id/reject', authMiddleware, requireActiveSubscription, rejectTransaction);
router.delete('/transactions/:id', authMiddleware, requireActiveSubscription, deleteTransaction);

export default router;