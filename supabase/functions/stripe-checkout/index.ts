import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

import { ACTION_PACKS, validSubscriptionPriceIds, checkoutSessionParams } from '../_shared/planLimits.ts';
import { createClient as createServiceClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  console.log('🛒 Stripe checkout request received');
  
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('❌ STRIPE_SECRET_KEY not configured');
      throw new Error('Stripe secret key not configured');
    }
    console.log('✅ Stripe key found');

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    console.log('🔐 Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('👤 User lookup:', user ? user.id : 'none', userError ? userError.message : 'no error');
    
    if (userError || !user) {
      console.error('❌ Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { priceId, mode, successUrl, cancelUrl } = await req.json();
    
    console.log('📋 Checkout request:', { priceId, mode, userId: user.id });

    // Validate price ID
    const validPriceIds = [...Object.keys(ACTION_PACKS), ...validSubscriptionPriceIds()];
    if (!validPriceIds.includes(priceId)) {
      return new Response(JSON.stringify({ error: 'Invalid price ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get or create Stripe customer
    const { data: usage, error: usageError } = await supabase
      .from('user_usage')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    console.log('📊 User usage lookup:', { usage, error: usageError?.message });

    let customerId = usage?.stripe_customer_id;

    if (!customerId) {
      console.log('🆕 Creating new Stripe customer...');
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      // Billing columns are server-only (guard trigger) — write with the service role.
      const admin = createServiceClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      const { error: updateError } = await admin
        .from('user_usage')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
      
      if (updateError) {
        console.error('⚠️ Failed to save customer ID:', updateError);
      }
      
      console.log('✅ Created new Stripe customer:', customerId);
    }

    console.log('🔧 Creating checkout session...');
    const session = await stripe.checkout.sessions.create(checkoutSessionParams({
      priceId,
      customerId,
      userId: user.id,
      successUrl: successUrl || `${req.headers.get('origin')}/generate?checkout=success`,
      cancelUrl: cancelUrl || `${req.headers.get('origin')}/generate?checkout=cancelled`,
    }));

    console.log('✅ Created checkout session:', session.id, 'URL:', session.url);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const origin = req.headers.get('Origin');
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
    });
  }
});
