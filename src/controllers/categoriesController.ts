import { Category } from '../models/Category';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const createCategory = (req: AuthenticatedRequest, res: Response) => {

  const studio_id = req.studio?.id;
  const { name, color } = req.body;

  if (studio_id === undefined) {

    res.status(400).json({ error: 'Studio ID is required' });
    return;

  }

  Category.create({
    name,
    color,
    studio_id
  })
    .then((category) => {
      res.status(201).json({ category });
    })
    .catch((error) => {

      console.error('Error creating category:', error);

      res.status(400).json({
        error: error?.message ?? 'Failed to create category',
        details: error?.errors?.map((e: any) => e.message),
      });

    });
};

export const getCategories = (req: AuthenticatedRequest, res: Response) => {

  const studio_id = req.studio?.id;

  Category.findAll({
    where: { studio_id },
    order: [['name', 'ASC']]
  })
    .then((categories) => {
      res.status(200).json(categories);
    })
    .catch((error) => {

      console.error('Error fetching categories:', error);

      res.status(500).json({
        error: 'Failed to fetch categories'
      });

    });
};

export const getCategoryById = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  Category.findOne({
    where: {
      id,
      studio_id
    }
  })
    .then((category) => {

      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      res.status(200).json({ category });

    })
    .catch((error) => {

      console.error('Error fetching category:', error);

      res.status(500).json({
        error: 'Failed to fetch category'
      });

    });
};

export const updateCategory = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  const { name, color } = req.body;

  Category.findOne({
    where: {
      id,
      studio_id
    }
  })
    .then((category) => {

      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      return category.update({
        name,
        color
      });

    })
    .then((updatedCategory) => {

      if (!updatedCategory) return;

      res.status(200).json({
        category: updatedCategory
      });

    })
    .catch((error) => {

      console.error('Error updating category:', error);

      res.status(400).json({
        error: error?.message ?? 'Failed to update category',
        details: error?.errors?.map((e: any) => e.message),
      });

    });
};

export const deleteCategory = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  Category.findOne({
    where: {
      id,
      studio_id
    }
  })
    .then((category) => {

      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      return category.destroy();

    })
    .then((deleted) => {

      if (!deleted) return;

      res.status(200).json({
        message: 'Category deleted successfully'
      });

    })
    .catch((error) => {

      console.error('Error deleting category:', error);

      res.status(500).json({
        error: 'Failed to delete category'
      });

    });
};