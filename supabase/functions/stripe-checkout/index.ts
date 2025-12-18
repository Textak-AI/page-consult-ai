import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STRIPE_PRICES = {
  pro_monthly: 'price_1SfXwOFqTTK3LcBFMXRpEVcS',
  agency_monthly: 'price_1SfXziFqTTK3LcBFhv0PykBc',
  actions_10: 'price_1SfXziFqTTK3LcBFAuEAkGCN',
  actions_25: 'price_1SfXziFqTTK3LcBFS8DPaQoe',
  actions_50: 'price_1SfXziFqTTK3LcBFw64XlRyF',
};

serve(async (req) => {
  console.log('🛒 Stripe checkout request received');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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
    const validPriceIds = Object.values(STRIPE_PRICES);
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

      const { error: updateError } = await supabase
        .from('user_usage')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
      
      if (updateError) {
        console.error('⚠️ Failed to save customer ID:', updateError);
      }
      
      console.log('✅ Created new Stripe customer:', customerId);
    }

    // Determine checkout mode
    const checkoutMode = mode === 'subscription' ? 'subscription' : 'payment';

    console.log('🔧 Creating checkout session...');
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: checkoutMode,
      success_url: successUrl || `${req.headers.get('origin')}/generate?checkout=success`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/generate?checkout=cancelled`,
      metadata: {
        user_id: user.id,
        price_id: priceId,
      },
    });

    console.log('✅ Created checkout session:', session.id, 'URL:', session.url);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
