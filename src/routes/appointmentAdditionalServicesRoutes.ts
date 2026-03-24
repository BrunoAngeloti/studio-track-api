import { Router } from 'express';
import {
  addAdditionalServiceToAppointment,
  removeAdditionalServiceFromAppointment,
} from '../controllers/appointmentAdditionalServicesController';

import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post(
  '/appointments/:appointment_id/additional-services',
  authMiddleware,
  addAdditionalServiceToAppointment
);

router.delete(
  '/appointments/:appointment_id/additional-services/:additional_service_id',
  authMiddleware,
  removeAdditionalServiceFromAppointment
);

export default router;