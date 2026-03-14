import { Router } from 'express';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getArchivedCustomers,
  archiveCustomer,
  unarchiveCustomer,

} from '../controllers/customerController.ts';

import { authMiddleware } from '../middlewares/authMiddleware.ts';

const router = Router();

router.post('/customers', authMiddleware, createCustomer);
router.get('/customers', authMiddleware, getCustomers);
router.get('/customers/archived', authMiddleware, getArchivedCustomers);
router.patch('/customers/:id/archive', authMiddleware, archiveCustomer);
router.patch('/customers/:id/unarchive', authMiddleware, unarchiveCustomer);

router.get('/customers/:id', authMiddleware, getCustomerById);
router.put('/customers/:id', authMiddleware, updateCustomer);
router.delete('/customers/:id', authMiddleware, deleteCustomer);

export default router;