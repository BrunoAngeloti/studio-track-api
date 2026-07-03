import { Router } from 'express';
import {
  createAdditionalService,
  getAdditionalServices,
  getAdditionalServiceById,
  updateAdditionalService,
  deleteAdditionalService,
  getArchivedAdditionalServices,
  archiveAdditionalService,
  unarchiveAdditionalService,
  getPublicAdditionalServices,
  getPublicAdditionalServiceById,
} from '../controllers/additionalServiceController';

import { authMiddleware } from '../middlewares/authMiddleware';
import { requireActiveSubscription } from '../middlewares/requireActiveSubscription';

const router = Router();

// públicas
router.get(
  '/public/studios/:studio_id/additional-services',
  getPublicAdditionalServices
);
router.get(
  '/public/studios/:studio_id/additional-services/:id',
  getPublicAdditionalServiceById
);

// privadas
router.post('/additional-services', authMiddleware, requireActiveSubscription, createAdditionalService);
router.get('/additional-services', authMiddleware, requireActiveSubscription, getAdditionalServices);
router.get(
  '/additional-services/archived',
  authMiddleware, requireActiveSubscription,
  getArchivedAdditionalServices
);
router.patch(
  '/additional-services/:id/archive',
  authMiddleware, requireActiveSubscription,
  archiveAdditionalService
);
router.patch(
  '/additional-services/:id/unarchive',
  authMiddleware, requireActiveSubscription,
  unarchiveAdditionalService
);

router.get('/additional-services/:id', authMiddleware, requireActiveSubscription, getAdditionalServiceById);
router.put('/additional-services/:id', authMiddleware, requireActiveSubscription, updateAdditionalService);
router.delete(
  '/additional-services/:id',
  authMiddleware, requireActiveSubscription,
  deleteAdditionalService
);

export default router;