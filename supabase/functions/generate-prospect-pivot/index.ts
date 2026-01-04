import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    const input = await req.json();
    const {
      first_name,
      last_name,
      email,
      company,
      job_title,
      industry,
      context,
      meeting_context,
      base_page_id,
      custom_slug,
    } = input;

    if (!first_name || !industry || !context) {
      throw new Error("Missing required fields: first_name, industry, context");
    }

    console.log("[generate-prospect-pivot] Finding base page for user:", user.id);

    // Find a Quick Pivot enabled page
    let basePage = null;
    if (base_page_id) {
      const { data } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("id", base_page_id)
        .eq("user_id", user.id)
        .single();
      basePage = data;
    }

    if (!basePage) {
      // Find by industry match
      const { data } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("user_id", user.id)
        .eq("industry", industry)
        .eq("quick_pivot_enabled", true)
        .limit(1);

      if (data && data.length > 0) {
        basePage = data[0];
      }
    }

    if (!basePage) {
      // Fallback to any quick pivot page
      const { data: anyPage } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("user_id", user.id)
        .eq("quick_pivot_enabled", true)
        .limit(1);

      if (anyPage && anyPage.length > 0) {
        basePage = anyPage[0];
      }
    }

    if (!basePage) {
      // Last resort - any published page
      const { data: publishedPage } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_published", true)
        .limit(1);

      if (publishedPage && publishedPage.length > 0) {
        basePage = publishedPage[0];
      }
    }

    if (!basePage) {
      throw new Error(
        "No pages found. Create and publish at least one landing page first."
      );
    }

    console.log("[generate-prospect-pivot] Using base page:", basePage.id);

    // Extract hero content from sections
    const heroSection = basePage.sections?.find(
      (s: any) => s.type === "hero"
    );
    const currentHeadline =
      heroSection?.content?.headline || basePage.title || "Welcome";
    const currentSubhead =
      heroSection?.content?.subheadline ||
      heroSection?.content?.subhead ||
      "";
    const currentCta =
      heroSection?.content?.cta_text ||
      heroSection?.content?.ctaText ||
      "Learn More";

    // Generate with Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const prompt = `You are an expert conversion copywriter. Personalize this landing page for a specific prospect.

CURRENT PAGE:
- Headline: ${currentHeadline}
- Subhead: ${currentSubhead}  
- CTA: ${currentCta}

PROSPECT:
- Name: ${first_name}${last_name ? " " + last_name : ""}
- Company: ${company || "Unknown"}
- Role: ${job_title || "Unknown"}
- Industry: ${industry}
${meeting_context ? `- Met at: ${meeting_context}` : ""}

CONVERSATION CONTEXT:
${context}

Generate personalized messaging that:
1. Speaks to their specific pain point from the conversation
2. Uses their industry language naturally
3. Maintains the core value proposition
4. Feels personal but professional

You must respond with ONLY valid JSON, no other text:
{
  "headline": "personalized headline (max 12 words)",
  "subhead": "personalized subhead (max 30 words)",
  "cta_text": "personalized CTA (max 5 words)",
  "context_summary": "one sentence summary for email",
  "email_subject": "email subject line",
  "email_body": "brief email with {{page_link}} placeholder"
}`;

    console.log("[generate-prospect-pivot] Calling Lovable AI...");

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "You are an expert conversion copywriter. Always respond with valid JSON only.",
            },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[generate-prospect-pivot] AI error:", errorText);
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices?.[0]?.message?.content || "";

    console.log("[generate-prospect-pivot] AI response:", responseText);

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");

    const generated = JSON.parse(jsonMatch[0]);

    // Generate slug
    let slug = custom_slug;
    if (!slug) {
      const baseSlug = `${first_name}${last_name ? "-" + last_name : ""}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 30);

      const { data: existing } = await supabase
        .from("prospects")
        .select("slug")
        .like("slug", `${baseSlug}%`);

      slug = baseSlug;
      if (existing?.some((p) => p.slug === baseSlug)) {
        slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
      }
    }

    const publicUrl = `${
      Deno.env.get("PUBLIC_SITE_URL") || "https://pageconsult.ai"
    }/p/${slug}`;

    console.log("[generate-prospect-pivot] Creating prospect with slug:", slug);

    // Create prospect record
    const { data: prospect, error: insertError } = await supabase
      .from("prospects")
      .insert({
        user_id: user.id,
        first_name,
        last_name,
        email,
        company,
        job_title,
        industry,
        context_raw: context,
        context_summary: generated.context_summary,
        meeting_context,
        base_page_id: basePage.id,
        personalized_headline: generated.headline,
        personalized_subhead: generated.subhead,
        personalized_cta_text: generated.cta_text,
        slug,
        email_subject: generated.email_subject,
        email_body: generated.email_body?.replace("{{page_link}}", publicUrl),
        status: "new",
      })
      .select()
      .single();

    if (insertError) {
      console.error("[generate-prospect-pivot] Insert error:", insertError);
      throw insertError;
    }

    console.log("[generate-prospect-pivot] Prospect created:", prospect.id);

    return new Response(
      JSON.stringify({
        success: true,
        prospect,
        personalized_headline: generated.headline,
        personalized_subhead: generated.subhead,
        personalized_cta_text: generated.cta_text,
        email_subject: generated.email_subject,
        email_body: generated.email_body?.replace("{{page_link}}", publicUrl),
        page_url: publicUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-prospect-pivot] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
