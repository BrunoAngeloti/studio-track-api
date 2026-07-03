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

} from '../controllers/customerController';

import { authMiddleware } from '../middlewares/authMiddleware';
import { requireActiveSubscription } from '../middlewares/requireActiveSubscription';

const router = Router();

router.post('/customers', authMiddleware, requireActiveSubscription, createCustomer);
router.get('/customers', authMiddleware, requireActiveSubscription, getCustomers);
router.get('/customers/archived', authMiddleware, requireActiveSubscription, getArchivedCustomers);
router.patch('/customers/:id/archive', authMiddleware, requireActiveSubscription, archiveCustomer);
router.patch('/customers/:id/unarchive', authMiddleware, requireActiveSubscription, unarchiveCustomer);

router.get('/customers/:id', authMiddleware, requireActiveSubscription, getCustomerById);
router.put('/customers/:id', authMiddleware, requireActiveSubscription, updateCustomer);
router.delete('/customers/:id', authMiddleware, requireActiveSubscription, deleteCustomer);

export default router;