import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  prospectId: string;
  pageLink: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOOPS_API_KEY = Deno.env.get("LOOPS_API_KEY");
    const QUICK_PIVOT_EMAIL_ID = Deno.env.get("QUICK_PIVOT_EMAIL_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOOPS_API_KEY) {
      throw new Error("LOOPS_API_KEY not configured");
    }
    if (!QUICK_PIVOT_EMAIL_ID) {
      throw new Error("QUICK_PIVOT_EMAIL_ID not configured");
    }

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      console.error("[send-prospect-email] Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prospectId, pageLink }: SendEmailRequest = await req.json();
    console.log(`[send-prospect-email] Sending email for prospect: ${prospectId}`);

    // Get prospect data
    const { data: prospect, error: prospectError } = await supabase
      .from("prospects")
      .select("*")
      .eq("id", prospectId)
      .eq("user_id", user.id)
      .single();

    if (prospectError || !prospect) {
      console.error("[send-prospect-email] Prospect not found:", prospectError);
      return new Response(JSON.stringify({ error: "Prospect not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!prospect.email) {
      return new Response(JSON.stringify({ error: "Prospect has no email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepare email data - replace {{page_link}} placeholder in email body
    const emailBody = prospect.email_body?.replace(/\{\{page_link\}\}/g, pageLink) || "";
    
    // Send email via Loops transactional API
    console.log(`[send-prospect-email] Sending to ${prospect.email} via Loops`);
    
    const loopsResponse = await fetch("https://app.loops.so/api/v1/transactional", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOOPS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transactionalId: QUICK_PIVOT_EMAIL_ID,
        email: prospect.email,
        dataVariables: {
          firstName: prospect.first_name || prospect.full_name?.split(" ")[0] || "there",
          fullName: prospect.full_name || prospect.first_name || "",
          company: prospect.company || "",
          headline: prospect.personalized_headline || "",
          subhead: prospect.personalized_subhead || "",
          ctaText: prospect.personalized_cta_text || "View Your Page",
          pageLink: pageLink,
          emailSubject: prospect.email_subject || "A personalized page just for you",
          emailBody: emailBody,
          contextSummary: prospect.context_summary || "",
        },
      }),
    });

    if (!loopsResponse.ok) {
      const errorText = await loopsResponse.text();
      console.error("[send-prospect-email] Loops API error:", errorText);
      throw new Error(`Loops API error: ${errorText}`);
    }

    const loopsResult = await loopsResponse.json();
    console.log("[send-prospect-email] Loops response:", loopsResult);

    // Update prospect with email sent status
    const { error: updateError } = await supabase
      .from("prospects")
      .update({
        email_status: "sent",
        email_sent_at: new Date().toISOString(),
      })
      .eq("id", prospectId);

    if (updateError) {
      console.error("[send-prospect-email] Failed to update prospect:", updateError);
    }

    console.log(`[send-prospect-email] Email sent successfully to ${prospect.email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email sent to ${prospect.email}`,
        loopsResult,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[send-prospect-email] Error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
