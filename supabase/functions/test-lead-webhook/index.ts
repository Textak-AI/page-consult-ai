import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { deliverLeadWebhook } from "../_shared/leadWebhook.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Authenticate: the caller may only test their OWN saved webhook URL
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: profile } = await supabase
      .from("profiles")
      .select("lead_webhook_url")
      .eq("id", user.id)
      .maybeSingle();

    const url = profile?.lead_webhook_url;
    if (!url) {
      return new Response(
        JSON.stringify({ error: "No webhook URL saved" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await deliverLeadWebhook(supabase, {
      userId: user.id,
      url,
      payload: {
        event: "lead.created",
        page: { title: "Test Page", slug: "test" },
        lead: {
          name: "Test Lead",
          email: "test@example.com",
          company: "Example Co",
          phone: null,
          message: "This is a test delivery from PageConsult AI.",
        },
        submitted_at: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        success: result.delivered,
        responseStatus: result.responseStatus,
        error: result.error,
        attempts: result.attempts,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("test-lead-webhook error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
