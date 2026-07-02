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

const router = Router();

router.get('/public/studios/:studio_id/employees', getPublicEmployees);

router.post('/employees', authMiddleware, createEmployee);
router.get('/employees', authMiddleware, getEmployees);
router.get('/employees/:id', authMiddleware, getEmployeeById);
router.put('/employees/:id', authMiddleware, updateEmployee);
router.delete('/employees/:id', authMiddleware, deleteEmployee);
router.patch('/employees/:id/activate', authMiddleware, activateEmployee);

export default router;