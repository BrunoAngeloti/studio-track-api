import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controllers/categoriesController';

import { authMiddleware } from '../middlewares/authMiddleware';
import { requireActiveSubscription } from '../middlewares/requireActiveSubscription';

const router = Router();

router.post('/categories', authMiddleware, requireActiveSubscription, createCategory);
router.get('/categories', authMiddleware, requireActiveSubscription, getCategories);
router.get('/categories/:id', authMiddleware, requireActiveSubscription, getCategoryById);
router.put('/categories/:id', authMiddleware, requireActiveSubscription, updateCategory);
router.delete('/categories/:id', authMiddleware, requireActiveSubscription, deleteCategory);

export default router;