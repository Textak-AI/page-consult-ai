import { supabase } from '@/integrations/supabase/client';

// Stripe Price IDs - These match the environment variables in edge functions
export const STRIPE_PRICES = {
  STARTER: 'price_1SfXwOFqTTK3LcBFMXRpEVcS',
  FOUNDING: 'price_1SjuT7FqTTK3LcBFU2DXqMXN',
  AGENCY: 'price_1SjuTnFqTTK3LcBFXdNBr2Oh',
} as const;

export const createCheckoutSession = async (priceId: string, successUrl?: string, cancelUrl?: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Please sign in to subscribe');
  }

  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { 
      priceId,
      successUrl: successUrl || `${window.location.origin}/dashboard?checkout=success`,
      cancelUrl: cancelUrl || `${window.location.origin}/pricing?checkout=canceled`,
    },
  });

  if (error) {
    console.error('Checkout error:', error);
    throw error;
  }
  
  if (data?.url) {
    window.location.href = data.url;
  } else {
    throw new Error('No checkout URL returned');
  }
};
