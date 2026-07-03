import { Router } from 'express';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  getArchivedServices,
  archiveService,
  unarchiveService,
  getPublicServices,
  getPublicServiceById,
} from '../controllers/serviceController';

import { authMiddleware } from '../middlewares/authMiddleware';
import { requireActiveSubscription } from '../middlewares/requireActiveSubscription';

const router = Router();

// públicos
router.get('/public/studios/:studio_id/services', getPublicServices);
router.get('/public/studios/:studio_id/services/:id', getPublicServiceById);

// privados
router.post('/services', authMiddleware, requireActiveSubscription, createService);
router.get('/services', authMiddleware, requireActiveSubscription, getServices);
router.get('/services/archived', authMiddleware, requireActiveSubscription, getArchivedServices);
router.patch('/services/:id/archive', authMiddleware, requireActiveSubscription, archiveService);
router.patch('/services/:id/unarchive', authMiddleware, requireActiveSubscription, unarchiveService);
router.get('/services/:id', authMiddleware, requireActiveSubscription, getServiceById);
router.put('/services/:id', authMiddleware, requireActiveSubscription, updateService);
router.delete('/services/:id', authMiddleware, requireActiveSubscription, deleteService);

export default router;