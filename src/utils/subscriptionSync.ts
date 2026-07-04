import Stripe from 'stripe';
import { Studio } from '../models/Studio';

export async function syncStudioFromSubscription(subscription: Stripe.Subscription) {
  const studioId = subscription.metadata?.studio_id;

  const trial_ends_at = subscription.trial_end
    ? new Date(subscription.trial_end * 1000)
    : null;

  // Nas versões recentes da API, current_period_end vive no item da
  // assinatura, não mais na assinatura em si.
  const periodEndSeconds = subscription.items.data[0]?.current_period_end;
  const current_period_end = periodEndSeconds ? new Date(periodEndSeconds * 1000) : null;

  // Duas formas de agendar cancelamento pro fim do período, dependendo de
  // como foi feito: o booleano clássico `cancel_at_period_end`, ou uma data
  // específica em `cancel_at` (usado pelo Billing Portal em versões recentes
  // da API). Qualquer um dos dois presente significa "não vai renovar".
  const cancel_at_period_end = subscription.cancel_at_period_end || !!subscription.cancel_at;

  const where = studioId
    ? { id: studioId }
    : { stripe_customer_id: subscription.customer as string };

  await Studio.update(
    {
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      trial_ends_at,
      current_period_end,
      cancel_at_period_end,
    },
    { where }
  );
}
