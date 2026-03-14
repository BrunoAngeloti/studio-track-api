import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controllers/categoriesController.ts';

import { authMiddleware } from '../middlewares/authMiddleware.ts';

const router = Router();

router.post('/categories', authMiddleware, createCategory);
router.get('/categories', authMiddleware, getCategories);
router.get('/categories/:id', authMiddleware, getCategoryById);
router.put('/categories/:id', authMiddleware, updateCategory);
router.delete('/categories/:id', authMiddleware, deleteCategory);

export default router;