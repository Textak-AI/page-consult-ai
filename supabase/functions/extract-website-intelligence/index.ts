import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

// ============================================
// COLOR UTILITY FUNCTIONS
// ============================================

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Normalize hex
  let normalized = hex.replace('#', '').toUpperCase();
  if (normalized.length === 3) {
    normalized = normalized[0] + normalized[0] + normalized[1] + normalized[1] + normalized[2] + normalized[2];
  }
  if (normalized.length !== 6) return null;
  
  const result = /^([A-F\d]{2})([A-F\d]{2})([A-F\d]{2})$/i.exec(normalized);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

// Normalize any color string to uppercase hex
function normalizeColor(color: string): string | null {
  const trimmed = color.trim().toLowerCase();
  
  // Handle rgb/rgba
  const rgbMatch = trimmed.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return rgbToHex(parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3]));
  }
  
  // Handle hex
  if (trimmed.startsWith('#')) {
    let hex = trimmed.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length === 6 && /^[0-9a-f]{6}$/.test(hex)) {
      return '#' + hex.toUpperCase();
    }
  }
  
  return null;
}

// Check if color is near white
function isNearWhite(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  return rgb.r > 240 && rgb.g > 240 && rgb.b > 240;
}

// Check if color is near black
function isNearBlack(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  return rgb.r < 30 && rgb.g < 30 && rgb.b < 30;
}

// Check if color is a gray (low saturation)
function isGray(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const diff = Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b);
  return diff < 25;
}

// Check if a color should be excluded (white, black, or gray)
function isExcludedColor(color: string): boolean {
  const normalized = normalizeColor(color);
  if (!normalized) return true;
  
  if (isNearWhite(normalized)) return true;
  if (isNearBlack(normalized)) return true;
  if (isGray(normalized)) return true;
  
  return false;
}

