import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Schema.org business type mapping
const BUSINESS_TYPE_MAP: Record<string, string> = {
  'saas': 'SoftwareApplication',
  'software': 'SoftwareApplication',
  'consulting': 'ProfessionalService',
  'professional-services': 'ProfessionalService',
  'healthcare': 'MedicalBusiness',
  'financial-services': 'FinancialService',
  'marketing': 'ProfessionalService',
  'ecommerce': 'Store',
  'retail': 'Store',
  'education': 'EducationalOrganization',
  'real-estate': 'RealEstateAgent',
  'construction': 'GeneralContractor',
  'logistics': 'ProfessionalService',
  'manufacturing': 'ProfessionalService',
  'coaching': 'ProfessionalService',
  'fitness': 'SportsActivityLocation',
  'legal': 'LegalService',
  'accounting': 'AccountingService',
  'default': 'Organization'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    // Extract slug from path - handles both /render-public-page/slug and ?slug=slug
    const pathParts = url.pathname.split('/')
    const slug = pathParts[pathParts.length - 1] || url.searchParams.get('slug')

    if (!slug || slug === 'render-public-page') {
      return new Response(renderErrorPage('Page not found'), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch the page
    const { data: page, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error || !page) {
      console.log('Page not found:', slug, error?.message)
      return new Response(renderErrorPage('Page not found'), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
      })
    }

    // Fetch related consultation for richer schema
    let consultation = null
    if (page.consultation_id) {
      const { data } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', page.consultation_id)
        .single()
      consultation = data
    }

    // Track the view (async, don't wait)
    trackView(supabase, page.id)

    // Generate the full HTML
    const html = renderFullPage(page, consultation)

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      }
    })

  } catch (error) {
    console.error('Error rendering page:', error)
    return new Response(renderErrorPage('Something went wrong'), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
    })
  }
})

async function trackView(supabase: any, pageId: string) {
  try {
    await supabase.rpc('increment_page_view', { page_id: pageId })
  } catch (e) {
    console.error('Failed to track view:', e)
  }
}

function getSiteUrl(): string {
  return Deno.env.get('PUBLIC_SITE_URL') || 'https://pageconsult.ai'
}

function generateSchema(page: any, consultation: any): string {
  const industryKey = (page.industry || '').toLowerCase().replace(/\s+/g, '-')
  const businessType = BUSINESS_TYPE_MAP[industryKey] || BUSINESS_TYPE_MAP['default']
  
  const baseSchema: any = {
    "@context": "https://schema.org",
    "@type": businessType,
    "name": consultation?.business_name || page.title,
    "description": page.meta_description || '',
    "url": `${getSiteUrl()}/page/${page.slug}`,
  }

  // Add image if available
  if (page.hero_thumbnail_url) {
    baseSchema.image = page.hero_thumbnail_url
  }

  const schemas = [baseSchema]
  
  // Add FAQ schema if exists
  const faqSchema = generateFAQSchema(page)
  if (faqSchema) schemas.push(faqSchema)

  // Add WebPage schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": page.meta_title || page.title,
    "description": page.meta_description || '',
    "url": `${getSiteUrl()}/page/${page.slug}`,
    "datePublished": page.published_at || page.created_at,
    "dateModified": page.updated_at
  })

  return schemas.map(s => 
    `<script type="application/ld+json">${JSON.stringify(s, null, 2)}</script>`
  ).join('\n')
}

function generateFAQSchema(page: any): any | null {
  const sections = page.sections || []
  const faqSection = sections.find((s: any) => s.type === 'faq')
  
  if (!faqSection?.content?.items?.length) return null

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqSection.content.items.map((item: any) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }
}

function generateMetaTags(page: any): string {
  const title = page.meta_title || page.title || 'Landing Page'
  const description = page.meta_description || ''
  const image = page.hero_thumbnail_url || ''
  const url = `${getSiteUrl()}/page/${page.slug}`

  return `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${url}" />
    
    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${url}" />
    ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ''}
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ''}
    
    <!-- Robots -->
    <meta name="robots" content="index, follow" />
  `
}

