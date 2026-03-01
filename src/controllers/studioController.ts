// Studio Controller mock

import { Studio } from '../models/Studio';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

export const createStudio = (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const userToCreate = {
    name,
    email,
    password: hashedPassword,
  };

  Studio.create(userToCreate)
    .then((studio) => {
      res.status(201).json({ studio });
    })
    .catch((error) => {
      console.error('Error creating studio:', error);

      if (error?.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Email already exists' });
      }

      return res.status(400).json({
        error: error?.message ?? 'Failed to create studio',
        details: error?.errors?.map((e: any) => e.message),
      });
    });
};

export const getStudios = (req: Request, res: Response) => {
  Studio.findAll()
    .then((studios) => {
      res.status(200).json(studios);
    })
    .catch((error) => {
      console.error('Error fetching studios:', error);
      res.status(500).json({ error: 'Failed to fetch studios' });
    });
};

export const getStudioById = (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  Studio.findByPk(id)
    .then((studio) => {
      if (studio) {
        res.status(200).json({ studio });
      } else {
        res.status(404).json({ error: 'Studio not found' });
      }
    })
    .catch((error) => {
      console.error('Error fetching studio:', error);
      res.status(500).json({ error: 'Failed to fetch studio' });
    });
};

export const updateStudio = (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  Studio.findByPk(id)
    .then((studio) => {
      if (studio) {
        const { name, email, password } = req.body;

        const updatedStudio = {
          name,
          email,
          password: password ? bcrypt.hashSync(password, 10) : studio.password,
        };

        return studio.update(updatedStudio);
      } else {
        res.status(404).json({ error: 'Studio not found' });
      }
    })
    .then((studio) => {
      res.status(200).json({ studio });
    })
    .catch((error) => {
      console.error('Error updating studio:', error);
      res.status(500).json({ error: 'Failed to update studio' });
    });
};

export const deleteStudio = (req: Request, res: Response) => {
  const { id } = req.params;

  Studio.destroy({ where: { id } })
    .then((deleted) => {
      if (deleted) {
        res.status(200).json({ message: `Studio with id ${id} deleted successfully` });
      } else {
        res.status(404).json({ error: 'Studio not found' });
      }
    })
    .catch((error) => {
      console.error('Error deleting studio:', error);
      res.status(500).json({ error: 'Failed to delete studio' });
    });
}