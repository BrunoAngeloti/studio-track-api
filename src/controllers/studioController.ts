import { Studio } from '../models/Studio';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const createStudio = (req: AuthenticatedRequest, res: Response) => {
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

export const getStudios = (req: AuthenticatedRequest, res: Response) => {

  const studioId = req.studio?.id;

  Studio.findByPk(studioId)
    .then((studio) => {

      if (!studio) {
        return res.status(404).json({ error: 'Studio not found' });
      }

      res.status(200).json({ studio });

    })
    .catch((error) => {
      console.error('Error fetching studio:', error);
      res.status(500).json({ error: 'Failed to fetch studio' });
    });
};

export const getStudioById = (req: AuthenticatedRequest, res: Response) => {

  const studioId = req.studio?.id;

  Studio.findByPk(studioId)
    .then((studio) => {

      if (!studio) {
        return res.status(404).json({ error: 'Studio not found' });
      }

      res.status(200).json({ studio });

    })
    .catch((error) => {
      console.error('Error fetching studio:', error);
      res.status(500).json({ error: 'Failed to fetch studio' });
    });
};

export const updateStudio = (req: AuthenticatedRequest, res: Response) => {

  const studioId = req.studio?.id;

  Studio.findByPk(studioId)
    .then((studio) => {

      if (!studio) {
        res.status(404).json({ error: 'Studio not found' });
        return;
      }

      const { name, email, password } = req.body;

      const updatedStudio = {
        name,
        email,
        password: password ? bcrypt.hashSync(password, 10) : studio.password,
      };

      return studio.update(updatedStudio);
    })
    .then((studio) => {

      if (studio) {
        res.status(200).json({ studio });
      }

    })
    .catch((error) => {
      console.error('Error updating studio:', error);
      res.status(500).json({ error: 'Failed to update studio' });
    });
};

export const deleteStudio = (req: AuthenticatedRequest, res: Response) => {

  const studioId = req.studio?.id;

  Studio.destroy({
    where: {
      id: studioId,
    },
  })
    .then((deleted) => {

      if (deleted) {
        res.status(200).json({
          message: `Studio deleted successfully`,
        });
      } else {
        res.status(404).json({ error: 'Studio not found' });
      }

    })
    .catch((error) => {
      console.error('Error deleting studio:', error);
      res.status(500).json({ error: 'Failed to delete studio' });
    });
};

export const loginStudio = (req: AuthenticatedRequest, res: Response) => {

  const { email, password } = req.body;

  Studio.findOne({ where: { email } })
    .then((studio) => {

      if (!studio) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isPasswordValid = bcrypt.compareSync(password, studio.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        {
          id: studio.id,
          email: studio.email,
          name: studio.name,
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: '7d',
        }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
        studio: {
          id: studio.id,
          name: studio.name,
          email: studio.email,
        },
      });
    })
    .catch((error) => {
      console.error('Error during login:', error);
      return res.status(500).json({ error: 'Failed to login' });
    });
};