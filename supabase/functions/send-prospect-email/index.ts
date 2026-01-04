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
    // Step 1: Check environment variables
    const LOOPS_API_KEY = Deno.env.get("LOOPS_API_KEY");
    const QUICK_PIVOT_EMAIL_ID = Deno.env.get("QUICK_PIVOT_EMAIL_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("[send-prospect-email] Checking environment variables...");
    
    if (!LOOPS_API_KEY) {
      console.error("[send-prospect-email] LOOPS_API_KEY environment variable not configured");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "LOOPS_API_KEY environment variable not configured" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (!QUICK_PIVOT_EMAIL_ID) {
      console.error("[send-prospect-email] QUICK_PIVOT_EMAIL_ID environment variable not configured");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "QUICK_PIVOT_EMAIL_ID environment variable not configured" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[send-prospect-email] Supabase environment variables not configured");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Supabase environment variables not configured" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[send-prospect-email] Environment variables OK");

    // Step 2: Check auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[send-prospect-email] No authorization header provided");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "No authorization header" 
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      console.error("[send-prospect-email] Auth error:", authError?.message || "User not found");
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Authentication failed: ${authError?.message || "User not found"}` 
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[send-prospect-email] Authenticated user:", user.id);

    // Step 3: Parse request body
    const body = await req.json();
    console.log("[send-prospect-email] Received request with:", JSON.stringify(body, null, 2));

    const { prospectId, pageLink }: SendEmailRequest = body;

    if (!prospectId) {
      console.error("[send-prospect-email] Missing prospectId in request");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Missing prospectId in request body" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!pageLink) {
      console.error("[send-prospect-email] Missing pageLink in request");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Missing pageLink in request body" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 4: Get prospect data
    console.log("[send-prospect-email] Fetching prospect:", prospectId);
    
    const { data: prospect, error: prospectError } = await supabase
      .from("prospects")
      .select("*")
      .eq("id", prospectId)
      .eq("user_id", user.id)
      .single();

    if (prospectError) {
      console.error("[send-prospect-email] Database error fetching prospect:", prospectError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Database error: ${prospectError.message}` 
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!prospect) {
      console.error("[send-prospect-email] Prospect not found or doesn't belong to user");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Prospect not found or access denied" 
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[send-prospect-email] Found prospect:", prospect.id, "email:", prospect.email);

    if (!prospect.email) {
      console.error("[send-prospect-email] Prospect has no email address");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Prospect has no email address" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 5: Prepare and send email via Loops
    const emailBody = prospect.email_body?.replace(/\{\{page_link\}\}/g, pageLink) || "";
    
    const loopsPayload = {
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
        subject: prospect.email_subject || "A personalized page just for you",
        emailBody: emailBody,
        contextSummary: prospect.context_summary || "",
      },
    };

    console.log("[send-prospect-email] Calling Loops API with transactionalId:", QUICK_PIVOT_EMAIL_ID);
    console.log("[send-prospect-email] Sending to:", prospect.email);
    
    const loopsResponse = await fetch("https://app.loops.so/api/v1/transactional", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOOPS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loopsPayload),
    });

    const loopsResponseText = await loopsResponse.text();
    console.log("[send-prospect-email] Loops API response status:", loopsResponse.status);
    console.log("[send-prospect-email] Loops API response:", loopsResponseText);

    if (!loopsResponse.ok) {
      console.error("[send-prospect-email] Loops API error:", loopsResponseText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Loops API error (${loopsResponse.status}): ${loopsResponseText}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let loopsResult;
    try {
      loopsResult = JSON.parse(loopsResponseText);
    } catch {
      loopsResult = { raw: loopsResponseText };
    }

    // Step 6: Update prospect with email sent status
    console.log("[send-prospect-email] Updating prospect email status...");
    
    const { error: updateError } = await supabase
      .from("prospects")
      .update({
        email_status: "sent",
        email_sent_at: new Date().toISOString(),
      })
      .eq("id", prospectId);

    if (updateError) {
      console.error("[send-prospect-email] Failed to update prospect status:", updateError);
      // Don't fail the request, email was sent successfully
    }

    console.log("[send-prospect-email] Email sent successfully to", prospect.email);

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
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("[send-prospect-email] Unhandled error:", errorMessage);
    console.error("[send-prospect-email] Stack:", errorStack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
