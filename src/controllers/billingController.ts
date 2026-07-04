import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Studio } from '../models/Studio';
import { getStripe } from '../utils/stripe';
import { syncStudioFromSubscription } from '../utils/subscriptionSync';

export const createCheckoutSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stripe = getStripe();
    const studioId = req.studio?.id;
    const studio = await Studio.findByPk(studioId);

    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    let customerId = studio.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: studio.email,
        name: studio.name,
        metadata: { studio_id: studio.id },
      });

      customerId = customer.id;
      await studio.update({ stripe_customer_id: customerId });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const successPath = studio.onboarding_completed ? '/dashboard' : '/cadastro/onboarding';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      payment_method_collection: 'if_required',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID as string,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        trial_settings: {
          end_behavior: { missing_payment_method: 'cancel' },
        },
        metadata: { studio_id: studio.id },
      },
      success_url: `${frontendUrl}${successPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/assinatura?checkout=cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

export const confirmCheckoutSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stripe = getStripe();
    const studioId = req.studio?.id;
    const sessionId = req.query.session_id as string;

    if (!sessionId) {
      return res.status(400).json({ error: 'session_id is required' });
    }

    const studio = await Studio.findByPk(studioId);

    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    // Garante que a sessão pertence ao studio autenticado antes de sincronizar.
    if (session.customer !== studio.stripe_customer_id) {
      return res.status(403).json({ error: 'Checkout session does not belong to this studio' });
    }

    if (session.subscription && typeof session.subscription !== 'string') {
      await syncStudioFromSubscription(session.subscription);
    }

    await studio.reload();

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
    console.error('Error confirming checkout session:', error);
    res.status(500).json({ error: 'Failed to confirm checkout session' });
  }
};

export const createPortalSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stripe = getStripe();
    const studioId = req.studio?.id;
    const studio = await Studio.findByPk(studioId);

    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    if (!studio.stripe_customer_id) {
      return res.status(400).json({ error: 'Studio has no Stripe customer' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

    const session = await stripe.billingPortal.sessions.create({
      customer: studio.stripe_customer_id,
      return_url: `${frontendUrl}/dashboard/account`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
};
