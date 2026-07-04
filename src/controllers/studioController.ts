import { Studio } from '../models/Studio';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateUniqueStudioUsername } from '../utils/generateStudioUsername';
import { seedDefaultCategories } from '../utils/seedDefaultCategories';
import { isPasswordValid, PASSWORD_REQUIREMENTS_MESSAGE } from '../utils/validatePassword';
import { getStripe } from '../utils/stripe';
import { syncStudioFromSubscription } from '../utils/subscriptionSync';

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

// Fonte única do DTO de studio devolvido pela API: evita repetir (e esquecer
// campos em) o mesmo objeto literal em cada endpoint.
export function serializeStudio(studio: Studio) {
  return {
    id: studio.id,
    username: studio.username,
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
    has_used_trial: !!studio.trial_ends_at,
    current_period_end: studio.current_period_end,
    cancel_at_period_end: studio.cancel_at_period_end,
    onboarding_completed: studio.onboarding_completed,
    lifetime_free_access: studio.lifetime_free_access,
  };
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
      studio: serializeStudio(studio),
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

export const getStudios = async (req: AuthenticatedRequest, res: Response) => {
  const studioId = req.studio?.id;

  try {
    let studio = await Studio.findByPk(studioId);

    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    const isPresumedActive =
      studio.subscription_status === 'active' || studio.subscription_status === 'trialing';

    // Rede de segurança: se o webhook do Stripe falhar ou atrasar, o studio
    // ficaria com status "active"/"trialing" pra sempre mesmo depois da
    // assinatura ter sido cancelada de verdade no fim do período (ou com
    // current_period_end/cancel_at_period_end desatualizados). Como este
    // endpoint é chamado a cada carregamento da dashboard, aproveita pra
    // sempre reconfirmar direto com o Stripe enquanto o status local parecer
    // ativo, não só quando o status bate errado.
    if (isPresumedActive && studio.stripe_subscription_id) {
      try {
        const stripe = getStripe();
        const subscription = await stripe.subscriptions.retrieve(studio.stripe_subscription_id);

        await syncStudioFromSubscription(subscription);
        studio = await Studio.findByPk(studioId);
      } catch (stripeError) {
        console.error('Error re-validating subscription with Stripe:', stripeError);
      }
    }

    res.status(200).json({ studio: serializeStudio(studio!) });
  } catch (error) {
    console.error('Error fetching studio:', error);
    res.status(500).json({ error: 'Failed to fetch studio' });
  }
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
        studio: serializeStudio(studio),
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
          studio: serializeStudio(studio),
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
      studio: serializeStudio(studio),
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
      studio: serializeStudio(studio),
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
      studio: serializeStudio(studio),
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
        studio: serializeStudio(studio),
      });
    })
    .catch((error) => {
      console.error('Error during login:', error);
      return res.status(500).json({ error: 'Failed to login' });
    });
};