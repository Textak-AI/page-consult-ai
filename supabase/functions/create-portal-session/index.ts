import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  const preflight = handleCorsPreflightRequest(req);
  if (preflight) return preflight;
  const headers = { ...getCorsHeaders(req.headers.get("Origin")), "Content-Type": "application/json" };
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return json({ error: "unauthorized" }, 401);

  try {
    const backendUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!backendUrl || !serviceKey) return json({ error: "billing_unavailable" }, 500);
    const supabase = createClient(backendUrl, serviceKey);
    let user;
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) return json({ error: "unauthorized" }, 401);
      user = data.user;
    } catch {
      return json({ error: "unauthorized" }, 401);
    }

    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (subscriptionError) throw new Error("Subscription lookup failed");
    let customerId = subscription?.stripe_customer_id;
    if (!customerId) {
      const { data: usage, error: usageError } = await supabase
        .from("user_usage")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (usageError) throw new Error("Billing account lookup failed");
      customerId = usage?.stripe_customer_id;
    }
    if (!customerId) return json({ error: "no_billing_account" }, 404);

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const siteUrl = Deno.env.get("PUBLIC_SITE_URL");
    if (!stripeKey || !siteUrl) return json({ error: "billing_unavailable" }, 500);

    const response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ customer: customerId, return_url: `${siteUrl.replace(/\/$/, "")}/settings` }),
    });
    const session = await response.json();
    if (!response.ok || typeof session.url !== "string" || !session.url) {
      return json({ error: "Unable to open billing portal. Please try again." }, 502);
    }
    return json({ url: session.url });
  } catch {
    return json({ error: "Unable to open billing portal. Please try again." }, 500);
  }
});