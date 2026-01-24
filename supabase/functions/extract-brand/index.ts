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
    if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20) {
      if (r > 200 || r < 50) return true;
    }
  }
  
  return false;
}

interface BrandData {
  companyName: string | null;
  faviconUrl: string | null;
  logoUrl: string | null;
  description: string | null;
  tagline: string | null;
  themeColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  ogImage: string | null;
  domain: string;
  fonts: { heading: string | null; body: string | null };
  isMinimalBrand: boolean;
  extractionConfidence: 'high' | 'medium' | 'low';
}

interface ColorExtractionResult {
  colors: string[];
  isMinimalBrand: boolean;
  allExtracted: string[]; // Colors before filtering
}

serve(async (req) => {
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
    let normalizedUrl = url.trim().toLowerCase();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    console.log(`[Brand Extraction] Starting extraction from: ${normalizedUrl}`);

    // Fetch with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
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
      logoUrl: null,
      description: null,
      tagline: null,
      themeColor: null,
      secondaryColor: null,
      accentColor: null,
      ogImage: null,
      domain: baseUrl.hostname.replace('www.', ''),
      fonts: { heading: null, body: null },
      isMinimalBrand: false,
      extractionConfidence: 'low',
    };

    // Extract company name
    brand.companyName = extractCompanyName(html, baseUrl);
    console.log('[Brand Extraction] Company name:', brand.companyName);

    // Extract favicon
    brand.faviconUrl = extractFavicon(html, baseUrl);
    
    // Extract logo
    brand.logoUrl = extractLogo(html, baseUrl);
    console.log('[Brand Extraction] Logo:', brand.logoUrl);

    // Extract description
    brand.description = extractMeta(html, 'description');
    
    // Extract OG description as tagline
    const ogDesc = extractMeta(html, 'og:description');
    if (ogDesc && (!brand.description || ogDesc.length < brand.description.length)) {
      brand.tagline = ogDesc;
    }

    // Extract colors (priority order) - with minimal brand detection
    const colorResult = extractColors(html);
    console.log('[Brand Extraction] Colors extracted:', colorResult);
    
    brand.isMinimalBrand = colorResult.isMinimalBrand;
    
    if (colorResult.colors.length > 0) {
      brand.themeColor = colorResult.colors[0];
      brand.secondaryColor = colorResult.colors[1] || null;
      brand.accentColor = colorResult.colors[2] || null;
      brand.extractionConfidence = 'high';
    } else if (colorResult.isMinimalBrand && colorResult.allExtracted.length > 0) {
      // Minimal brand - use their actual monochromatic colors
      brand.themeColor = colorResult.allExtracted[0];
      brand.secondaryColor = colorResult.allExtracted[1] || lightenColor(colorResult.allExtracted[0], 30);
      brand.accentColor = null; // Let UI suggest an accent
      brand.extractionConfidence = 'medium';
      console.log('[Brand Extraction] Minimal brand detected, using monochromatic colors');
    } else {
      // Fallback to meta theme-color
      brand.themeColor = extractMeta(html, 'theme-color');
      brand.extractionConfidence = brand.themeColor ? 'medium' : 'low';
    }

    // Extract fonts
    brand.fonts = extractFonts(html);
    console.log('[Brand Extraction] Fonts:', brand.fonts);

    // Extract OG image
    brand.ogImage = extractOgImage(html, baseUrl);

    console.log('[Brand Extraction] Final result:', {
      logo: brand.logoUrl || brand.faviconUrl,
      name: brand.companyName,
      colors: [brand.themeColor, brand.secondaryColor, brand.accentColor].filter(Boolean),
      fonts: brand.fonts
    });

    return new Response(
      JSON.stringify({ success: true, brand }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[Brand Extraction] Error:', error);
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

function extractColors(html: string): ColorExtractionResult {
  const collectedColors: string[] = [];
  const allExtractedColors: string[] = []; // Track ALL colors before filtering
  
  // Priority 1: Meta theme-color (including black/white for minimal brands)
  const themeColorPatterns = [
    /<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']theme-color["']/i,
  ];
  for (const pattern of themeColorPatterns) {
    const match = html.match(pattern);
    if (match) {
      allExtractedColors.push(match[1]);
      if (!isExcludedColor(match[1])) {
        collectedColors.push(match[1]);
      }
      break;
    }
  }
  
  // Priority 2: CSS custom properties
  const cssVarPatterns = [
    /--(?:primary|brand|main|accent|theme)(?:-color)?:\s*(#[0-9a-fA-F]{3,6})/gi,
    /--(?:color-primary|color-brand|color-accent):\s*(#[0-9a-fA-F]{3,6})/gi,
  ];
  for (const pattern of cssVarPatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      allExtractedColors.push(match[1]);
      if (!isExcludedColor(match[1]) && !collectedColors.includes(match[1].toLowerCase())) {
        collectedColors.push(match[1]);
      }
    }
  }
  
  // Priority 3: Button/CTA background colors
  const buttonPatterns = [
    /\.(?:btn|button|cta)[^{]*\{[^}]*background(?:-color)?:\s*(#[0-9a-fA-F]{3,6})/gi,
    /button[^{]*\{[^}]*background(?:-color)?:\s*(#[0-9a-fA-F]{3,6})/gi,
  ];
  for (const pattern of buttonPatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      allExtractedColors.push(match[1]);
      if (!isExcludedColor(match[1]) && !collectedColors.includes(match[1].toLowerCase())) {
        collectedColors.push(match[1]);
      }
    }
  }
  
  // Priority 4: Inline styles
  const inlinePatterns = [
    /style=["'][^"']*background(?:-color)?:\s*(#[0-9a-fA-F]{3,6})/gi,
    /style=["'][^"']*(?:^|;\s*)color:\s*(#[0-9a-fA-F]{3,6})/gi,
  ];
  for (const pattern of inlinePatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      allExtractedColors.push(match[1]);
      if (!isExcludedColor(match[1]) && !collectedColors.includes(match[1].toLowerCase())) {
        collectedColors.push(match[1]);
      }
    }
  }

  // Priority 5: Look for common brand color patterns in any CSS
  const genericColorPatterns = [
    /:\s*(#[0-9a-fA-F]{6})\s*[;}]/g,
  ];
  for (const pattern of genericColorPatterns) {
    const matches = html.matchAll(pattern);
    const colorCounts: Record<string, number> = {};
    for (const match of matches) {
      const color = match[1].toLowerCase();
      allExtractedColors.push(color);
      if (!isExcludedColor(color)) {
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      }
    }
    // Get most frequent colors not already collected
    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .filter(([color]) => !collectedColors.includes(color))
      .slice(0, 3);
    
    for (const [color] of sortedColors) {
      if (collectedColors.length < 5) {
        collectedColors.push(color);
      }
    }
  }
  
  // Detect minimal/monochromatic brand
  const uniqueAll = [...new Set(allExtractedColors.map(c => c.toLowerCase()))];
  const uniqueVibrant = [...new Set(collectedColors)].slice(0, 5);
  
  // A minimal brand has colors extracted, but they're all black/white/gray
  const isMinimalBrand = uniqueAll.length > 0 && uniqueVibrant.length === 0;
  
  return {
    colors: uniqueVibrant,
    isMinimalBrand,
    allExtracted: uniqueAll.slice(0, 5)
  };
}

// Helper to lighten a color for secondary color generation
function lightenColor(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * (percent / 100)));
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * (percent / 100)));
  const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * (percent / 100)));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function extractFonts(html: string): { heading: string | null; body: string | null } {
  const fonts: { heading: string | null; body: string | null } = { heading: null, body: null };
  
  // Check Google Fonts
  const googleFontsMatches = html.matchAll(/fonts\.googleapis\.com\/css2?\?[^"']*family=([^"'&]+)/gi);
  const googleFontFamilies: string[] = [];
  for (const match of googleFontsMatches) {
    const familyParam = match[1];
    const families = familyParam.split(/[&|]/).map(f => {
      const familyMatch = f.match(/(?:family=)?([^:@]+)/);
      return familyMatch ? familyMatch[1].replace(/\+/g, ' ').trim() : null;
    }).filter(Boolean);
    googleFontFamilies.push(...families as string[]);
  }
  
  if (googleFontFamilies.length > 0) {
    fonts.heading = googleFontFamilies[0];
    fonts.body = googleFontFamilies[1] || googleFontFamilies[0];
  }
  
  // Check @font-face
  if (!fonts.heading) {
    const fontFaceMatches = html.matchAll(/@font-face\s*\{[^}]*font-family:\s*["']?([^"';}]+)["']?/gi);
    const fontFaceFamilies: string[] = [];
    for (const match of fontFaceMatches) {
      const family = match[1].trim();
      if (family && !fontFaceFamilies.includes(family)) {
        fontFaceFamilies.push(family);
      }
    }
    if (fontFaceFamilies.length > 0) {
      fonts.heading = fontFaceFamilies[0];
      fonts.body = fontFaceFamilies[1] || fontFaceFamilies[0];
    }
  }
  
  return fonts;
}

function extractLogo(html: string, baseUrl: URL): string | null {
  // Priority 1: Logo in header/nav
  const headerLogoPatterns = [
    /<(?:header|nav)[^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["'][^>]*(?:class|alt)=["'][^"']*logo/i,
    /<(?:header|nav)[^>]*>[\s\S]*?<img[^>]*(?:class|alt)=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
  ];
  
  for (const pattern of headerLogoPatterns) {
    const match = html.match(pattern);
    if (match && match[1] && !match[1].startsWith('data:')) {
      return resolveUrl(match[1], baseUrl);
    }
  }
  
  // Priority 2: Any img with "logo" in class/alt/src
  const logoImgPatterns = [
    /<img[^>]*class=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
    /<img[^>]*src=["']([^"']+)["'][^>]*class=["'][^"']*logo[^"']*["']/i,
    /<img[^>]*alt=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
    /<img[^>]*src=["']([^"']*logo[^"']*)["']/i,
  ];
  
  for (const pattern of logoImgPatterns) {
    const match = html.match(pattern);
    if (match && match[1] && !match[1].startsWith('data:') && !match[1].includes('1x1')) {
      return resolveUrl(match[1], baseUrl);
    }
  }
  
  return null;
}

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

  return `${baseUrl.origin}/favicon.ico`;
}

function extractMeta(html: string, name: string): string | null {
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
