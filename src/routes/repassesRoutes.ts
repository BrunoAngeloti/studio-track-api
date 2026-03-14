import { Router } from 'express';
import {
  createRepasse,
  getRepasses,
  getRepasseById,
  updateRepasse,
  deleteRepasse,
} from '../controllers/repassesController.ts';

import { authMiddleware } from '../middlewares/authMiddleware.ts';

const router = Router();

router.post('/repasses', authMiddleware, createRepasse);
router.get('/repasses', authMiddleware, getRepasses);
router.get('/repasses/:id', authMiddleware, getRepasseById);
router.put('/repasses/:id', authMiddleware, updateRepasse);
router.delete('/repasses/:id', authMiddleware, deleteRepasse);

export default router;