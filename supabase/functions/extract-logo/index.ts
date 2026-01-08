import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

const MAX_URL_LENGTH = 500;

function sanitizeUrl(input: string): string {
  if (typeof input !== 'string') return '';
  let url = input.trim().slice(0, MAX_URL_LENGTH);
  
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  return url;
}

async function extractLogoFromHtml(html: string, baseUrl: string): Promise<string | null> {
  const patterns = [
    // Meta og:image
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    // Logo in common patterns
    /<img[^>]*class=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
    /<img[^>]*id=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
    /<img[^>]*alt=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
    // Link rel="icon"
    /<link[^>]*rel=["']icon["'][^>]*href=["']([^"']+)["']/i,
    /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i,
    // SVG logo patterns
    /<img[^>]*src=["']([^"']+logo[^"']*\.(?:svg|png|jpg|webp))["']/i,
    // Header area images
    /<header[^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["']/i,
    // Nav area images
    /<nav[^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      let logoUrl = match[1];
      
      // Skip data URLs
      if (logoUrl.startsWith('data:')) continue;
      
      // Make absolute URL
      if (logoUrl.startsWith('//')) {
        logoUrl = 'https:' + logoUrl;
      } else if (logoUrl.startsWith('/')) {
        try {
          const base = new URL(baseUrl);
          logoUrl = `${base.protocol}//${base.host}${logoUrl}`;
        } catch {
          continue;
        }
      } else if (!logoUrl.startsWith('http')) {
        try {
          const base = new URL(baseUrl);
          logoUrl = `${base.protocol}//${base.host}/${logoUrl}`;
        } catch {
          continue;
        }
      }
      
      return logoUrl;
    }
  }

  return null;
}

serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitizedUrl = sanitizeUrl(url);
    
    try {
      new URL(sanitizedUrl);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🖼️ [Logo] Extracting logo from: ${sanitizedUrl}`);

    // Fetch the webpage
    const response = await fetch(sanitizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PageConsult/1.0; +https://pageconsult.ai)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      console.warn(`Failed to fetch page: ${response.status}`);
      // Try favicon fallback
      try {
        const faviconUrl = new URL('/favicon.ico', sanitizedUrl).toString();
        const faviconResponse = await fetch(faviconUrl, { method: 'HEAD' });
        if (faviconResponse.ok) {
          return new Response(
            JSON.stringify({ success: true, logoUrl: faviconUrl, source: 'favicon' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch {}
      
      return new Response(
        JSON.stringify({ success: false, error: 'Could not fetch website' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    const logoUrl = await extractLogoFromHtml(html, sanitizedUrl);

    if (logoUrl) {
      console.log(`✅ [Logo] Found logo: ${logoUrl}`);
      return new Response(
        JSON.stringify({ success: true, logoUrl, source: 'html' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try favicon fallback
    try {
      const faviconUrl = new URL('/favicon.ico', sanitizedUrl).toString();
      const faviconResponse = await fetch(faviconUrl, { method: 'HEAD' });
      if (faviconResponse.ok) {
        console.log(`✅ [Logo] Using favicon: ${faviconUrl}`);
        return new Response(
          JSON.stringify({ success: true, logoUrl: faviconUrl, source: 'favicon' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch {}

    console.log(`⚠️ [Logo] No logo found for: ${sanitizedUrl}`);
    return new Response(
      JSON.stringify({ success: false, error: 'No logo found', logoUrl: null }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-logo:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to extract logo' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
