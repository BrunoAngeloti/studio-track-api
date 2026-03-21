import { Router } from 'express';
import {
  createRepasseConfig,
  getRepasseConfigs,
  getRepasseConfigById,
  updateRepasseConfig,
  deleteRepasseConfig,
  setDefaultRepasseConfig,
  unsetDefaultRepasseConfig
} from '../controllers/repasseConfigsController';

import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/repasse-configs', authMiddleware, createRepasseConfig);
router.get('/repasse-configs', authMiddleware, getRepasseConfigs);
router.get('/repasse-configs/:id', authMiddleware, getRepasseConfigById);
router.put('/repasse-configs/:id', authMiddleware, updateRepasseConfig);
router.delete('/repasse-configs/:id', authMiddleware, deleteRepasseConfig);

router.patch('/repasse-configs/:id/default', authMiddleware, setDefaultRepasseConfig);
router.patch('/repasse-configs/:id/unset-default', authMiddleware, unsetDefaultRepasseConfig);

export default router;