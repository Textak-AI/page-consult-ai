import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      throw new Error("Unauthorized");
    }

    const { priceId, successUrl, cancelUrl } = await req.json();
    console.log("Creating checkout session for user:", user.id, "price:", priceId);

    // Validate price ID against environment variables
    const validPrices = [
      Deno.env.get("STRIPE_PRICE_STARTER"),
      Deno.env.get("STRIPE_PRICE_FOUNDING"),
      Deno.env.get("STRIPE_PRICE_PRO"),
      Deno.env.get("STRIPE_PRICE_AGENCY"),
    ].filter(Boolean);

    if (!validPrices.includes(priceId)) {
      throw new Error("Invalid price ID");
    }

    // Check for existing subscription record with Stripe customer
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = existingSub?.stripe_customer_id;

    // Also check user_usage table (legacy)
    if (!customerId) {
      const { data: usage } = await supabase
        .from("user_usage")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();
      customerId = usage?.stripe_customer_id;
    }

    // Create new Stripe customer if none exists
    if (!customerId) {
      console.log("Creating new Stripe customer for:", user.email);
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    const requestOrigin = origin || "https://pageconsult.ai";

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl || `${requestOrigin}/dashboard?checkout=success`,
      cancel_url: cancelUrl || `${requestOrigin}/pricing?checkout=canceled`,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      automatic_tax: { enabled: true },
      payment_method_collection: "always",
      subscription_data: {
        trial_period_days: 14,
        metadata: { supabase_user_id: user.id },
      },
      consent_collection: {
        terms_of_service: "required",
      },
      custom_text: {
        terms_of_service_acceptance: {
          message: "I agree to the [Terms of Service](https://pageconsult.ai/terms) and [Privacy Policy](https://pageconsult.ai/privacy)",
        },
      },
    });

    console.log("Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
