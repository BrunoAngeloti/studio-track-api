//Studio Routes

import { Router } from 'express';
import { createCategory, getCategories, getCategoryById, getCategoryByStudioId, updateCategory, deleteCategory } from '../controllers/categoriesController.ts';

const router = Router();

router.post('/categories', createCategory);
router.get('/categories', getCategories);
router.get('/categories/studio/:studioId', getCategoryByStudioId);
router.get('/categories/:id', getCategoryById);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

export default router;