// Calculate color vibrancy (higher = more vibrant/saturated)
function getColorVibrancy(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const delta = max - min;
  // Simple saturation approximation
  if (max === 0) return 0;
  return delta / max;
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

    // Fetch the website with browser-like headers to avoid 403 blocks
    const response = await fetch(normalizedUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      },
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`);
    }
    
    const html = await response.text();
    const baseUrl = new URL(normalizedUrl);
    
    // Initialize extracted data with enhanced structure
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
      pageCopy: null as string | null,
      sourceUrl: normalizedUrl,
      isMinimalBrand: false,
      extractionConfidence: 'low' as 'high' | 'medium' | 'low',
      allExtractedColors: [] as string[], // Track colors before filtering
      // NEW: Enhanced color structure
      colorsBySource: {
        themeColor: [] as string[],
        cssVars: [] as string[],
        buttons: [] as string[],
        inlineStyles: [] as string[],
        styleTags: [] as string[],
      },
      // NEW: Enhanced font structure  
      extractedFonts: { heading: 'Inter', body: 'Inter' },
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
    // 2. BRAND COLORS EXTRACTION (enhanced with source tracking)
    // ============================================
    const collectedColors: Array<{ color: string; source: string; priority: number }> = [];
    const allExtractedColors: string[] = [];
    
    // Helper to add color with source tracking
    const addColor = (rawColor: string, source: string, priority: number) => {
      const normalized = normalizeColor(rawColor);
      if (!normalized) return;
      
      allExtractedColors.push(normalized);
      
      // Track by source
      if (source === 'themeColor') extractedData.colorsBySource.themeColor.push(normalized);
      else if (source === 'cssVar') extractedData.colorsBySource.cssVars.push(normalized);
      else if (source === 'button') extractedData.colorsBySource.buttons.push(normalized);
      else if (source === 'inline') extractedData.colorsBySource.inlineStyles.push(normalized);
      else if (source === 'styleTag') extractedData.colorsBySource.styleTags.push(normalized);
      
      if (!isExcludedColor(normalized)) {
        collectedColors.push({ color: normalized, source, priority });
        console.log(`[extract] Color from ${source}:`, normalized);
      }
    };
    
    // Priority 1: Meta theme-color (highest priority - explicit brand intent)
    const themeColorMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i)
                    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']theme-color["']/i);
    if (themeColorMatch) {
      addColor(themeColorMatch[1], 'themeColor', 1);
    }
    
    // Priority 2: CSS custom properties (--primary, --brand, --accent, etc.)
    const cssVarPatterns = [
      /--(?:primary|brand|main|accent|theme)(?:[-_]?color)?:\s*(#[0-9a-fA-F]{3,8})/gi,
      /--(?:primary|brand|main|accent|theme)(?:[-_]?color)?:\s*(rgb[a]?\([^)]+\))/gi,
      /--(?:color[-_]?(?:primary|brand|accent|main)|(?:primary|brand|accent|main)[-_]color):\s*(#[0-9a-fA-F]{3,8})/gi,
      /--(?:bg|background)[-_]?(?:primary|brand|accent):\s*(#[0-9a-fA-F]{3,8})/gi,
      /--(?:btn|button)[-_]?(?:primary|bg|background):\s*(#[0-9a-fA-F]{3,8})/gi,
    ];
    for (const pattern of cssVarPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        addColor(match[1], 'cssVar', 2);
      }
    }
    
    // Priority 3: Button/CTA inline styles (almost always brand colors!)
    const buttonInlinePatterns = [
      // Buttons with inline background
      /<(?:button|a)[^>]*class=["'][^"']*(?:btn|button|cta|primary)[^"']*["'][^>]*style=["'][^"']*background(?:-color)?:\s*([^;"']+)/gi,
      /<(?:button|a)[^>]*style=["'][^"']*background(?:-color)?:\s*([^;"']+)[^"']*["'][^>]*class=["'][^"']*(?:btn|button|cta|primary)/gi,
      // Any element with CTA-like classes and background
      /<[^>]*class=["'][^"']*(?:cta|call-to-action|hero-btn|main-btn|action-btn)[^"']*["'][^>]*style=["'][^"']*background(?:-color)?:\s*([^;"']+)/gi,
    ];
    for (const pattern of buttonInlinePatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        addColor(match[1], 'button', 3);
      }
    }
    
    // Priority 4: Style tags - button/CTA class definitions
    const styleTagMatches = html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    for (const styleMatch of styleTagMatches) {
      const cssContent = styleMatch[1];
      
      // Button/CTA background colors
      const buttonCssPatterns = [
        /\.(?:btn|button|cta|primary-btn|main-btn|action-btn)[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/gi,
        /button(?:\.[^\s{]+)?[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/gi,
        /a\.(?:btn|button|cta)[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/gi,
        // Hero section colors
        /\.hero[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/gi,
        // Primary/accent colors
        /\.(?:primary|accent|brand)[^{]*\{[^}]*(?:background(?:-color)?|color):\s*([^;}]+)/gi,
      ];
      
      for (const pattern of buttonCssPatterns) {
        const matches = cssContent.matchAll(pattern);
        for (const match of matches) {
          addColor(match[1], 'styleTag', 4);
        }
      }
    }
    
    // Priority 5: General inline styles (lower priority)
    const inlineColorPatterns = [
      /style=["'][^"']*background(?:-color)?:\s*(#[0-9a-fA-F]{3,8})/gi,
      /style=["'][^"']*background(?:-color)?:\s*(rgb[a]?\([^)]+\))/gi,
    ];
    for (const pattern of inlineColorPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        addColor(match[1], 'inline', 5);
      }
    }
    
    // Sort by priority and vibrancy, deduplicate
    const sortedColors = collectedColors
      .sort((a, b) => {
        // First by priority
        if (a.priority !== b.priority) return a.priority - b.priority;
        // Then by vibrancy (more vibrant = better brand color)
        return getColorVibrancy(b.color) - getColorVibrancy(a.color);
      });
    
    // Deduplicate while preserving priority order
    const seenColors = new Set<string>();
    const uniqueColors: string[] = [];
    for (const item of sortedColors) {
      if (!seenColors.has(item.color)) {
        seenColors.add(item.color);
        uniqueColors.push(item.color);
        if (uniqueColors.length >= 5) break;
      }
    }
    
    const uniqueAllColors = [...new Set(allExtractedColors)].slice(0, 10);
    
    // Detect minimal/monochromatic brand
    if (uniqueAllColors.length > 0 && uniqueColors.length === 0) {
      extractedData.isMinimalBrand = true;
      extractedData.brandColors = uniqueAllColors.slice(0, 3);
      extractedData.extractionConfidence = 'medium';
      console.log('[extract] Minimal brand detected, using monochromatic colors:', extractedData.brandColors);
    } else {
      extractedData.brandColors = uniqueColors;
      // Confidence based on source quality
      const hasHighQualitySource = collectedColors.some(c => c.priority <= 3);
      extractedData.extractionConfidence = hasHighQualitySource ? 'high' : (uniqueColors.length > 0 ? 'medium' : 'low');
    }
    
    extractedData.allExtractedColors = uniqueAllColors;
    console.log('[extract] Final colors:', extractedData.brandColors, 'isMinimalBrand:', extractedData.isMinimalBrand, 'confidence:', extractedData.extractionConfidence);

    // ============================================
    // 3. FONT EXTRACTION (enhanced)
    // ============================================
    const detectedFonts = {
      fromGoogleFonts: [] as string[],
      fromFontFace: [] as string[],
      fromHeadings: [] as string[],
      fromBody: [] as string[],
    };
    
    // Source 1: Google Fonts (highest priority - explicit choice)
    const googleFontsMatches = html.matchAll(/fonts\.googleapis\.com\/css2?\?[^"']*family=([^"']+)/gi);
    for (const match of googleFontsMatches) {
      const familyParam = decodeURIComponent(match[1]);
      // Parse multiple families (family=Roboto:wght@400&family=Open+Sans)
      const families = familyParam.split(/[&|]/).map(f => {
        const familyMatch = f.match(/(?:family=)?([^:@]+)/);
        if (familyMatch) {
          // Clean up: "Roboto%3A100%2C200" -> "Roboto"
          return familyMatch[1].replace(/\+/g, ' ').replace(/%[0-9A-F]{2}/gi, '').split(',')[0].trim();
        }
        return null;
      }).filter(Boolean) as string[];
      detectedFonts.fromGoogleFonts.push(...families);
    }
    
    // Source 2: @font-face declarations
    const fontFaceMatches = html.matchAll(/@font-face\s*\{[^}]*font-family:\s*["']?([^"';}]+)["']?/gi);
    for (const match of fontFaceMatches) {
      const family = match[1].trim();
      if (family && !detectedFonts.fromFontFace.includes(family)) {
        detectedFonts.fromFontFace.push(family);
      }
    }
    
    // Source 3: Heading styles (h1, h2)
    const headingFontPatterns = [
      /h[12][^{]*\{[^}]*font-family:\s*["']?([^"';}]+)/gi,
      /\.(?:heading|title|hero-title)[^{]*\{[^}]*font-family:\s*["']?([^"';}]+)/gi,
    ];
    for (const pattern of headingFontPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        const fontStack = match[1].split(',')[0].trim().replace(/["']/g, '');
        if (fontStack && !detectedFonts.fromHeadings.includes(fontStack)) {
          detectedFonts.fromHeadings.push(fontStack);
        }
      }
    }
    
    // Source 4: Body styles
    const bodyFontPatterns = [
      /body[^{]*\{[^}]*font-family:\s*["']?([^"';}]+)/gi,
      /html[^{]*\{[^}]*font-family:\s*["']?([^"';}]+)/gi,
      /\.(?:body|content|text)[^{]*\{[^}]*font-family:\s*["']?([^"';}]+)/gi,
      /p[^{]*\{[^}]*font-family:\s*["']?([^"';}]+)/gi,
    ];
    for (const pattern of bodyFontPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        const fontStack = match[1].split(',')[0].trim().replace(/["']/g, '');
        if (fontStack && !detectedFonts.fromBody.includes(fontStack)) {
          detectedFonts.fromBody.push(fontStack);
        }
      }
    }
    
    // Determine best heading font (priority: Google > headings CSS > font-face)
    const headingFont = detectedFonts.fromGoogleFonts[0] 
      || detectedFonts.fromHeadings[0] 
      || detectedFonts.fromFontFace[0] 
      || 'Inter';
    
    // Determine best body font (priority: Google[1] > body CSS > Google[0] > font-face)  
    const bodyFont = detectedFonts.fromGoogleFonts[1] 
      || detectedFonts.fromBody[0] 
      || detectedFonts.fromGoogleFonts[0] 
      || detectedFonts.fromFontFace[1] 
      || headingFont;
    
    // Set both legacy and new font structures
    extractedData.fonts.heading = headingFont;
    extractedData.fonts.body = bodyFont;
    extractedData.extractedFonts = { heading: headingFont, body: bodyFont };
    
    console.log('[extract] Fonts detected:', { 
      heading: headingFont, 
      body: bodyFont,
      sources: {
        googleFonts: detectedFonts.fromGoogleFonts.length,
        fontFace: detectedFonts.fromFontFace.length,
        headingCSS: detectedFonts.fromHeadings.length,
        bodyCSS: detectedFonts.fromBody.length,
      }
    });

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

    // ============================================
    // 7. PAGE COPY EXTRACTION (for communication style analysis)
    // ============================================
    const extractPageCopy = (htmlContent: string): string => {
      // Remove script, style, and other non-content elements
      let cleaned = htmlContent
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
        .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
      
      const textParts: string[] = [];
      
      // Get meta descriptions first
      const metaDescMatch = htmlContent.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const ogDescMatch = htmlContent.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
      if (metaDescMatch) textParts.push(metaDescMatch[1]);
      if (ogDescMatch && ogDescMatch[1] !== metaDescMatch?.[1]) textParts.push(ogDescMatch[1]);
      
      // Extract text from main content areas
      const copySelectors = [
        /<main[^>]*>([\s\S]*?)<\/main>/gi,
        /<article[^>]*>([\s\S]*?)<\/article>/gi,
        /<section[^>]*>([\s\S]*?)<\/section>/gi,
        /<(?:div)[^>]*class=["'][^"']*(?:hero|content|about|services)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
      ];
      
      // Extract headings
      const headingMatches = cleaned.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi);
      for (const match of headingMatches) {
        const text = match[1].replace(/<[^>]+>/g, '').trim();
        if (text.length > 5 && text.length < 200 && !textParts.includes(text)) {
          textParts.push(text);
        }
      }
      
      // Extract paragraphs
      const paragraphMatches = cleaned.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
      for (const match of paragraphMatches) {
        const text = match[1].replace(/<[^>]+>/g, '').trim();
        if (text.length > 20 && text.length < 500 && !textParts.includes(text)) {
          textParts.push(text);
        }
      }
      
      // Extract list items
      const listMatches = cleaned.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi);
      for (const match of listMatches) {
        const text = match[1].replace(/<[^>]+>/g, '').trim();
        if (text.length > 10 && text.length < 300 && !textParts.includes(text)) {
          textParts.push(text);
        }
      }
      
      return textParts.slice(0, 50).join('\n\n');
    };
    
    extractedData.pageCopy = extractPageCopy(html);
    console.log('[extract-website-intelligence] Page copy length:', extractedData.pageCopy?.length || 0);

    // ============================================
    // 8. INFER INDUSTRY FROM PAGE CONTENT
    // ============================================
    const inferIndustry = (pageCopy: string, description: string | null, heroText: string | null): string | null => {
      const content = `${pageCopy} ${description || ''} ${heroText || ''}`.toLowerCase();
      
      // Industry keyword patterns (more specific = higher priority)
      const industryPatterns: [RegExp, string][] = [
        // Industrial/Commercial services
        [/\b(water treatment|water purification|industrial water|wastewater)\b/i, 'Industrial Water Treatment'],
        [/\b(commercial cleaning|janitorial|facility cleaning)\b/i, 'Commercial Cleaning Services'],
        [/\b(hvac|heating.*cooling|air conditioning|climate control)\b/i, 'HVAC Services'],
        [/\b(electrical contractor|commercial electrical|industrial electrical)\b/i, 'Electrical Contracting'],
        [/\b(plumbing contractor|commercial plumbing|industrial plumbing)\b/i, 'Commercial Plumbing'],
        [/\b(roofing|roof.*contractor|commercial roof)\b/i, 'Commercial Roofing'],
        [/\b(landscaping|lawn care|grounds.*maintenance)\b/i, 'Commercial Landscaping'],
        [/\b(construction|general contractor|building contractor)\b/i, 'Construction'],
        [/\b(manufacturing|production|industrial manufacturing)\b/i, 'Manufacturing'],
        
        // Professional services
        [/\b(law firm|attorney|legal services|lawyer)\b/i, 'Legal Services'],
        [/\b(accounting|cpa|bookkeeping|tax.*service)\b/i, 'Accounting & Finance'],
        [/\b(consulting|consultant|advisory|strategic advisor)\b/i, 'Consulting'],
        [/\b(marketing agency|digital marketing|advertising agency)\b/i, 'Marketing & Advertising'],
        [/\b(web.*design|website.*development|digital agency)\b/i, 'Web Development & Design'],
        [/\b(it.*services|managed.*services|technology.*solutions)\b/i, 'IT Services'],
        [/\b(cybersecurity|security.*services|information security)\b/i, 'Cybersecurity'],
        [/\b(hr.*consulting|human resources|talent.*management)\b/i, 'HR Consulting'],
        [/\b(real estate|property.*management|commercial.*real)\b/i, 'Real Estate'],
        
        // Healthcare/Medical
        [/\b(healthcare|medical.*practice|clinic|hospital)\b/i, 'Healthcare'],
        [/\b(dental|dentist|orthodont)\b/i, 'Dental Services'],
        [/\b(wellness|fitness|gym|personal training)\b/i, 'Health & Wellness'],
        
        // SaaS/Tech
        [/\b(saas|software.*as.*service|cloud.*platform)\b/i, 'SaaS'],
        [/\b(platform|app|application|software)\b/i, 'Software/Tech'],
        [/\b(fintech|financial.*technology)\b/i, 'FinTech'],
        
        // E-commerce/Retail
        [/\b(e-?commerce|online.*store|shop)\b/i, 'E-commerce'],
        [/\b(retail|store|boutique)\b/i, 'Retail'],
        
        // Other services
        [/\b(insurance|insurance.*agency)\b/i, 'Insurance'],
        [/\b(financial.*advisor|wealth.*management|investment)\b/i, 'Financial Services'],
        [/\b(education|training|learning|academy)\b/i, 'Education & Training'],
        [/\b(restaurant|catering|food.*service)\b/i, 'Food & Hospitality'],
        [/\b(photography|videography|creative.*studio)\b/i, 'Creative Services'],
      ];
      
      for (const [pattern, industry] of industryPatterns) {
        if (pattern.test(content)) {
          console.log('[extract] Inferred industry:', industry);
          return industry;
        }
      }
      
      return null;
    };
    
    const inferredIndustry = inferIndustry(extractedData.pageCopy || '', extractedData.description, extractedData.heroText);

    console.log('[extract-website-intelligence] Final extracted data:', {
      companyName: extractedData.companyName,
      inferredIndustry,
      hasLogo: !!extractedData.logoUrl,
      colorCount: extractedData.brandColors.length,
      isMinimalBrand: extractedData.isMinimalBrand,
    });

    // Build enhanced response with backward compatibility
    const responseData = {
      success: true,
      // ===== BACKWARD COMPATIBLE FIELDS (keep exactly as before) =====
      companyName: extractedData.companyName,
      logoUrl: extractedData.logoUrl,
      brandColors: extractedData.brandColors,
      fonts: extractedData.fonts, // { heading: string, body: string }
      title: extractedData.title,
      tagline: extractedData.tagline,
      description: extractedData.description,
      heroText: extractedData.heroText,
      testimonials: extractedData.testimonials,
      pageCopy: extractedData.pageCopy?.slice(0, 1000),
      sourceUrl: extractedData.sourceUrl,
      isMinimalBrand: extractedData.isMinimalBrand,
      extractionConfidence: extractedData.extractionConfidence,
      inferredIndustry,
      
      // ===== NEW ENHANCED FIELDS =====
      // Primary/secondary/accent from brandColors for easy access
      primary: extractedData.brandColors[0] || null,
      secondary: extractedData.brandColors[1] || null,
      accent: extractedData.brandColors[2] || null,
      
      // Extended color arrays
      secondaryColors: extractedData.brandColors.slice(1, 3),
      accentColors: extractedData.brandColors.slice(2, 5),
      allColors: extractedData.allExtractedColors,
      
      // Color sources for debugging/transparency
      colorsBySource: extractedData.colorsBySource,
      
      // Enhanced font structure
      extractedFonts: extractedData.extractedFonts,
    };
    
    console.log('[extract-website-intelligence] Response:', {
      companyName: responseData.companyName,
      primary: responseData.primary,
      secondary: responseData.secondary,
      accent: responseData.accent,
      fonts: responseData.extractedFonts,
      confidence: responseData.extractionConfidence,
    });

    return new Response(JSON.stringify(responseData), {
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
