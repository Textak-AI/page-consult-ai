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
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const slug = pathParts[pathParts.length - 1] || url.searchParams.get("slug");

    if (!slug || slug === "render-prospect-page") {
      return new Response(renderError("Page not found"), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    console.log("[render-prospect-page] Rendering slug:", slug);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch prospect
    const { data: prospect, error: prospectError } = await supabase
      .from("prospects")
      .select("*")
      .eq("slug", slug)
      .single();

    if (prospectError || !prospect) {
      console.log("[render-prospect-page] Prospect not found:", slug);
      return new Response(renderError("Page not found"), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Fetch base page
    const { data: basePage, error: pageError } = await supabase
      .from("landing_pages")
      .select("*")
      .eq("id", prospect.base_page_id)
      .single();

    if (pageError || !basePage) {
      console.log("[render-prospect-page] Base page not found");
      return new Response(renderError("Page not found"), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const siteUrl = Deno.env.get("PUBLIC_SITE_URL") || "https://pageconsult.ai";

    // Track view (async)
    trackView(supabase, prospect);

    // Render HTML
    const html = renderPage(prospect, basePage, siteUrl);

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    console.error("[render-prospect-page] Error:", error);
    return new Response(renderError("Something went wrong"), {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
});

async function trackView(supabase: any, prospect: any) {
  try {
    const updates: Record<string, any> = {
      view_count: (prospect.view_count || 0) + 1,
      last_viewed_at: new Date().toISOString(),
    };

    if (!prospect.first_viewed_at) {
      updates.first_viewed_at = new Date().toISOString();
      updates.status = "contacted";
    }

    await supabase.from("prospects").update(updates).eq("id", prospect.id);
  } catch (e) {
    console.error("[render-prospect-page] Track view error:", e);
  }
}

function renderPage(prospect: any, basePage: any, siteUrl: string): string {
  const headline = prospect.personalized_headline || basePage.title || "";
  const subhead = prospect.personalized_subhead || "";
  const ctaText = prospect.personalized_cta_text || "Get Started";
  const pageUrl = `${siteUrl}/p/${prospect.slug}`;

  // Get sections from base page and personalize hero
  const sections = basePage.sections || [];
  const sectionsHtml = sections
    .filter((s: any) => s.visible !== false)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    .map((section: any) => renderSection(section, prospect))
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(headline)}</title>
  <meta name="description" content="${escapeHtml(subhead)}">
  <meta name="robots" content="noindex, nofollow">
  <meta property="og:title" content="${escapeHtml(headline)}">
  <meta property="og:description" content="${escapeHtml(subhead)}">
  <meta property="og:url" content="${pageUrl}">
  <link rel="canonical" href="${pageUrl}">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${escapeHtml(headline)}",
    "description": "${escapeHtml(subhead)}",
    "url": "${pageUrl}"
  }
  </script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    section { padding: 80px 24px; }
    h1 { font-size: 3rem; font-weight: 800; line-height: 1.1; margin-bottom: 1rem; }
    h2 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; }
    p { color: #64748b; font-size: 1.125rem; }
    .hero { min-height: 70vh; display: flex; align-items: center; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); }
    .hero-content { max-width: 800px; }
    .cta-button { display: inline-block; background: #7c3aed; color: white; padding: 16px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 2rem; transition: background 0.2s; }
    .cta-button:hover { background: #6d28d9; }
    .stats { background: #1e293b; color: white; }
    .stats p { color: #94a3b8; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; text-align: center; }
    .stat-value { font-size: 2.5rem; font-weight: 800; color: #7c3aed; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 2rem; }
    .feature-card { padding: 2rem; background: #f8fafc; border-radius: 12px; }
    .feature-card h3 { font-size: 1.25rem; margin-bottom: 0.5rem; color: #1e293b; }
    .faq-item { border-bottom: 1px solid #e2e8f0; padding: 1.5rem 0; }
    .faq-item h3 { font-size: 1.125rem; margin-bottom: 0.5rem; }
    .final-cta { background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; text-align: center; }
    .final-cta h2 { color: white; }
    .final-cta p { color: rgba(255,255,255,0.8); }
    .final-cta .cta-button { background: white; color: #7c3aed; }
    @media (max-width: 768px) {
      h1 { font-size: 2rem; }
      h2 { font-size: 1.5rem; }
      section { padding: 48px 16px; }
    }
  </style>
</head>
<body>
  ${sectionsHtml || renderDefaultHero(prospect, ctaText)}
  
  <script>
    // Track engagement
    let startTime = Date.now();
    let maxScroll = 0;
    
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      maxScroll = Math.max(maxScroll, scrollPercent);
    });
    
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      navigator.sendBeacon(
        '${siteUrl}/functions/v1/track-prospect-view',
        JSON.stringify({
          slug: '${prospect.slug}',
          time_on_page: timeOnPage,
          scroll_depth: maxScroll,
          is_final: true
        })
      );
    });
  </script>
</body>
</html>`;
}

function renderDefaultHero(prospect: any, ctaText: string): string {
  return `
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>${escapeHtml(prospect.personalized_headline || "Welcome")}</h1>
          <p>${escapeHtml(prospect.personalized_subhead || "")}</p>
          <a href="#contact" class="cta-button">${escapeHtml(ctaText)}</a>
        </div>
      </div>
    </section>
  `;
}

function renderSection(section: any, prospect: any): string {
  const { type, content } = section;

  switch (type) {
    case "hero":
      // Use personalized content
      const headline = prospect.personalized_headline || content?.headline || "";
      const subhead = prospect.personalized_subhead || content?.subheadline || content?.subhead || "";
      const ctaText = prospect.personalized_cta_text || content?.cta_text || content?.ctaText || "Get Started";
      return `
        <section class="hero">
          <div class="container">
            <div class="hero-content">
              <h1>${escapeHtml(headline)}</h1>
              <p>${escapeHtml(subhead)}</p>
              <a href="#contact" class="cta-button">${escapeHtml(ctaText)}</a>
            </div>
          </div>
        </section>
      `;

    case "stats-bar":
    case "stats":
      const stats = content?.stats || content?.items || [];
      return `
        <section class="stats">
          <div class="container">
            <div class="stats-grid">
              ${stats
                .map(
                  (stat: any) => `
                <div>
                  <div class="stat-value">${escapeHtml(stat.value || stat.number || "")}</div>
                  <p>${escapeHtml(stat.label || stat.description || "")}</p>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </section>
      `;

    case "features":
      const features = content?.features || content?.items || [];
      return `
        <section>
          <div class="container">
            ${content?.title ? `<h2>${escapeHtml(content.title)}</h2>` : ""}
            <div class="features-grid">
              ${features
                .map(
                  (feature: any) => `
                <div class="feature-card">
                  <h3>${escapeHtml(feature.title || "")}</h3>
                  <p>${escapeHtml(feature.description || "")}</p>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </section>
      `;

    case "faq":
      const faqs = content?.items || content?.faqs || [];
      return `
        <section>
          <div class="container">
            <h2>Frequently Asked Questions</h2>
            ${faqs
              .map(
                (faq: any) => `
              <div class="faq-item">
                <h3>${escapeHtml(faq.question || "")}</h3>
                <p>${escapeHtml(faq.answer || "")}</p>
              </div>
            `
              )
              .join("")}
          </div>
        </section>
      `;

    case "cta":
    case "final-cta":
      return `
        <section class="final-cta">
          <div class="container">
            <h2>${escapeHtml(content?.headline || content?.title || "Ready to Get Started?")}</h2>
            <p>${escapeHtml(content?.subheadline || content?.subtitle || "")}</p>
            <a href="#contact" class="cta-button">
              ${escapeHtml(prospect.personalized_cta_text || content?.cta_text || content?.ctaText || "Get Started")}
            </a>
          </div>
        </section>
      `;

    default:
      return "";
  }
}

function renderError(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found</title>
  <style>
    body { font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; }
    .error { text-align: center; }
    h1 { color: #1e293b; margin-bottom: 0.5rem; }
    p { color: #64748b; }
    a { color: #7c3aed; }
  </style>
</head>
<body>
  <div class="error">
    <h1>${escapeHtml(message)}</h1>
    <p>This link may have expired or the page doesn't exist.</p>
    <p><a href="/">Go Home</a></p>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
