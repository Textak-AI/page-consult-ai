import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    const body = await req.json();

    // Validate required fields
    const { publishedPageId, email } = body;

    if (!publishedPageId || typeof publishedPageId !== "string") {
      return new Response(
        JSON.stringify({ error: "publishedPageId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize and extract optional fields
    const name = typeof body.name === "string" ? body.name.slice(0, 255) : null;
    const phone = typeof body.phone === "string" ? body.phone.slice(0, 50) : null;
    const company = typeof body.company === "string" ? body.company.slice(0, 255) : null;
    const message = typeof body.message === "string" ? body.message.slice(0, 5000) : null;
    const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl.slice(0, 2000) : null;
    const utmSource = typeof body.utmSource === "string" ? body.utmSource.slice(0, 100) : null;
    const utmMedium = typeof body.utmMedium === "string" ? body.utmMedium.slice(0, 100) : null;
    const utmCampaign = typeof body.utmCampaign === "string" ? body.utmCampaign.slice(0, 100) : null;
    const customFields = body.customFields && typeof body.customFields === "object" ? body.customFields : {};

    // Create Supabase client with service role for insert
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify published page exists and is published
    const { data: page, error: pageError } = await supabase
      .from("published_pages")
      .select("id, status")
      .eq("id", publishedPageId)
      .eq("status", "published")
      .maybeSingle();

    if (pageError || !page) {
      return new Response(
        JSON.stringify({ error: "Published page not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert form submission
    const { data: submission, error: insertError } = await supabase
      .from("form_submissions")
      .insert({
        published_page_id: publishedPageId,
        email: email.slice(0, 255),
        name,
        phone,
        company,
        message,
        custom_fields: customFields,
        source_url: sourceUrl,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        status: "new",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save submission" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, submissionId: submission.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("submit-form error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
