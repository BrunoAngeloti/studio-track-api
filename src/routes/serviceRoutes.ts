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

const router = Router();

// públicos
router.get('/public/studios/:studio_id/services', getPublicServices);
router.get('/public/studios/:studio_id/services/:id', getPublicServiceById);

// privados
router.post('/services', authMiddleware, createService);
router.get('/services', authMiddleware, getServices);
router.get('/services/archived', authMiddleware, getArchivedServices);
router.patch('/services/:id/archive', authMiddleware, archiveService);
router.patch('/services/:id/unarchive', authMiddleware, unarchiveService);
router.get('/services/:id', authMiddleware, getServiceById);
router.put('/services/:id', authMiddleware, updateService);
router.delete('/services/:id', authMiddleware, deleteService);

export default router;