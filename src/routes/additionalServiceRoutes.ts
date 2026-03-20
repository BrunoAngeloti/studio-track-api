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
} from '../controllers/additionalServiceController';

import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/additional-services', authMiddleware, createAdditionalService);
router.get('/additional-services', authMiddleware, getAdditionalServices);
router.get('/additional-services/archived', authMiddleware, getArchivedAdditionalServices);
router.patch('/additional-services/:id/archive', authMiddleware, archiveAdditionalService);
router.patch('/additional-services/:id/unarchive', authMiddleware, unarchiveAdditionalService);

router.get('/additional-services/:id', authMiddleware, getAdditionalServiceById);
router.put('/additional-services/:id', authMiddleware, updateAdditionalService);
router.delete('/additional-services/:id', authMiddleware, deleteAdditionalService);

export default router;