import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

// Colors to filter out (whites, blacks, grays)
const EXCLUDED_COLORS = new Set([
  '#fff', '#ffffff', '#000', '#000000', 
  '#eee', '#eeeeee', '#ddd', '#dddddd', '#ccc', '#cccccc', 
  '#bbb', '#bbbbbb', '#aaa', '#aaaaaa', '#999', '#999999',
  '#888', '#888888', '#777', '#777777', '#666', '#666666',
  '#555', '#555555', '#444', '#444444', '#333', '#333333',
  '#222', '#222222', '#111', '#111111', '#f5f5f5', '#fafafa',
  '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373', '#525252',
  '#404040', '#262626', '#171717', '#0a0a0a'
]);

function isExcludedColor(color: string): boolean {
  const hex = color.toLowerCase().trim();
  if (EXCLUDED_COLORS.has(hex)) return true;
  
  // Check for short hex versions
  if (hex.length === 4) {
    const expanded = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    if (EXCLUDED_COLORS.has(expanded)) return true;
  }
  
  // Check for rgb grays
  const rgbMatch = hex.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch.map(Number);
    // If all channels are similar (gray) and very light or very dark
    if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20) {
      if (r > 200 || r < 50) return true;
    }
  }
  
  return false;
}

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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`);
    }
    
    const html = await response.text();
    const baseUrl = new URL(normalizedUrl);
    
    // Initialize extracted data
    const extractedData = {
      logoUrl: null as string | null,
      brandColors: [] as string[],
      title: null as string | null,
      tagline: null as string | null,
      description: null as string | null,
      heroText: null as string | null,
      testimonials: [] as string[],
      companyName: null as string | null,
      fonts: { heading: null as string | null, body: null as string | null },
      sourceUrl: normalizedUrl
    };

    // ============================================
    // 1. COMPANY NAME EXTRACTION (priority order)
    // ============================================
    
    // Priority 1: Open Graph site_name
    const ogSiteName = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i) 
                    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:site_name["']/i);
    if (ogSiteName) {
      extractedData.companyName = ogSiteName[1].trim();
      console.log('[extract] Company from og:site_name:', extractedData.companyName);
    }
    
    // Priority 2: JSON-LD structured data
    if (!extractedData.companyName) {
      const jsonLdMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      for (const match of jsonLdMatches) {
        try {
          const jsonLd = JSON.parse(match[1]);
          const name = jsonLd.name || jsonLd.organization?.name || jsonLd.publisher?.name || 
                      (Array.isArray(jsonLd) ? jsonLd[0]?.name : null);
          if (name && name.length < 50) {
            extractedData.companyName = name;
            console.log('[extract] Company from JSON-LD:', extractedData.companyName);
            break;
          }
        } catch (e) { /* ignore parse errors */ }
      }
    }
    
    // Priority 3: Copyright notice
    if (!extractedData.companyName) {
      const copyrightPatterns = [
        /©\s*(?:\d{4}\s*)?([A-Za-z][A-Za-z0-9\s&'.,-]+?)(?:\s*\.|\s*All|\s*-|\s*\||$)/i,
        /copyright\s*(?:©|\(c\))?\s*(?:\d{4}\s*)?([A-Za-z][A-Za-z0-9\s&'.,-]+?)(?:\s*\.|\s*All|\s*-|\s*\||$)/i
      ];
      for (const pattern of copyrightPatterns) {
        const match = html.match(pattern);
        if (match && match[1].trim().length > 2 && match[1].trim().length < 50) {
          extractedData.companyName = match[1].trim();
          console.log('[extract] Company from copyright:', extractedData.companyName);
          break;
        }
      }
    }
    
    // Priority 4: Title tag (fallback)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      extractedData.title = titleMatch[1].trim();
      if (!extractedData.companyName) {
        // Try to extract from patterns like "Company Name | Tagline" or "Page - Company Name"
        const titleParts = titleMatch[1].split(/[|\-–—:]/);
        if (titleParts.length > 1) {
          // Usually company name is the last part
          const lastPart = titleParts[titleParts.length - 1].trim();
          if (lastPart.length > 2 && lastPart.length < 50 && lastPart.toLowerCase() !== 'home') {
            extractedData.companyName = lastPart;
          }
        }
      }
    }

    // ============================================
    // 2. BRAND COLORS EXTRACTION (priority order)
    // ============================================
    const collectedColors: string[] = [];
    
    // Priority 1: Meta theme-color
    const themeColor = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i)
                    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']theme-color["']/i);
    if (themeColor && !isExcludedColor(themeColor[1])) {
      collectedColors.push(themeColor[1]);
      console.log('[extract] Color from theme-color:', themeColor[1]);
    }
    
    // Priority 2: CSS custom properties (--primary, --brand, --accent, etc.)
    const cssVarPatterns = [
      /--(?:primary|brand|main|accent|theme)(?:-color)?:\s*(#[0-9a-fA-F]{3,6})/gi,
      /--(?:primary|brand|main|accent|theme)(?:-color)?:\s*(rgb[a]?\([^)]+\))/gi,
      /--(?:color-primary|color-brand|color-accent):\s*(#[0-9a-fA-F]{3,6})/gi
    ];
    for (const pattern of cssVarPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        if (!isExcludedColor(match[1])) {
          collectedColors.push(match[1]);
          console.log('[extract] Color from CSS var:', match[1]);
        }
      }
    }
    
    // Priority 3: Button and CTA colors
    const buttonColorPatterns = [
      /\.(?:btn|button|cta)[^{]*\{[^}]*background(?:-color)?:\s*(#[0-9a-fA-F]{3,6})/gi,
      /button[^{]*\{[^}]*background(?:-color)?:\s*(#[0-9a-fA-F]{3,6})/gi
    ];
    for (const pattern of buttonColorPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        if (!isExcludedColor(match[1])) {
          collectedColors.push(match[1]);
        }
      }
    }
    
    // Priority 4: Inline styles on elements
    const inlineColorPatterns = [
      /style=["'][^"']*background(?:-color)?:\s*(#[0-9a-fA-F]{3,6})/gi,
      /style=["'][^"']*(?:^|;\s*)color:\s*(#[0-9a-fA-F]{3,6})/gi
    ];
    for (const pattern of inlineColorPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        if (!isExcludedColor(match[1])) {
          collectedColors.push(match[1]);
        }
      }
    }
    
    // Deduplicate and take top 5
    extractedData.brandColors = [...new Set(collectedColors)].slice(0, 5);
    console.log('[extract] Final colors:', extractedData.brandColors);

    // ============================================
    // 3. FONT EXTRACTION
    // ============================================
    
    // Check Google Fonts
    const googleFontsMatches = html.matchAll(/fonts\.googleapis\.com\/css2?\?[^"']*family=([^"'&]+)/gi);
    const googleFontFamilies: string[] = [];
    for (const match of googleFontsMatches) {
      const familyParam = match[1];
      // Parse multiple families (family=Roboto:wght@400&family=Open+Sans)
      const families = familyParam.split(/[&|]/).map(f => {
        const familyMatch = f.match(/(?:family=)?([^:@]+)/);
        return familyMatch ? familyMatch[1].replace(/\+/g, ' ').trim() : null;
      }).filter(Boolean);
      googleFontFamilies.push(...families as string[]);
    }
    
    if (googleFontFamilies.length > 0) {
      extractedData.fonts.heading = googleFontFamilies[0];
      extractedData.fonts.body = googleFontFamilies[1] || googleFontFamilies[0];
      console.log('[extract] Fonts from Google Fonts:', extractedData.fonts);
    }
    
    // Check @font-face declarations
    if (!extractedData.fonts.heading) {
      const fontFaceMatches = html.matchAll(/@font-face\s*\{[^}]*font-family:\s*["']?([^"';}]+)["']?/gi);
      const fontFaceFamilies: string[] = [];
      for (const match of fontFaceMatches) {
        const family = match[1].trim();
        if (family && !fontFaceFamilies.includes(family)) {
          fontFaceFamilies.push(family);
        }
      }
      if (fontFaceFamilies.length > 0) {
        extractedData.fonts.heading = fontFaceFamilies[0];
        extractedData.fonts.body = fontFaceFamilies[1] || fontFaceFamilies[0];
        console.log('[extract] Fonts from @font-face:', extractedData.fonts);
      }
    }

    // ============================================
    // 4. LOGO EXTRACTION (priority order)
    // ============================================
    
    // Priority 1: Logo in header/nav
    const headerLogoPatterns = [
      /<(?:header|nav)[^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["'][^>]*(?:class|alt)=["'][^"']*logo/i,
      /<(?:header|nav)[^>]*>[\s\S]*?<img[^>]*(?:class|alt)=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
      /<(?:header|nav)[^>]*>[\s\S]*?<img[^>]*src=["']([^"']*logo[^"']*)["']/i
    ];
    
    for (const pattern of headerLogoPatterns) {
      const match = html.match(pattern);
      if (match && match[1] && !match[1].startsWith('data:')) {
        extractedData.logoUrl = match[1];
        console.log('[extract] Logo from header:', extractedData.logoUrl);
        break;
      }
    }
    
    // Priority 2: Any img with "logo" in class, alt, or filename
    if (!extractedData.logoUrl) {
      const logoImgPatterns = [
        /<img[^>]*class=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
        /<img[^>]*src=["']([^"']+)["'][^>]*class=["'][^"']*logo[^"']*["']/i,
        /<img[^>]*alt=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
        /<img[^>]*src=["']([^"']*logo[^"']*)["']/i
      ];
      
      for (const pattern of logoImgPatterns) {
        const match = html.match(pattern);
        if (match && match[1] && !match[1].startsWith('data:') && !match[1].includes('1x1') && !match[1].includes('pixel')) {
          extractedData.logoUrl = match[1];
          console.log('[extract] Logo from img:', extractedData.logoUrl);
          break;
        }
      }
    }
    
    // Priority 3: Apple touch icon
    if (!extractedData.logoUrl) {
      const appleTouchIcon = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i)
                          || html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']apple-touch-icon["']/i);
      if (appleTouchIcon) {
        extractedData.logoUrl = appleTouchIcon[1];
        console.log('[extract] Logo from apple-touch-icon:', extractedData.logoUrl);
      }
    }
    
    // Priority 4: og:image (last resort)
    if (!extractedData.logoUrl) {
      const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
                   || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
      if (ogImage) {
        extractedData.logoUrl = ogImage[1];
        console.log('[extract] Logo from og:image:', extractedData.logoUrl);
      }
    }
    
    // Make logo URL absolute
    if (extractedData.logoUrl && !extractedData.logoUrl.startsWith('http')) {
      extractedData.logoUrl = new URL(extractedData.logoUrl, baseUrl).href;
    }

    // ============================================
    // 5. TAGLINE & DESCRIPTION
    // ============================================
    
    // Meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
                   || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    if (descMatch) {
      extractedData.description = descMatch[1].trim();
    }
    
    // H1 as tagline
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      const h1Text = h1Match[1].replace(/<[^>]+>/g, '').trim();
      if (h1Text.length > 5 && h1Text.length < 200) {
        extractedData.tagline = h1Text;
      }
    }
    
    // Hero text
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

    // ============================================
    // 6. TESTIMONIALS
    // ============================================
    const testimonialPattern = /<(?:blockquote|div)[^>]*class=["'][^"']*(?:testimonial|review|quote)[^"']*["'][^>]*>([\s\S]*?)<\/(?:blockquote|div)>/gi;
    let testimonialMatch;
    while ((testimonialMatch = testimonialPattern.exec(html)) !== null) {
      const text = testimonialMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (text.length > 30 && text.length < 500) {
        extractedData.testimonials.push(text);
        if (extractedData.testimonials.length >= 3) break;
      }
    }

    console.log('[extract-website-intelligence] Final extracted data:', JSON.stringify(extractedData, null, 2));

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
