import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    // Normalize URL
    let normalizedUrl = url;
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    console.log('[extract-website-intelligence] Fetching:', normalizedUrl);

    // Fetch the website
    const response = await fetch(normalizedUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (compatible; PageConsultAI/1.0; +https://pageconsult.ai)',
        'Accept': 'text/html,application/xhtml+xml'
      },
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract data using regex (Deno edge functions don't have full DOM)
    const extractedData = {
      logoUrl: null as string | null,
      brandColors: [] as string[],
      title: null as string | null,
      tagline: null as string | null,
      description: null as string | null,
      heroText: null as string | null,
      testimonials: [] as string[],
      companyName: null as string | null,
      sourceUrl: normalizedUrl
    };

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      extractedData.title = titleMatch[1].trim();
      // Try to extract company name from title
      const namePart = titleMatch[1].split(/[|\-–—]/)[0].trim();
      if (namePart.length < 50) {
        extractedData.companyName = namePart;
      }
    }

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (descMatch) {
      extractedData.description = descMatch[1].trim();
    }

    // Extract theme color
    const themeMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
    if (themeMatch) {
      extractedData.brandColors.push(themeMatch[1]);
    }

    // Extract logo URL - try multiple patterns
    const logoPatterns = [
      /<img[^>]*class=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/gi,
      /<img[^>]*src=["']([^"']*logo[^"']+)["']/gi,
      /<img[^>]*alt=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/gi,
      /class=["'][^"']*logo[^"']*["'][^>]*background-image:\s*url\(["']?([^"')]+)["']?\)/gi
    ];

    for (const pattern of logoPatterns) {
      const match = pattern.exec(html);
      if (match && match[1]) {
        let logoUrl = match[1];
        // Make absolute URL if relative
        if (!logoUrl.startsWith('http')) {
          const baseUrl = new URL(normalizedUrl);
          logoUrl = new URL(logoUrl, baseUrl).href;
        }
        // Skip tiny images and data URIs
        if (!logoUrl.startsWith('data:') && !logoUrl.includes('1x1') && !logoUrl.includes('pixel')) {
          extractedData.logoUrl = logoUrl;
          break;
        }
      }
    }

    // Extract H1 as potential tagline
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      const h1Text = h1Match[1].replace(/<[^>]+>/g, '').trim();
      if (h1Text.length > 5 && h1Text.length < 200) {
        extractedData.tagline = h1Text;
      }
    }

    // Extract hero/intro text
    const heroPatterns = [
      /<(?:div|section)[^>]*class=["'][^"']*hero[^"']*["'][^>]*>[\s\S]*?<p[^>]*>([^<]+)<\/p>/i,
      /<header[^>]*>[\s\S]*?<p[^>]*>([^<]+)<\/p>/i
    ];
    
    for (const pattern of heroPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const text = match[1].trim();
        if (text.length > 20 && text.length < 500) {
          extractedData.heroText = text;
          break;
        }
      }
    }

    // Extract testimonials
    const testimonialPattern = /<(?:blockquote|div)[^>]*class=["'][^"']*(?:testimonial|review|quote)[^"']*["'][^>]*>([\s\S]*?)<\/(?:blockquote|div)>/gi;
    let testimonialMatch;
    while ((testimonialMatch = testimonialPattern.exec(html)) !== null) {
      const text = testimonialMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (text.length > 30 && text.length < 500) {
        extractedData.testimonials.push(text);
        if (extractedData.testimonials.length >= 3) break;
      }
    }

    // Extract colors from inline styles (common patterns)
    const colorPatterns = [
      /(?:background-color|color):\s*(#[0-9a-fA-F]{3,6})/g,
      /(?:background-color|color):\s*(rgb\([^)]+\))/g
    ];
    
    for (const pattern of colorPatterns) {
      let colorMatch;
      while ((colorMatch = pattern.exec(html)) !== null) {
        if (!extractedData.brandColors.includes(colorMatch[1])) {
          extractedData.brandColors.push(colorMatch[1]);
          if (extractedData.brandColors.length >= 5) break;
        }
      }
    }

    console.log('[extract-website-intelligence] Extracted data:', JSON.stringify(extractedData, null, 2));

    return new Response(JSON.stringify({
      success: true,
      data: extractedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[extract-website-intelligence] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze website';
    const origin = req.headers.get('Origin');
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 200, // Return 200 so frontend can handle gracefully
      headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' }
    });
  }
});
