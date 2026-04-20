import { Router } from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  approveAppointment,
  rejectAppointment,
  getMonthlyAvailability
} from '../controllers/appointmentsController';

import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * 🔓 ROTAS PÚBLICAS (sem auth)
 */
router.post('/appointments', createAppointment);
router.get('/public/availability/month', getMonthlyAvailability);

/**
 * 🔒 ROTAS PRIVADAS (com auth)
 */
router.get('/appointments', authMiddleware, getAppointments);
router.get('/appointments/:id', authMiddleware, getAppointmentById);

router.put('/appointments/:id', authMiddleware, updateAppointment);
router.delete('/appointments/:id', authMiddleware, deleteAppointment);

router.patch('/appointments/:id/approve', authMiddleware, approveAppointment);
router.patch('/appointments/:id/reject', authMiddleware, rejectAppointment);

export default router;