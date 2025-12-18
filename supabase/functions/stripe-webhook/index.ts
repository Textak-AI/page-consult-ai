import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const STRIPE_PRICES = {
  pro_monthly: 'price_1SfXwOFqTTK3LcBFMXRpEVcS',
  agency_monthly: 'price_1SfXziFqTTK3LcBFhv0PykBc',
  actions_10: 'price_1SfXziFqTTK3LcBFAuEAkGCN',
  actions_25: 'price_1SfXziFqTTK3LcBFS8DPaQoe',
  actions_50: 'price_1SfXziFqTTK3LcBFw64XlRyF',
};

const ACTION_PACK_AMOUNTS: Record<string, number> = {
  [STRIPE_PRICES.actions_10]: 10,
  [STRIPE_PRICES.actions_25]: 25,
  [STRIPE_PRICES.actions_50]: 50,
};

serve(async (req) => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  
  if (!stripeKey) {
    console.error('Stripe secret key not configured');
    return new Response('Server configuration error', { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
  
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // For testing without webhook signature verification
      event = JSON.parse(body);
      console.warn('Webhook signature verification skipped');
    }
  } catch (err: unknown) {
    console.error('Webhook signature verification failed:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  console.log('Received webhook event:', event.type);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const priceId = session.metadata?.price_id;

        console.log('Checkout completed:', { userId, priceId, mode: session.mode });

        if (!userId) {
          console.error('No user_id in session metadata');
          break;
        }

        if (session.mode === 'subscription') {
          // Handle subscription purchase
          let planTier: 'pro' | 'agency' = 'pro';
          let actionsLimit = 150;

          if (priceId === STRIPE_PRICES.agency_monthly) {
            planTier = 'agency';
            actionsLimit = 999999; // Unlimited
          }

          const { error } = await supabase
            .from('user_usage')
            .update({
              plan_tier: planTier,
              ai_actions_limit: actionsLimit,
              stripe_subscription_id: session.subscription as string,
              billing_period_start: new Date().toISOString(),
              billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

          if (error) {
            console.error('Failed to update user plan:', error);
          } else {
            console.log(`Updated user ${userId} to ${planTier} plan`);
          }
        } else if (session.mode === 'payment') {
          // Handle action pack purchase
          const actionAmount = ACTION_PACK_AMOUNTS[priceId!];
          
          if (actionAmount) {
            const { data: currentUsage } = await supabase
              .from('user_usage')
              .select('actions_purchased')
              .eq('user_id', userId)
              .single();

            const newTotal = (currentUsage?.actions_purchased || 0) + actionAmount;

            const { error } = await supabase
              .from('user_usage')
              .update({
                actions_purchased: newTotal,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', userId);

            if (error) {
              console.error('Failed to add purchased actions:', error);
            } else {
              console.log(`Added ${actionAmount} actions to user ${userId}, new total: ${newTotal}`);
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID
        const { data: usage } = await supabase
          .from('user_usage')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (usage) {
          const priceId = subscription.items.data[0]?.price.id;
          let planTier: 'starter' | 'pro' | 'agency' = 'starter';
          let actionsLimit = 30;

          if (priceId === STRIPE_PRICES.pro_monthly) {
            planTier = 'pro';
            actionsLimit = 150;
          } else if (priceId === STRIPE_PRICES.agency_monthly) {
            planTier = 'agency';
            actionsLimit = 999999;
          }

          await supabase
            .from('user_usage')
            .update({
              plan_tier: planTier,
              ai_actions_limit: actionsLimit,
              stripe_subscription_id: subscription.id,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', usage.user_id);

          console.log(`Updated subscription for user ${usage.user_id} to ${planTier}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: usage } = await supabase
          .from('user_usage')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (usage) {
          await supabase
            .from('user_usage')
            .update({
              plan_tier: 'starter',
              ai_actions_limit: 30,
              stripe_subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', usage.user_id);

          console.log(`Cancelled subscription for user ${usage.user_id}, reverted to starter`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error: unknown) {
    console.error('Error processing webhook:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(`Webhook processing error: ${message}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
