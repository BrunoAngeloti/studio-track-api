import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Studio } from '../models/Studio';
import { getStripe } from '../utils/stripe';

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
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID as string,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: { studio_id: studio.id },
      },
      success_url: `${frontendUrl}${successPath}?checkout=success`,
      cancel_url: `${frontendUrl}/assinatura?checkout=cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};
