import { Router } from 'express';
import {
  addAdditionalServiceToAppointment,
  removeAdditionalServiceFromAppointment,
} from '../controllers/appointmentAdditionalServicesController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireActiveSubscription } from '../middlewares/requireActiveSubscription';

const router = Router();

router.post(
  '/appointments/:appointment_id/additional-services',
  addAdditionalServiceToAppointment
);

router.delete(
  '/appointments/:appointment_id/additional-services/:additional_service_id',
  authMiddleware, requireActiveSubscription,
  removeAdditionalServiceFromAppointment
);

export default router;