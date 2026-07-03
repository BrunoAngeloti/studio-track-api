import { Router } from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  activateEmployee,
  getPublicEmployees
} from '../controllers/employeesController';

import { authMiddleware } from '../middlewares/authMiddleware';
import { requireActiveSubscription } from '../middlewares/requireActiveSubscription';

const router = Router();

router.get('/public/studios/:studio_id/employees', getPublicEmployees);

router.post('/employees', authMiddleware, requireActiveSubscription, createEmployee);
router.get('/employees', authMiddleware, requireActiveSubscription, getEmployees);
router.get('/employees/:id', authMiddleware, requireActiveSubscription, getEmployeeById);
router.put('/employees/:id', authMiddleware, requireActiveSubscription, updateEmployee);
router.delete('/employees/:id', authMiddleware, requireActiveSubscription, deleteEmployee);
router.patch('/employees/:id/activate', authMiddleware, requireActiveSubscription, activateEmployee);

export default router;