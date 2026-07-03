import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

// Criado sob demanda (não no carregamento do módulo): como este arquivo é
// importado transitivamente antes do dotenv.config() rodar em server.ts,
// ler STRIPE_SECRET_KEY aqui em cima sempre pegava undefined.
export function getStripe(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('⚠️ STRIPE_SECRET_KEY não configurada. Chamadas ao Stripe vão falhar.');
    }

    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
  }

  return stripeClient;
}
