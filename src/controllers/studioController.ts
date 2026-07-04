import { Studio } from '../models/Studio';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateUniqueStudioUsername } from '../utils/generateStudioUsername';
import { seedDefaultCategories } from '../utils/seedDefaultCategories';
import { isPasswordValid, PASSWORD_REQUIREMENTS_MESSAGE } from '../utils/validatePassword';

function generateStudioToken(studio: Studio) {
  return jwt.sign(
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
}

export const createStudio = async (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
    phone,
    primary_color,
    secondary_color,
    instagram,
    catalog_link,
  } = req.body;

  if (!isPasswordValid(password)) {
    return res.status(400).json({ error: PASSWORD_REQUIREMENTS_MESSAGE });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const username = await generateUniqueStudioUsername(name);

    const userToCreate = {
      name,
      username,
      email,
      password: hashedPassword,
      phone,
      primary_color,
      secondary_color,
      instagram,
      catalog_link,
    };

    const studio = await Studio.create(userToCreate);

    try {
      await seedDefaultCategories(studio.id);
    } catch (seedError) {
      console.error('Error seeding default categories:', seedError);
    }

    const token = generateStudioToken(studio);

    res.status(201).json({
      token,
      studio: {
        id: studio.id,
        name: studio.name,
        email: studio.email,
        phone: studio.phone,
        primary_color: studio.primary_color,
        secondary_color: studio.secondary_color,
        instagram: studio.instagram,
        catalog_link: studio.catalog_link,
        type: studio.type,
        booking_horizon_months: studio.booking_horizon_months,
        subscription_status: studio.subscription_status,
        onboarding_completed: studio.onboarding_completed,
        lifetime_free_access: studio.lifetime_free_access,
      },
    });
  } catch (error: any) {
    console.error('Error creating studio:', error);

    if (error?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    return res.status(400).json({
      error: error?.message ?? 'Failed to create studio',
      details: error?.errors?.map((e: any) => e.message),
    });
  }
};

export const getStudios = (req: AuthenticatedRequest, res: Response) => {
  const studioId = req.studio?.id;

  Studio.findByPk(studioId)
    .then((studio) => {
      if (!studio) {
        return res.status(404).json({ error: 'Studio not found' });
      }

      res.status(200).json({
        studio: {
          id: studio.id,
          name: studio.name,
          email: studio.email,
          phone: studio.phone,
          primary_color: studio.primary_color,
          secondary_color: studio.secondary_color,
          instagram: studio.instagram,
          catalog_link: studio.catalog_link,
          type: studio.type,
          booking_horizon_months: studio.booking_horizon_months,
          subscription_status: studio.subscription_status,
          onboarding_completed: studio.onboarding_completed,
          lifetime_free_access: studio.lifetime_free_access,
        },
      });
    })
    .catch((error) => {
      console.error('Error fetching studio:', error);
      res.status(500).json({ error: 'Failed to fetch studio' });
    });
};

export const getPublicStudioByUsername = (req: Request, res: Response) => {
  const username = req.params.username;

  Studio.findOne({
    where: { username },
  })
    .then((studio) => {
      if (!studio) {
        return res.status(404).json({ error: 'Studio not found' });
      }

      res.status(200).json({
        studio: {
          id: studio.id,
          username: studio.username,
          instagram: studio.instagram,
          catalog_link: studio.catalog_link,
          name: studio.name,
          phone: studio.phone,
          primary_color: studio.primary_color,
          secondary_color: studio.secondary_color,
          type: studio.type,
          booking_horizon_months: studio.booking_horizon_months,
          subscription_status: studio.subscription_status,
          onboarding_completed: studio.onboarding_completed,
          lifetime_free_access: studio.lifetime_free_access,
        },
      });
    })
    .catch((error) => {
      console.error('Error fetching public studio:', error);
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

      const {
        name,
        email,
        password,
        phone,
        primary_color,
        secondary_color,
        instagram,
        catalog_link,
      } = req.body;

      if (password && !isPasswordValid(password)) {
        res.status(400).json({ error: PASSWORD_REQUIREMENTS_MESSAGE });
        return;
      }

      const updatedStudio = {
        name,
        email,
        phone,
        instagram,
        catalog_link,
        primary_color,
        secondary_color,
        password: password ? bcrypt.hashSync(password, 10) : studio.password,
      };

      return studio.update(updatedStudio);
    })
    .then((studio) => {
      if (studio) {
        res.status(200).json({
          studio: {
            id: studio.id,
            name: studio.name,
            email: studio.email,
            phone: studio.phone,
            primary_color: studio.primary_color,
            secondary_color: studio.secondary_color,
            instagram: studio.instagram,
            catalog_link: studio.catalog_link,
            type: studio.type,
            booking_horizon_months: studio.booking_horizon_months,
            subscription_status: studio.subscription_status,
            onboarding_completed: studio.onboarding_completed,
            lifetime_free_access: studio.lifetime_free_access,
          },
        });
      }
    })
    .catch((error) => {
      console.error('Error updating studio:', error);
      res.status(500).json({ error: 'Failed to update studio' });
    });
};

export const updateStudioType = async (req: AuthenticatedRequest, res: Response) => {
  const studioId = req.studio?.id;
  const { type } = req.body;

  if (type !== 'INDIVIDUAL' && type !== 'TEAM') {
    return res.status(400).json({ error: "type must be 'INDIVIDUAL' or 'TEAM'" });
  }

  try {
    const studio = await Studio.findByPk(studioId);

    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    await studio.update({ type });

    res.status(200).json({
      studio: {
        id: studio.id,
        name: studio.name,
        email: studio.email,
        phone: studio.phone,
        primary_color: studio.primary_color,
        secondary_color: studio.secondary_color,
        instagram: studio.instagram,
        catalog_link: studio.catalog_link,
        type: studio.type,
        booking_horizon_months: studio.booking_horizon_months,
        subscription_status: studio.subscription_status,
        onboarding_completed: studio.onboarding_completed,
        lifetime_free_access: studio.lifetime_free_access,
      },
    });
  } catch (error) {
    console.error('Error updating studio type:', error);
    res.status(500).json({ error: 'Failed to update studio type' });
  }
};

const ALLOWED_BOOKING_HORIZON_MONTHS = [0, 1, 3, 6, 12];

export const updateBookingHorizon = async (req: AuthenticatedRequest, res: Response) => {
  const studioId = req.studio?.id;
  const { booking_horizon_months } = req.body;

  if (!ALLOWED_BOOKING_HORIZON_MONTHS.includes(booking_horizon_months)) {
    return res.status(400).json({
      error: `booking_horizon_months must be one of: ${ALLOWED_BOOKING_HORIZON_MONTHS.join(', ')}`,
    });
  }

  try {
    const studio = await Studio.findByPk(studioId);

    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    await studio.update({ booking_horizon_months });

    res.status(200).json({
      studio: {
        id: studio.id,
        name: studio.name,
        email: studio.email,
        phone: studio.phone,
        primary_color: studio.primary_color,
        secondary_color: studio.secondary_color,
        instagram: studio.instagram,
        catalog_link: studio.catalog_link,
        type: studio.type,
        booking_horizon_months: studio.booking_horizon_months,
        subscription_status: studio.subscription_status,
        onboarding_completed: studio.onboarding_completed,
        lifetime_free_access: studio.lifetime_free_access,
      },
    });
  } catch (error) {
    console.error('Error updating booking horizon:', error);
    res.status(500).json({ error: 'Failed to update booking horizon' });
  }
};

export const updateOnboardingCompleted = async (req: AuthenticatedRequest, res: Response) => {
  const studioId = req.studio?.id;

  try {
    const studio = await Studio.findByPk(studioId);

    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    await studio.update({ onboarding_completed: true });

    res.status(200).json({
      studio: {
        id: studio.id,
        name: studio.name,
        email: studio.email,
        phone: studio.phone,
        primary_color: studio.primary_color,
        secondary_color: studio.secondary_color,
        instagram: studio.instagram,
        catalog_link: studio.catalog_link,
        type: studio.type,
        booking_horizon_months: studio.booking_horizon_months,
        subscription_status: studio.subscription_status,
        onboarding_completed: studio.onboarding_completed,
        lifetime_free_access: studio.lifetime_free_access,
      },
    });
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    res.status(500).json({ error: 'Failed to update onboarding status' });
  }
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

export const loginStudio = (req: Request, res: Response) => {
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

      const token = generateStudioToken(studio);

      return res.status(200).json({
        message: 'Login successful',
        token,
        studio: {
          id: studio.id,
          name: studio.name,
          email: studio.email,
          phone: studio.phone,
          primary_color: studio.primary_color,
          secondary_color: studio.secondary_color,
          type: studio.type,
          booking_horizon_months: studio.booking_horizon_months,
          subscription_status: studio.subscription_status,
          onboarding_completed: studio.onboarding_completed,
          lifetime_free_access: studio.lifetime_free_access,
        },
      });
    })
    .catch((error) => {
      console.error('Error during login:', error);
      return res.status(500).json({ error: 'Failed to login' });
    });
};