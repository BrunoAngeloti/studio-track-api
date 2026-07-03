import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { Studio } from '../models/Studio';

const ALLOWED_STATUSES = ['trialing', 'active'];

export const requireActiveSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const studioId = req.studio?.id;

    if (!studioId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const studio = await Studio.findByPk(studioId, {
      attributes: ['id', 'subscription_status', 'lifetime_free_access'],
    });

    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    if (studio.lifetime_free_access) {
      return next();
    }

    if (!studio.subscription_status || !ALLOWED_STATUSES.includes(studio.subscription_status)) {
      return res.status(402).json({ error: 'Subscription is not active' });
    }

    return next();
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return res.status(500).json({ error: 'Failed to check subscription status' });
  }
};
