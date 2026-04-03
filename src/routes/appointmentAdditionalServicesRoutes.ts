import { Router } from 'express';
import {
  addAdditionalServiceToAppointment,
  removeAdditionalServiceFromAppointment,
} from '../controllers/appointmentAdditionalServicesController';

const router = Router();

router.post(
  '/appointments/:appointment_id/additional-services',
  addAdditionalServiceToAppointment
);

router.delete(
  '/appointments/:appointment_id/additional-services/:additional_service_id',
  removeAdditionalServiceFromAppointment
);

export default router;