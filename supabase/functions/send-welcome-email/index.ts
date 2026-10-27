import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

// Welcome email — sent once per user after signup.
// Idempotency: profiles.welcome_email_sent_at (service-role written).
// Provider: Resend with inline HTML, same verified sender domain as
// send-testimonial-request (pageconsult.ai). Never blocks signup.

const SEND_TIMEOUT_MS = 5000;

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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!backendUrl || !serviceKey || !resendApiKey) return json({ error: "email_unavailable" }, 500);
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

    if (!user.email) return json({ error: "no_email" }, 400);

    // Idempotency guard — send once per user
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("welcome_email_sent_at")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) throw new Error("Profile lookup failed");
    if (profile?.welcome_email_sent_at) {
      return json({ sent: false, reason: "already_sent" });
    }

    const siteUrl = (Deno.env.get("PUBLIC_SITE_URL") || "https://pageconsult.app").replace(/\/$/, "");
    const dashboardUrl = `${siteUrl}/dashboard`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
    let resendResponse: Response;
    try {
      resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          from: "PageConsult AI <hello@pageconsult.ai>",
          to: [user.email],
          subject: "Welcome to PageConsult AI",
          html: welcomeEmailHtml(dashboardUrl),
          text: `Your PageConsult AI account is ready. The next step is to start a consultation and publish your first page. Open your dashboard: ${dashboardUrl}\n\n— PageConsult AI`,
          tags: [{ name: "type", value: "welcome" }],
        }),
      });
    } finally {
      clearTimeout(timer);
    }

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error(`Welcome email failed [${resendResponse.status}]: ${errorBody}`);
      return json({ sent: false, reason: "provider_error", status: resendResponse.status }, 502);
    }

    // Mark sent — only if still null, so a concurrent call can't double-send
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq("id", user.id)
      .is("welcome_email_sent_at", null);
    if (updateError) console.error("welcome_email_sent_at update failed:", updateError);

    console.log(`📧 Welcome email sent to ${user.email}`);
    return json({ sent: true });
  } catch (err) {
    console.error("send-welcome-email error:", err);
    return json({ error: "Unable to send welcome email." }, 500);
  }
});

function welcomeEmailHtml(dashboardUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to PageConsult AI</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">
              <tr>
                <td style="padding: 0 0 24px;">
                  <p style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 600;">PageConsult AI</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 0 24px;">
                  <p style="margin: 0; color: #334155; font-size: 16px; line-height: 1.6;">
                    Your account is ready. The next step is to start a consultation and publish your first page.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 0 32px;">
                  <a href="${dashboardUrl}"
                     style="display: inline-block; padding: 12px 28px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                    Open your dashboard
                  </a>
                </td>
              </tr>
              <tr>
                <td style="border-top: 1px solid #e2e8f0; padding: 24px 0 0;">
                  <p style="margin: 0; color: #64748b; font-size: 13px;">— PageConsult AI</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
