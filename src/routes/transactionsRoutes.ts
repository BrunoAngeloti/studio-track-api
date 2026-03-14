import { Router } from 'express';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionsController.ts';

import { authMiddleware } from '../middlewares/authMiddleware.ts';

const router = Router();

router.post('/transactions', authMiddleware, createTransaction);
router.get('/transactions', authMiddleware, getTransactions);
router.get('/transactions/:id', authMiddleware, getTransactionById);
router.put('/transactions/:id', authMiddleware, updateTransaction);
router.delete('/transactions/:id', authMiddleware, deleteTransaction);

export default router;