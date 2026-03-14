import { Router } from 'express';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  getCustomersByStudioId,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.ts';

import { authMiddleware } from '../middlewares/authMiddleware.ts';

const router = Router();

router.post('/customers', authMiddleware, createCustomer);
router.get('/customers', authMiddleware, getCustomers);
router.get('/customers/studio/:studioId', authMiddleware, getCustomersByStudioId);
router.get('/customers/:id', authMiddleware, getCustomerById);
router.put('/customers/:id', authMiddleware, updateCustomer);
router.delete('/customers/:id', authMiddleware, deleteCustomer);

export default router;