import { Request, Response } from 'express';
import Stripe from 'stripe';
import { getStripe } from '../utils/stripe';
import { Studio } from '../models/Studio';

async function syncStudioFromSubscription(subscription: Stripe.Subscription) {
  const studioId = subscription.metadata?.studio_id;

  const trial_ends_at = subscription.trial_end
    ? new Date(subscription.trial_end * 1000)
    : null;

  const where = studioId
    ? { id: studioId }
    : { stripe_customer_id: subscription.customer as string };

  await Studio.update(
    {
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      trial_ends_at,
    },
    { where }
  );
}

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const stripe = getStripe();
  const signature = req.headers['stripe-signature'];

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error: any) {
    console.error('Stripe webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (typeof session.subscription === 'string') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await syncStudioFromSubscription(subscription);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncStudioFromSubscription(subscription);
        break;
      }

      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};
