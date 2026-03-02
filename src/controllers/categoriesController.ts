import { Category } from '../models/Category';
import { Request, Response } from 'express';

export const createCategory = (req: Request, res: Response) => {
  const { name, color, studio_id } = req.body;

  Category.create({ name, color, studio_id })
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

export const getCategories = (req: Request, res: Response) => {
  Category.findAll()
      .then((categories) => {
        res.status(200).json(categories);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
      });
  
};

export const getCategoryById = (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  Category.findByPk(id)
    .then((category) => {
      if (category) {
        res.status(200).json({ category });
      } else {
        res.status(404).json({ error: 'Category not found' });
      }
    })
    .catch((error) => {
      console.error('Error fetching category:', error);
      res.status(500).json({ error: 'Failed to fetch category' });
    });
}

export const getCategoryByStudioId = (req: Request, res: Response) => {
  const rawStudioId = req.params.studioId;
  const studioId = Array.isArray(rawStudioId) ? rawStudioId[0] : rawStudioId;

  Category.findAll({ where: { studio_id: studioId } })
    .then((categories) => {
      res.status(200).json(categories);
    })
    .catch((error) => {
      console.error('Error fetching categories by studio ID:', error);
      res.status(500).json({ error: 'Failed to fetch categories by studio ID' });
    });
};

export const updateCategory = (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { name, color } = req.body;

  Category.findByPk(id)
    .then((category) => {
      if (category) {
        category.update({ name, color })
          .then((updatedCategory) => {
            res.status(200).json({ category: updatedCategory });
          })
          .catch((error) => {
            console.error('Error updating category:', error);
            res.status(400).json({
              error: error?.message ?? 'Failed to update category',
              details: error?.errors?.map((e: any) => e.message),
            });
          });
      } else {
        res.status(404).json({ error: 'Category not found' });
      }
    })
    .catch((error) => {
      console.error('Error fetching category for update:', error);
      res.status(500).json({ error: 'Failed to fetch category for update' });
    });
  
};

export const deleteCategory = (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  Category.findByPk(id)
    .then((category) => {
      if (category) {
        category.destroy()
          .then(() => {
            res.status(200).json({ message: 'Category deleted successfully' });
          })
          .catch((error) => {
            console.error('Error deleting category:', error);
            res.status(500).json({ error: 'Failed to delete category' });
          });
      } else {
        res.status(404).json({ error: 'Category not found' });
      }
    })
    .catch((error) => {
      console.error('Error fetching category for deletion:', error);
      res.status(500).json({ error: 'Failed to fetch category for deletion' });
    });
}