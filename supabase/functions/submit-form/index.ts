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

    // Best-effort email notification to page owner via Loops
    const loopsApiKey = Deno.env.get("LOOPS_API_KEY");
    if (loopsApiKey) {
      try {
        const { data: pageOwner } = await supabase
          .from("published_pages")
          .select("user_id, page_title, slug")
          .eq("id", publishedPageId)
          .single();

        if (pageOwner) {
          const { data: ownerData } = await supabase.auth.admin.getUserById(pageOwner.user_id);
          const ownerEmail = ownerData?.user?.email;

          if (ownerEmail) {
            await fetch("https://app.loops.so/api/v1/transactional", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${loopsApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                transactionalId: "cm97cd4au006fl70pbxkfbkjn",
                email: ownerEmail,
                dataVariables: {
                  leadName: name || "Someone",
                  leadEmail: email,
                  leadCompany: company || "Not provided",
                  leadPhone: phone || "Not provided",
                  leadMessage: message || "No message",
                  pageName: pageOwner.page_title || "Your landing page",
                  pageUrl: `https://pages.pageconsult.ai/p/${pageOwner.slug}`,
                  submittedAt: new Date().toLocaleString("en-US", {
                    timeZone: "America/New_York",
                    dateStyle: "medium",
                    timeStyle: "short",
                  }),
                },
              }),
            });
            console.log("📧 Lead notification sent to", ownerEmail);
          }
        }
      } catch (emailError) {
        console.error("Notification email failed:", emailError);
      }
    } else {
      console.warn("LOOPS_API_KEY not configured — skipping notification");
    }

    // Lead webhook to the page owner's CRM — fires after a successful insert and
    // must never block or fail lead capture (5s timeout, one retry, outcome logged)
    const webhookDelivery = (async () => {
      try {
        const { data: ownerPage } = await supabase
          .from("published_pages")
          .select("user_id, page_title, slug")
          .eq("id", publishedPageId)
          .single();

        if (!ownerPage) return;

        const { data: ownerProfile } = await supabase
          .from("profiles")
          .select("lead_webhook_url")
          .eq("id", ownerPage.user_id)
          .maybeSingle();

        const webhookUrl = ownerProfile?.lead_webhook_url;
        if (!webhookUrl) return;

        const result = await deliverLeadWebhook(supabase, {
          userId: ownerPage.user_id,
          url: webhookUrl,
          payload: {
            event: "lead.created",
            page: { title: ownerPage.page_title || null, slug: ownerPage.slug || null },
            lead: {
              name,
              email: email.slice(0, 255),
              company,
              phone,
              message,
              custom_fields: customFields,
              source_url: sourceUrl,
              utm_source: utmSource,
              utm_medium: utmMedium,
              utm_campaign: utmCampaign,
            },
            submitted_at: new Date().toISOString(),
          },
        });
        console.log(`🔗 Lead webhook ${result.delivered ? "delivered" : "failed"} (${result.attempts} attempt(s))`);
      } catch (webhookError) {
        console.error("Lead webhook delivery error:", webhookError);
      }
    })();

    // First-lead email to the page owner — fires only when this is the page's
    // first ever lead. Idempotent via landing_pages.first_lead_email_sent_at
    // (service-role written). Same isolation rules as the webhook: 5s timeout,
    // try/catch isolated, never blocks or fails lead capture.
    const firstLeadEmail = (async () => {
      try {
        const { count } = await supabase
          .from("form_submissions")
          .select("id", { count: "exact", head: true })
          .eq("published_page_id", publishedPageId);

        if (count !== 1) return;

        const { data: ownerPage } = await supabase
          .from("published_pages")
          .select("user_id, page_title, landing_page_id")
          .eq("id", publishedPageId)
          .single();

        if (!ownerPage?.landing_page_id) return;

        const { data: landingPage } = await supabase
          .from("landing_pages")
          .select("first_lead_email_sent_at")
          .eq("id", ownerPage.landing_page_id)
          .maybeSingle();

        if (landingPage?.first_lead_email_sent_at) return;

        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (!resendApiKey) {
          console.warn("RESEND_API_KEY not configured — skipping first-lead email");
          return;
        }

        const { data: ownerData } = await supabase.auth.admin.getUserById(ownerPage.user_id);
        const ownerEmail = ownerData?.user?.email;
        if (!ownerEmail) return;

        const siteUrl = (Deno.env.get("PUBLIC_SITE_URL") || "https://pageconsult.ai").replace(/\/$/, "");
        const leadsUrl = `${siteUrl}/`;
        const pageTitle = ownerPage.page_title || "Your page";
        const leadDescription = company ? `${name || "A visitor"} from ${company}` : (name || "A visitor");

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        let resendResponse: Response;
        try {
          resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
            body: JSON.stringify({
              from: "PageConsult AI <hello@pageconsult.ai>",
              to: [ownerEmail],
              subject: "Your page just got its first lead",
              html: `
                <!DOCTYPE html>
                <html>
                <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
                <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 40px 20px;">
                    <tr><td align="center">
                      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">
                        <tr><td style="padding: 0 0 24px;">
                          <p style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 600;">PageConsult AI</p>
                        </td></tr>
                        <tr><td style="padding: 0 0 24px;">
                          <p style="margin: 0; color: #334155; font-size: 16px; line-height: 1.6;">
                            ${leadDescription} just submitted the form on &quot;${pageTitle}&quot; — your page's first lead.
                          </p>
                        </td></tr>
                        <tr><td style="padding: 0 0 32px;">
                          <a href="${leadsUrl}"
                             style="display: inline-block; padding: 12px 28px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                            View your leads
                          </a>
                        </td></tr>
                        <tr><td style="border-top: 1px solid #e2e8f0; padding: 24px 0 0;">
                          <p style="margin: 0; color: #64748b; font-size: 13px;">— PageConsult AI</p>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
              `,
              text: `${leadDescription} just submitted the form on "${pageTitle}" — your page's first lead. View your leads: ${leadsUrl}\n\n— PageConsult AI`,
              tags: [{ name: "type", value: "first-lead" }],
            }),
          });
        } finally {
          clearTimeout(timer);
        }

        if (!resendResponse.ok) {
          const errorBody = await resendResponse.text();
          console.error(`First-lead email failed [${resendResponse.status}]: ${errorBody}`);
          return;
        }

        // Mark sent — only if still null, so a concurrent send can't double-fire
        const { error: updateError } = await supabase
          .from("landing_pages")
          .update({ first_lead_email_sent_at: new Date().toISOString() })
          .eq("id", ownerPage.landing_page_id)
          .is("first_lead_email_sent_at", null);
        if (updateError) console.error("first_lead_email_sent_at update failed:", updateError);

        console.log(`📧 First-lead email sent to ${ownerEmail}`);
      } catch (firstLeadError) {
        console.error("First-lead email error:", firstLeadError);
      }
    })();

    // Run in the background when the runtime supports it; otherwise await it
    // (still failure-isolated — lead capture has already succeeded)
    const backgroundWork = Promise.allSettled([webhookDelivery, firstLeadEmail]);
    const edgeRuntime = (globalThis as any).EdgeRuntime;
    if (edgeRuntime?.waitUntil) {
      edgeRuntime.waitUntil(backgroundWork);
    } else {
      await backgroundWork;
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
