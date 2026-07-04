import Stripe from 'stripe';
import { Studio } from '../models/Studio';

export async function syncStudioFromSubscription(subscription: Stripe.Subscription) {
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
