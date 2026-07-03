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
import { requireActiveSubscription } from '../middlewares/requireActiveSubscription';

const router = Router();

router.post('/repasse-configs', authMiddleware, requireActiveSubscription, createRepasseConfig);
router.get('/repasse-configs', authMiddleware, requireActiveSubscription, getRepasseConfigs);
router.get('/repasse-configs/:id', authMiddleware, requireActiveSubscription, getRepasseConfigById);
router.put('/repasse-configs/:id', authMiddleware, requireActiveSubscription, updateRepasseConfig);
router.delete('/repasse-configs/:id', authMiddleware, requireActiveSubscription, deleteRepasseConfig);

router.patch('/repasse-configs/:id/default', authMiddleware, requireActiveSubscription, setDefaultRepasseConfig);
router.patch('/repasse-configs/:id/unset-default', authMiddleware, requireActiveSubscription, unsetDefaultRepasseConfig);

export default router;