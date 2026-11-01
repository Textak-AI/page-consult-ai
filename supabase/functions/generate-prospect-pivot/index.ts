import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { withCharge } from '../_shared/planLimits.ts';
import { COPY_REGISTER_RULES, PROVENANCE_RULES, logRegisterViolations, logProvenanceViolations } from "../_shared/copyRegister.ts";
import { guardCopyClaims } from "../_shared/copyClaims.ts";
import { pageCopyStrings } from "../_shared/pageChat.ts";
import { prospectSlug } from "../_shared/prospectSlug.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handle = async (req: Request, userId: string): Promise<Response> => {
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
      // Last resort (older clients that don't send base_page_id): the most recently updated published page
      const { data: publishedPage } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_published", true)
        .order("updated_at", { ascending: false })
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
    // The owner's stated button text is never rewritten for a prospect (pinned like on every page).
    const currentCta =
      heroSection?.content?.cta_text ||
      heroSection?.content?.ctaText ||
      null;

    // What the owner has stated: the base page's copy, its consultation answers, their notes and the
    // prospect's details. Personalized copy may only use facts from here.
    const ownerInput = {
      pageCopy: pageCopyStrings(basePage.sections || []),
      consultation: basePage.consultation_data || {},
      notes: context,
      meeting: meeting_context || "",
      prospect: { first_name, last_name, company, job_title, industry },
    };

    // Generate with Anthropic
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    // Fetch user's signature settings
    console.log("[generate-prospect-pivot] Fetching user signature settings...");
    const { data: profile } = await supabase
      .from("profiles")
      .select("signature_name, signature_title, signature_email, signature_phone, signature_website, signature_enabled, signature_type, signature_html")
      .eq("id", user.id)
      .single();

    const signatureEnabled = profile?.signature_enabled ?? true;
    const signatureType = profile?.signature_type || "simple";
    let signatureBlock = "";
    let isHtmlSignature = false;
    
    if (signatureEnabled) {
      if (signatureType === "html" && profile?.signature_html) {
        // Use custom HTML signature
        signatureBlock = "\n\n" + profile.signature_html;
        isHtmlSignature = true;
        console.log("[generate-prospect-pivot] Using HTML signature");
      } else if (profile?.signature_name) {
        // Build simple text signature
        signatureBlock = "\n\nBest regards,\n\n" + profile.signature_name;
        if (profile.signature_title) signatureBlock += "\n" + profile.signature_title;
        if (profile.signature_email) signatureBlock += "\n" + profile.signature_email;
        if (profile.signature_phone) signatureBlock += "\n" + profile.signature_phone;
        if (profile.signature_website) signatureBlock += "\n" + profile.signature_website;
        console.log("[generate-prospect-pivot] Using simple signature");
      }
    }

    console.log("[generate-prospect-pivot] Signature enabled:", signatureEnabled, "Type:", signatureType, "Has signature:", !!signatureBlock);

    const prompt = `You are an expert conversion copywriter. Personalize this landing page for a specific prospect.

CURRENT PAGE:
- Headline: ${currentHeadline}
- Subhead: ${currentSubhead}  
- CTA: ${currentCta || "(none)"}

PROSPECT:
- Name: ${first_name}${last_name ? " " + last_name : ""}
- Company: ${company || "Unknown"}
- Role: ${job_title || "Unknown"}
- Industry: ${industry}
${meeting_context ? `- Met at: ${meeting_context}` : ""}

CONVERSATION CONTEXT:
${context}

Generate personalized messaging that:
1. Speaks to their specific pain point, in the words of the conversation notes
2. Uses their industry language naturally
3. Keeps the page's core value proposition
4. Feels personal but professional

ZERO FABRICATION:
- Use only facts from the CURRENT PAGE, the PROSPECT details and the CONVERSATION CONTEXT.
- Never add numbers, results, client counts, timelines, guarantees, prices, other clients' names, or claims about the prospect's company that the notes don't state.
- Do not change the CTA; it is the owner's.

CRITICAL EMAIL BODY RULES:
- Include the page link naturally in the email (use {{page_link}} placeholder)
- Do NOT include any sign-off like "Best," or "Best regards," or any closing
- Do NOT include "[Your Name]" or any name placeholder
- The email body should end with the last sentence of your message content
- Keep the email brief (3-5 sentences max)
- The signature will be appended separately by the system

You must respond with ONLY valid JSON, no other text:
{
  "headline": "personalized headline (max 12 words)",
  "subhead": "personalized subhead (max 30 words)",
  "cta_text": "personalized CTA (max 5 words)",
  "context_summary": "one sentence summary for email",
  "email_subject": "email subject line",
  "email_body": "brief email with {{page_link}} placeholder - NO sign-off, NO name, NO 'Best regards'"
}`;

    console.log("[generate-prospect-pivot] Calling Lovable AI...");

    const aiResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 4096,
          system: "You are an expert conversion copywriter. Always respond with valid JSON only.\n\n" + COPY_REGISTER_RULES + "\n\n" + PROVENANCE_RULES,
          messages: [
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
    const responseText = aiData.content?.filter((block: { type: string; text?: string }) => block.type === "text").map((block: { text?: string }) => block.text || "").join("") || "";

    console.log("[generate-prospect-pivot] AI response:", responseText);

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");

    const raw = JSON.parse(jsonMatch[0]);
    logRegisterViolations("generate-prospect-pivot", raw);
    // Same claim guard as the page builder: unsupported numbers/commitments drop the whole sentence.
    const generated = guardCopyClaims(
      { headline: raw.headline, subhead: raw.subhead, context_summary: raw.context_summary, email_subject: raw.email_subject, email_body: raw.email_body },
      ownerInput,
      "prospect-copy-guard",
    ) as Record<string, string>;
    logProvenanceViolations("generate-prospect-pivot", generated, JSON.stringify(ownerInput));
    // A guarded-away line falls back to the owner's own copy, never to nothing.
    if (!generated.headline) generated.headline = currentHeadline;
    if (!generated.subhead) generated.subhead = currentSubhead;
    generated.cta_text = currentCta || "";

    // Slug: sanitized, and unique across prospect pages and published pages (both live at top-level paths).
    const wanted = prospectSlug(custom_slug || `${first_name}${last_name ? "-" + last_name : ""}`);
    if (!wanted) throw new Error("Choose a link name with letters or numbers.");
    const taken = async (candidate: string) => {
      const [{ data: p }, { data: l }] = await Promise.all([
        supabase.from("prospects").select("id").eq("slug", candidate).limit(1),
        supabase.from("landing_pages").select("id").eq("slug", candidate).limit(1),
      ]);
      return (p?.length || 0) + (l?.length || 0) > 0;
    };
    let slug = wanted;
    for (let i = 0; i < 5 && (await taken(slug)); i++) {
      slug = `${wanted}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const publicUrl = `${
      Deno.env.get("PUBLIC_SITE_URL") || "https://pageconsult.app"
    }/for/${slug}`;

    console.log("[generate-prospect-pivot] Creating prospect with slug:", slug);

    // Build the complete email body with signature
    const baseEmailBody = generated.email_body?.replace("{{page_link}}", publicUrl) || "";
    const completeEmailBody = baseEmailBody + signatureBlock;

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
        email_body: completeEmailBody,
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
        email_body: completeEmailBody,
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
};

// Charged server-side before work; refunded on failure (see _shared/planLimits.ts).
serve((req) => withCharge(req, 'prospect_page', corsHeaders, (userId) => handle(req, userId), { createClient }));
