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
import { requireActiveSubscription } from '../middlewares/requireActiveSubscription';

const router = Router();

/**
 * 🔓 ROTAS PÚBLICAS (sem auth)
 */
router.post('/appointments', createAppointment);
router.get('/public/availability/month', getMonthlyAvailability);

/**
 * 🔒 ROTAS PRIVADAS (com auth)
 */
router.get('/appointments', authMiddleware, requireActiveSubscription, getAppointments);
router.get('/appointments/:id', authMiddleware, requireActiveSubscription, getAppointmentById);

router.put('/appointments/:id', authMiddleware, requireActiveSubscription, updateAppointment);
router.delete('/appointments/:id', authMiddleware, requireActiveSubscription, deleteAppointment);

router.patch('/appointments/:id/approve', authMiddleware, requireActiveSubscription, approveAppointment);
router.patch('/appointments/:id/reject', authMiddleware, requireActiveSubscription, rejectAppointment);

export default router;