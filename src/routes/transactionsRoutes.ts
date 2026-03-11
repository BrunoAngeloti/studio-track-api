import { Router } from 'express';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  getTransactionsByStudioId,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionsController.ts';

const router = Router();

router.post('/transactions', createTransaction);
router.get('/transactions', getTransactions);
router.get('/transactions/studio/:studioId', getTransactionsByStudioId);
router.get('/transactions/:id', getTransactionById);
router.put('/transactions/:id', updateTransaction);
router.delete('/transactions/:id', deleteTransaction);

export default router;