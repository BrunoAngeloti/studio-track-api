import { Router } from 'express';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionsController';

import { authMiddleware } from '../middlewares/authMiddleware';
import { requireActiveSubscription } from '../middlewares/requireActiveSubscription';

const router = Router();

router.post('/transactions', authMiddleware, requireActiveSubscription, createTransaction);
router.get('/transactions', authMiddleware, requireActiveSubscription, getTransactions);
router.get('/transactions/:id', authMiddleware, requireActiveSubscription, getTransactionById);
router.put('/transactions/:id', authMiddleware, requireActiveSubscription, updateTransaction);
router.delete('/transactions/:id', authMiddleware, requireActiveSubscription, deleteTransaction);

export default router;