function renderSection(section: any): string {
  const { type, content } = section
  if (!content) return ''
  
  switch (type) {
    case 'hero':
      return `
        <section style="padding: 80px 24px; text-align: center; background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);">
          <div style="max-width: 800px; margin: 0 auto;">
            <h1 style="font-size: 3rem; font-weight: 800; color: white; margin-bottom: 24px; line-height: 1.1;">
              ${escapeHtml(content.headline || '')}
            </h1>
            <p style="font-size: 1.25rem; color: rgba(255,255,255,0.8); margin-bottom: 32px;">
              ${escapeHtml(content.subheadline || content.subhead || '')}
            </p>
            ${content.cta_text ? `
              <a href="${escapeHtml(content.cta_url || '#')}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(90deg, #8b5cf6, #06b6d4); color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">
                ${escapeHtml(content.cta_text)}
              </a>
            ` : ''}
          </div>
        </section>
      `
    
    case 'stats-bar':
    case 'stats':
      const stats = content.stats || content.items || []
      return `
        <section style="padding: 48px 24px; background: #f8fafc;">
          <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: center; gap: 48px;">
            ${stats.map((stat: any) => `
              <div style="text-align: center; min-width: 150px;">
                <p style="font-size: 2.5rem; font-weight: 800; color: #8b5cf6; margin: 0;">${escapeHtml(stat.value || stat.number || '')}</p>
                <p style="font-size: 0.875rem; color: #64748b; margin-top: 8px;">${escapeHtml(stat.label || stat.description || '')}</p>
              </div>
            `).join('')}
          </div>
        </section>
      `
    
    case 'features':
      const features = content.features || content.items || content.messagingPillars || []
      return `
        <section style="padding: 80px 24px; background: white;">
          ${content.title ? `<h2 style="font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 48px; color: #0f172a;">${escapeHtml(content.title)}</h2>` : ''}
          <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px;">
            ${features.map((feature: any) => `
              <div style="padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;">
                <h3 style="font-size: 1.25rem; font-weight: 600; color: #0f172a; margin-bottom: 12px;">${escapeHtml(feature.title || '')}</h3>
                <p style="color: #64748b; line-height: 1.6;">${escapeHtml(feature.description || '')}</p>
              </div>
            `).join('')}
          </div>
        </section>
      `
    
    case 'faq':
      const faqs = content.items || content.faqs || content.objections || []
      return `
        <section style="padding: 80px 24px; background: #f8fafc;">
          <h2 style="font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 48px; color: #0f172a;">Frequently Asked Questions</h2>
          <div style="max-width: 800px; margin: 0 auto;">
            ${faqs.map((faq: any) => `
              <div style="margin-bottom: 24px; padding: 24px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h3 style="font-size: 1.125rem; font-weight: 600; color: #0f172a; margin-bottom: 12px;">${escapeHtml(faq.question || '')}</h3>
                <p style="color: #64748b; line-height: 1.6;">${escapeHtml(faq.answer || '')}</p>
              </div>
            `).join('')}
          </div>
        </section>
      `
    
    case 'social-proof':
    case 'testimonials':
      const testimonials = content.testimonials || content.items || []
      return `
        <section style="padding: 80px 24px; background: white;">
          <h2 style="font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 48px; color: #0f172a;">What Our Clients Say</h2>
          <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px;">
            ${testimonials.map((t: any) => `
              <div style="padding: 24px; background: #f8fafc; border-radius: 16px;">
                <p style="font-style: italic; color: #334155; margin-bottom: 16px; line-height: 1.6;">"${escapeHtml(t.quote || t.text || '')}"</p>
                <p style="font-weight: 600; color: #0f172a;">
                  ${escapeHtml(t.author || t.name || '')}
                  ${t.title ? ` — <span style="font-weight: 400; color: #64748b;">${escapeHtml(t.title)}</span>` : ''}
                </p>
              </div>
            `).join('')}
          </div>
        </section>
      `
    
    case 'how-it-works':
      const steps = content.steps || content.processSteps || []
      return `
        <section style="padding: 80px 24px; background: #f8fafc;">
          <h2 style="font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 48px; color: #0f172a;">${escapeHtml(content.title || 'How It Works')}</h2>
          <div style="max-width: 800px; margin: 0 auto;">
            ${steps.map((step: any, i: number) => `
              <div style="display: flex; gap: 24px; margin-bottom: 32px; align-items: flex-start;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #06b6d4); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">
                  ${step.step || i + 1}
                </div>
                <div>
                  <h3 style="font-size: 1.25rem; font-weight: 600; color: #0f172a; margin-bottom: 8px;">${escapeHtml(step.title || '')}</h3>
                  <p style="color: #64748b; line-height: 1.6;">${escapeHtml(step.description || '')}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `

    case 'problem-solution':
      return `
        <section style="padding: 80px 24px; background: white;">
          <div style="max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 48px;">
            <div style="padding: 32px; background: #fef2f2; border-radius: 16px; border-left: 4px solid #ef4444;">
              <h3 style="font-size: 1.25rem; font-weight: 600; color: #dc2626; margin-bottom: 16px;">The Problem</h3>
              <p style="color: #7f1d1d; line-height: 1.6;">${escapeHtml(content.problem || content.problemStatement || '')}</p>
            </div>
            <div style="padding: 32px; background: #f0fdf4; border-radius: 16px; border-left: 4px solid #22c55e;">
              <h3 style="font-size: 1.25rem; font-weight: 600; color: #16a34a; margin-bottom: 16px;">The Solution</h3>
              <p style="color: #14532d; line-height: 1.6;">${escapeHtml(content.solution || content.solutionStatement || '')}</p>
            </div>
          </div>
        </section>
      `
    
    case 'cta':
    case 'final-cta':
      return `
        <section style="padding: 80px 24px; text-align: center; background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);">
          <h2 style="font-size: 2.5rem; font-weight: 800; color: white; margin-bottom: 16px;">${escapeHtml(content.headline || content.title || 'Ready to Get Started?')}</h2>
          <p style="font-size: 1.25rem; color: rgba(255,255,255,0.8); margin-bottom: 32px;">${escapeHtml(content.subheadline || content.subtitle || '')}</p>
          <a href="${escapeHtml(content.cta_url || content.ctaUrl || '#')}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(90deg, #8b5cf6, #06b6d4); color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">
            ${escapeHtml(content.cta_text || content.ctaText || 'Get Started')}
          </a>
        </section>
      `
    
    default:
      return ''
  }
}

function renderFullPage(page: any, consultation: any): string {
  const sections = page.sections || []
  const sectionsHtml = sections
    .filter((s: any) => s.visible !== false)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    .map(renderSection)
    .join('')

  const siteUrl = getSiteUrl()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${generateMetaTags(page)}
  ${generateSchema(page, consultation)}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.5; color: #0f172a; }
    a { transition: opacity 0.2s; }
    a:hover { opacity: 0.9; }
    @media (max-width: 768px) {
      h1 { font-size: 2rem !important; }
      h2 { font-size: 1.5rem !important; }
      section { padding: 48px 16px !important; }
    }
  </style>
</head>
<body>
  <main>
    ${sectionsHtml}
  </main>
  
  <footer style="padding: 32px 24px; background: #0f172a; text-align: center;">
    <p style="color: rgba(255,255,255,0.5); font-size: 0.875rem;">© ${new Date().getFullYear()} All rights reserved.</p>
  </footer>

  <script>
    // Track page view engagement on page leave
    var startTime = Date.now();
    var maxScroll = 0;
    
    window.addEventListener('scroll', function() {
      var scrollPercent = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
      if (scrollPercent > maxScroll) maxScroll = scrollPercent;
    });
    
    window.addEventListener('beforeunload', function() {
      var timeOnPage = Math.round((Date.now() - startTime) / 1000);
      navigator.sendBeacon('${siteUrl}/functions/v1/track-page-view', JSON.stringify({
        slug: '${page.slug}',
        time_on_page: timeOnPage,
        scroll_depth: maxScroll
      }));
    });
  </script>
</body>
</html>`
}

function renderErrorPage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(message)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f8fafc; }
    .container { text-align: center; padding: 48px; }
    h1 { font-size: 2rem; color: #0f172a; margin-bottom: 16px; }
    p { color: #64748b; margin-bottom: 24px; }
    a { display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; }
    a:hover { background: #7c3aed; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(message)}</h1>
    <p>The page you're looking for doesn't exist or hasn't been published.</p>
    <a href="/">Go Home</a>
  </div>
</body>
</html>`
}

function escapeHtml(text: string): string {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
