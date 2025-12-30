import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

  // SECURITY: Always require signature verification
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return new Response('Webhook secret required', { status: 500 });
  }
  
  if (!signature) {
    console.error('Missing stripe-signature header');
    return new Response('Missing signature', { status: 400 });
  }

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    console.error('Webhook signature verification failed:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  console.log('Received webhook event:', event.type);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Map price IDs to plan names using environment variables
  const priceToplan: Record<string, string> = {
    [Deno.env.get('STRIPE_PRICE_STARTER') || '']: 'starter',
    [Deno.env.get('STRIPE_PRICE_FOUNDING') || '']: 'founding',
    [Deno.env.get('STRIPE_PRICE_PRO') || '']: 'pro',
    [Deno.env.get('STRIPE_PRICE_AGENCY') || '']: 'agency',
  };

  // Legacy price IDs for backwards compatibility
  const legacyPrices: Record<string, string> = {
    'price_1SfXwOFqTTK3LcBFMXRpEVcS': 'starter',
    'price_1SfXziFqTTK3LcBFhv0PykBc': 'pro',
  };

  const getPlanFromPriceId = (priceId: string): string => {
    return priceToplan[priceId] || legacyPrices[priceId] || 'pro';
  };

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          const userId = subscription.metadata.supabase_user_id;
          const priceId = subscription.items.data[0].price.id;
          const plan = getPlanFromPriceId(priceId);

          if (!userId) {
            console.error('No user_id in subscription metadata');
            break;
          }

          // Upsert into subscriptions table
          const { error: subError } = await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            status: subscription.status,
            plan,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

          if (subError) {
            console.error('Failed to upsert subscription:', subError);
          }

          // Also update user_usage table for backwards compatibility
          const actionsLimit = plan === 'agency' ? 999999 : plan === 'founding' ? 999999 : plan === 'pro' ? 150 : 30;
          const planTier = plan === 'agency' ? 'agency' : plan === 'founding' || plan === 'pro' ? 'pro' : 'starter';

          await supabase
            .from('user_usage')
            .update({
              plan_tier: planTier,
              ai_actions_limit: actionsLimit,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

          console.log(`✅ Subscription created for user ${userId}: ${plan}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0].price.id;
        const plan = getPlanFromPriceId(priceId);

        // Update subscriptions table
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();

        if (existingSub) {
          await supabase.from('subscriptions')
            .update({
              status: subscription.status,
              stripe_price_id: priceId,
              plan,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);

          // Update user_usage for backwards compatibility
          const actionsLimit = plan === 'agency' ? 999999 : plan === 'founding' ? 999999 : plan === 'pro' ? 150 : 30;
          const planTier = plan === 'agency' ? 'agency' : plan === 'founding' || plan === 'pro' ? 'pro' : 'starter';

          await supabase
            .from('user_usage')
            .update({
              plan_tier: subscription.status === 'active' ? planTier : 'starter',
              ai_actions_limit: subscription.status === 'active' ? actionsLimit : 30,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', existingSub.user_id);

          console.log(`✅ Subscription updated: ${subscription.id} to ${plan}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();

        // Update subscription status
        await supabase.from('subscriptions')
          .update({ 
            status: 'canceled', 
            updated_at: new Date().toISOString() 
          })
          .eq('stripe_subscription_id', subscription.id);

        // Revert user to free tier
        if (existingSub) {
          await supabase
            .from('user_usage')
            .update({
              plan_tier: 'starter',
              ai_actions_limit: 30,
              stripe_subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', existingSub.user_id);
        }

        console.log(`✅ Subscription canceled: ${subscription.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          await supabase.from('subscriptions')
            .update({ 
              status: 'past_due', 
              updated_at: new Date().toISOString() 
            })
            .eq('stripe_subscription_id', invoice.subscription as string);
        }

        console.log(`⚠️ Payment failed for invoice: ${invoice.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Webhook processing error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
    });
  }
});
