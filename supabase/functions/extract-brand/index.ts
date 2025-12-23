import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrandData {
  companyName: string | null;
  faviconUrl: string | null;
  description: string | null;
  tagline: string | null;
  themeColor: string | null;
  ogImage: string | null;
  domain: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    // Normalize URL
    let normalizedUrl = url.trim().toLowerCase();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    console.log(`Extracting brand from: ${normalizedUrl}`);

    // Fetch with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PageConsultBot/1.0)',
        'Accept': 'text/html',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Site returned ${response.status}`);
    }

    const html = await response.text();
    const baseUrl = new URL(normalizedUrl);
    
    const brand: BrandData = {
      companyName: null,
      faviconUrl: null,
      description: null,
      tagline: null,
      themeColor: null,
      ogImage: null,
      domain: baseUrl.hostname.replace('www.', ''),
    };

    // Extract company name (very reliable)
    brand.companyName = extractCompanyName(html, baseUrl);

    // Extract favicon (very reliable)
    brand.faviconUrl = extractFavicon(html, baseUrl);

    // Extract description (very reliable)
    brand.description = extractMeta(html, 'description');
    
    // Extract OG description as tagline if shorter
    const ogDesc = extractMeta(html, 'og:description');
    if (ogDesc && (!brand.description || ogDesc.length < brand.description.length)) {
      brand.tagline = ogDesc;
    }

    // Extract theme color (moderately reliable)
    brand.themeColor = extractMeta(html, 'theme-color');

    // Extract OG image (moderately reliable)
    brand.ogImage = extractOgImage(html, baseUrl);

    console.log('Extracted brand:', JSON.stringify(brand, null, 2));

    return new Response(
      JSON.stringify({ success: true, brand }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Brand extraction error:', error);
    const err = error as { name?: string; message?: string };
    const message = err.name === 'AbortError' 
      ? 'Site took too long to respond'
      : err.message || 'Failed to extract brand';
      
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractCompanyName(html: string, baseUrl: URL): string | null {
  // 1. OG site_name (most reliable)
  const ogSiteName = extractMeta(html, 'og:site_name');
  if (ogSiteName && ogSiteName.length < 50) return ogSiteName;

  // 2. Title tag (clean it up)
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    const title = titleMatch[1]
      .split(/[|\-–—:]/)[0]
      .replace(/home|homepage|welcome/gi, '')
      .trim();
    if (title.length > 0 && title.length < 50) return title;
  }

  // 3. Domain name as fallback
  const domain = baseUrl.hostname.replace('www.', '').split('.')[0];
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

function extractFavicon(html: string, baseUrl: URL): string {
  // Check for explicit favicon links
  const patterns = [
    /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i,
    /<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return resolveUrl(match[1], baseUrl);
    }
  }

  // Default favicon location
  return `${baseUrl.origin}/favicon.ico`;
}

function extractMeta(html: string, name: string): string | null {
  // Handle both name="" and property="" attributes
  const patterns = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return decodeHtmlEntities(match[1].trim());
    }
  }

  return null;
}

function extractOgImage(html: string, baseUrl: URL): string | null {
  const ogImage = extractMeta(html, 'og:image');
  if (ogImage) {
    return resolveUrl(ogImage, baseUrl);
  }
  return null;
}

function resolveUrl(url: string, baseUrl: URL): string {
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${baseUrl.origin}${url}`;
  return `${baseUrl.origin}/${url}`;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}
