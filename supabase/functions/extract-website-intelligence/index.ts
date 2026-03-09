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

// Get lightness (0-100) from hex
function getLightness(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  return ((max + min) / 2) * 100;
}

// Check if color is near white (within 10% lightness of pure white)
function isNearWhite(hex: string): boolean {
  return getLightness(hex) >= 90;
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

// Check if a color is a brand-viable color (not white, black, or gray)
function isBrandViableColor(color: string): boolean {
  const normalized = normalizeColor(color);
  if (!normalized) return false;
  if (isNearWhite(normalized)) return false;
  if (isNearBlack(normalized)) return false;
  if (isGray(normalized)) return false;
  return true;
}

// Check if a color should be excluded (white, black, or gray) - legacy alias
function isExcludedColor(color: string): boolean {
  return !isBrandViableColor(color);
}

// Calculate color vibrancy (higher = more vibrant/saturated)
function getColorVibrancy(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const delta = max - min;
  if (max === 0) return 0;
  return delta / max;
}

// Derive a lighter tint of a color (+20% lightness)
function deriveLighterTint(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#CCCCCC';
  const factor = 0.2;
  return rgbToHex(
    Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor)),
    Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor)),
    Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor))
  );
}

// Detect if a color is a common CMS/theme default (WordPress blue, Showit defaults, etc.)
function isCmsDefault(hex: string): boolean {
  const defaults = [
    '#21759B', // WordPress default blue
    '#0073AA', // WordPress admin blue
    '#23282D', // WordPress admin dark
    '#0085BA', // WordPress customizer blue
    '#00A0D2', // WordPress highlight
    '#3858E9', // Squarespace default
    '#111111', // Generic dark
  ];
  return defaults.includes(hex.toUpperCase());
}

// ============================================
// BRAND DESIGN DNA TYPES & ANALYSIS
// ============================================

interface BrandDesignDNA {
  cornerRadius: { style: 'sharp' | 'slight' | 'medium' | 'round' | 'pill'; value: string; confidence: number };
  shadowSystem: { style: 'none' | 'subtle' | 'medium' | 'deep'; confidence: number };
  borderSystem: { style: 'structural' | 'accent' | 'minimal' | 'none'; weight: string; confidence: number };
  typography: { headingWeight: string; bodyWeight: string; usesSerif: boolean; usesMono: boolean; confidence: number };
  spacing: { density: 'compact' | 'normal' | 'generous'; confidence: number };
  colorUsage: { paletteSize: 'minimal' | 'moderate' | 'colorful'; usesBrandBg: boolean; usesGradients: boolean; confidence: number };
  aesthetic: { primary: 'minimal' | 'editorial' | 'corporate' | 'bold' | 'playful' | 'technical' | 'warm'; confidence: number };
}

async function extractCSS(pageUrl: string, html: string): Promise<string> {
  let allCSS = '';

  // 1. Inline <style> blocks
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = styleRegex.exec(html)) !== null) {
    allCSS += match[1] + '\n';
  }

  // 2. External stylesheets (same-origin + CDN only)
  const linkRegex = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi;
  const urls: string[] = [];
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const absoluteUrl = href.startsWith('http') ? href : new URL(href, pageUrl).toString();
    try {
      const pageHost = new URL(pageUrl).hostname;
      const cssHost = new URL(absoluteUrl).hostname;
      if (cssHost === pageHost || cssHost.includes('googleapis') || cssHost.includes('cdnjs') || cssHost.includes('cdn.')) {
        urls.push(absoluteUrl);
      }
    } catch {}
  }

  // Fetch first 3 stylesheets (avoid timeout)
  for (const cssUrl of urls.slice(0, 3)) {
    try {
      const resp = await fetch(cssUrl, { signal: AbortSignal.timeout(3000) });
      if (resp.ok) {
        allCSS += await resp.text() + '\n';
      }
    } catch {}
  }

  // 3. Inline styles (sampling)
  const inlineRegex = /style=["']([^"']+)["']/gi;
  while ((match = inlineRegex.exec(html)) !== null) {
    allCSS += `.inline { ${match[1]} }\n`;
  }

  return allCSS;
}

function analyzeBrandDNA(css: string): BrandDesignDNA {
  // ── Corner Radius ──
  const radiusMatches = css.match(/border-radius\s*:\s*([^;]+)/gi) || [];
  const radiusValues = radiusMatches.map(m => parseFloat(m.replace(/border-radius\s*:\s*/i, ''))).filter(v => !isNaN(v) && v >= 0);
  const avgRadius = radiusValues.length > 0 ? radiusValues.reduce((a, b) => a + b, 0) / radiusValues.length : 8;
  let cornerStyle: BrandDesignDNA['cornerRadius']['style'] = 'medium';
  if (avgRadius <= 2) cornerStyle = 'sharp';
  else if (avgRadius <= 6) cornerStyle = 'slight';
  else if (avgRadius <= 12) cornerStyle = 'medium';
  else if (avgRadius <= 30) cornerStyle = 'round';
  else cornerStyle = 'pill';

  // ── Shadow System ──
  const shadowMatches = css.match(/box-shadow\s*:\s*([^;]+)/gi) || [];
  const realShadows = shadowMatches.filter(m => !m.includes('none') && !m.includes('0 0 0'));
  let shadowStyle: BrandDesignDNA['shadowSystem']['style'] = 'none';
  if (realShadows.length > 0) {
    const blurs = realShadows.map(m => {
      const nums = m.match(/(\d+)px/g);
      return nums && nums.length >= 3 ? parseInt(nums[2]) : 0;
    });
    const avgBlur = blurs.reduce((a, b) => a + b, 0) / blurs.length;
    if (avgBlur <= 4) shadowStyle = 'subtle';
    else if (avgBlur <= 12) shadowStyle = 'medium';
    else shadowStyle = 'deep';
  }

  // ── Border System ──
  const borderMatches = css.match(/border(?:-(?:top|bottom|left|right))?\s*:\s*([^;]+)/gi) || [];
  const borderCount = borderMatches.filter(m => !m.includes('none') && !m.includes('0px') && !m.includes('radius')).length;
  let borderStyle: BrandDesignDNA['borderSystem']['style'] = 'minimal';
  if (borderCount > 15) borderStyle = 'structural';
  else if (borderCount > 5) borderStyle = 'accent';
  else if (borderCount > 0) borderStyle = 'minimal';
  else borderStyle = 'none';

  // Check for thick accent bars (border-left: 3px+ solid)
  const accentBars = borderMatches.filter(m => /border-left\s*:\s*[3-9]px\s+solid/i.test(m));
  if (accentBars.length > 0) borderStyle = 'accent';

  const borderWidths = borderMatches.map(m => {
    const w = m.match(/(\d+)px/);
    return w ? parseInt(w[1]) : 1;
  });
  const avgBorderWidth = borderWidths.length > 0 ? borderWidths.reduce((a, b) => a + b, 0) / borderWidths.length : 1;

  // ── Typography ──
  const weightMatches = css.match(/font-weight\s*:\s*([^;]+)/gi) || [];
  const weights = weightMatches.map(m => {
    const val = m.replace(/font-weight\s*:\s*/i, '').trim();
    if (val === 'bold') return 700;
    if (val === 'normal') return 400;
    if (val === 'light') return 300;
    return parseInt(val) || 400;
  });
  const avgWeight = weights.length > 0 ? Math.round(weights.reduce((a, b) => a + b, 0) / weights.length) : 500;

  const fontFamilies = css.match(/font-family\s*:\s*([^;]+)/gi) || [];
  const allFonts = fontFamilies.join(' ').toLowerCase();
  const usesSerif = /\bserif\b/.test(allFonts) && !/\bsans-serif\b/.test(allFonts.replace(/\bserif\b/g, ''));
  const usesMono = allFonts.includes('mono') || allFonts.includes('code') || allFonts.includes('courier');

  // ── Spacing ──
  const paddingMatches = css.match(/padding(?:-(?:top|bottom))?\s*:\s*([^;]+)/gi) || [];
  const paddingValues = paddingMatches.map(m => parseFloat(m.match(/(\d+)/)?.[1] || '0')).filter(v => v > 0);
  const avgPadding = paddingValues.length > 0 ? paddingValues.reduce((a, b) => a + b, 0) / paddingValues.length : 24;
  let spacingDensity: BrandDesignDNA['spacing']['density'] = 'normal';
  if (avgPadding < 16) spacingDensity = 'compact';
  else if (avgPadding > 40) spacingDensity = 'generous';

  // ── Color Usage ──
  const bgColorMatches = css.match(/background(?:-color)?\s*:\s*([^;]+)/gi) || [];
  const gradientCount = bgColorMatches.filter(m => m.includes('gradient')).length;
  const colorValues = css.match(/#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|hsl\([^)]+\)/g) || [];
  const uniqueHues = new Set(colorValues.map(c => c.substring(0, 7))).size;
  let paletteSize: BrandDesignDNA['colorUsage']['paletteSize'] = 'moderate';
  if (uniqueHues <= 5) paletteSize = 'minimal';
  else if (uniqueHues > 12) paletteSize = 'colorful';

  const usesBrandBg = bgColorMatches.some(m => {
    const val = m.replace(/background(?:-color)?\s*:\s*/i, '').trim();
    return val !== 'white' && val !== '#fff' && val !== '#ffffff' && val !== 'transparent' && !val.startsWith('rgb(255') && !val.startsWith('#f');
  });

  // ── Aesthetic Classification ──
  const scores: Record<string, number> = { minimal: 0, editorial: 0, corporate: 0, bold: 0, playful: 0, technical: 0, warm: 0 };

  if (cornerStyle === 'sharp') { scores.technical += 2; scores.corporate += 1; }
  if (cornerStyle === 'round' || cornerStyle === 'pill') { scores.playful += 2; scores.warm += 1; }
  if (shadowStyle === 'none') { scores.minimal += 2; scores.technical += 1; }
  if (shadowStyle === 'deep') { scores.warm += 1; scores.bold += 1; }
  if (borderStyle === 'structural') { scores.editorial += 2; scores.technical += 1; }
  if (borderStyle === 'accent') { scores.corporate += 1; scores.warm += 1; }
  if (usesSerif) { scores.editorial += 2; scores.warm += 1; }
  if (usesMono) { scores.technical += 2; }
  if (avgWeight > 650) { scores.bold += 2; }
  if (avgWeight < 450) { scores.editorial += 1; scores.minimal += 1; }
  if (paletteSize === 'minimal') { scores.minimal += 2; }
  if (usesBrandBg) { scores.bold += 1; scores.warm += 1; }
  if (spacingDensity === 'generous') { scores.editorial += 1; scores.minimal += 1; }

  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const aesthetic = sortedScores[0][0] as BrandDesignDNA['aesthetic']['primary'];

  return {
    cornerRadius: { style: cornerStyle, value: `${Math.round(avgRadius)}px`, confidence: Math.min(radiusValues.length / 10, 1) },
    shadowSystem: { style: shadowStyle, confidence: Math.min(shadowMatches.length / 8, 1) },
    borderSystem: { style: borderStyle, weight: `${Math.round(avgBorderWidth)}px`, confidence: Math.min(borderCount / 10, 1) },
    typography: { headingWeight: String(avgWeight), bodyWeight: String(Math.min(avgWeight, 400)), usesSerif, usesMono, confidence: Math.min(weights.length / 8, 1) },
    spacing: { density: spacingDensity, confidence: Math.min(paddingValues.length / 15, 1) },
    colorUsage: { paletteSize, usesBrandBg, usesGradients: gradientCount > 0, confidence: Math.min(colorValues.length / 20, 1) },
    aesthetic: { primary: aesthetic, confidence: sortedScores[0][1] > 3 ? 0.8 : 0.5 },
  };
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
    // 2. BRAND COLORS EXTRACTION (weighted priority hierarchy)
    // ============================================
    // Priority tiers:
    //   HIGHEST (1): Hero/header section bg, CTA/primary button bg, H1 heading color
    //   HIGH (2): Logo dominant color (fallback), nav/header bg, footer bg
    //   MEDIUM (3): Link color, accent elements, border-colors on feature cards
    //   LOW (4): Meta tags, favicon colors, WordPress/Showit theme defaults
    
    const collectedColors: Array<{ color: string; source: string; priority: number; isCmsDefault: boolean }> = [];
    const allExtractedColors: string[] = [];
    let detectedBackgroundColor: string | null = null;
    let colorConfidenceLevel: 'high' | 'medium' | 'low' = 'low';
    
    // Helper to add color with source tracking and white/cms handling
    const addColor = (rawColor: string, source: string, priority: number) => {
      const normalized = normalizeColor(rawColor);
      if (!normalized) return;
      
      allExtractedColors.push(normalized);
      
      // Track by source
      if (source === 'themeColor') extractedData.colorsBySource.themeColor.push(normalized);
      else if (source === 'cssVar') extractedData.colorsBySource.cssVars.push(normalized);
      else if (source === 'button' || source === 'heroBg' || source === 'h1Color') extractedData.colorsBySource.buttons.push(normalized);
      else if (source === 'inline') extractedData.colorsBySource.inlineStyles.push(normalized);
      else if (source === 'styleTag') extractedData.colorsBySource.styleTags.push(normalized);
      
      // White/near-white → classify as background, not brand
      if (isNearWhite(normalized)) {
        if (!detectedBackgroundColor) {
          detectedBackgroundColor = normalized;
          console.log(`[extract] White/near-white from ${source} classified as background:`, normalized);
        }
        return;
      }
      
      // Skip black/gray for brand colors
      if (isNearBlack(normalized) || isGray(normalized)) {
        // But track dark colors as potential background
        if (isNearBlack(normalized) && !detectedBackgroundColor) {
          detectedBackgroundColor = normalized;
        }
        return;
      }
      
      const isCms = isCmsDefault(normalized);
      if (isCms) {
        // Demote CMS defaults to lowest priority
        console.log(`[extract] CMS default color detected from ${source}:`, normalized, '→ demoted');
        priority = 10;
      }
      
      collectedColors.push({ color: normalized, source, priority, isCmsDefault: isCms });
      console.log(`[extract] Color from ${source} (priority ${priority}${isCms ? ' CMS-DEFAULT' : ''}):`, normalized);
    };
    
    // HIGHEST PRIORITY (1): Hero/header section backgrounds
    const heroSectionMatch = html.match(/<(?:div|section)[^>]*class=["'][^"']*hero[^"']*["'][^>]*style=["'][^"']*background(?:-color)?:\s*([^;"']+)/i);
    if (heroSectionMatch) addColor(heroSectionMatch[1], 'heroBg', 1);
    
    const headerBgMatch = html.match(/<header[^>]*style=["'][^"']*background(?:-color)?:\s*([^;"']+)/i);
    if (headerBgMatch) addColor(headerBgMatch[1], 'heroBg', 1);
    
    // HIGHEST PRIORITY (1): CTA/primary button background-color
    const buttonInlinePatterns = [
      /<(?:button|a)[^>]*class=["'][^"']*(?:btn|button|cta|primary)[^"']*["'][^>]*style=["'][^"']*background(?:-color)?:\s*([^;"']+)/gi,
      /<(?:button|a)[^>]*style=["'][^"']*background(?:-color)?:\s*([^;"']+)[^"']*["'][^>]*class=["'][^"']*(?:btn|button|cta|primary)/gi,
      /<[^>]*class=["'][^"']*(?:cta|call-to-action|hero-btn|main-btn|action-btn)[^"']*["'][^>]*style=["'][^"']*background(?:-color)?:\s*([^;"']+)/gi,
    ];
    for (const pattern of buttonInlinePatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        addColor(match[1], 'button', 1);
      }
    }
    
    // HIGHEST PRIORITY (1): H1 heading color property
    const styleTagMatches = html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    const allStyleContent: string[] = [];
    for (const styleMatch of styleTagMatches) {
      const cssContent = styleMatch[1];
      allStyleContent.push(cssContent);
      
      // H1 color
      const h1ColorMatch = cssContent.match(/h1[^{]*\{[^}]*(?<!background-)color:\s*([^;}]+)/i);
      if (h1ColorMatch) addColor(h1ColorMatch[1], 'h1Color', 1);
      
      // Button/CTA background colors (HIGHEST)
      const buttonCssPatterns = [
        /\.(?:btn|button|cta|primary-btn|main-btn|action-btn)[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/gi,
        /button(?:\.[^\s{]+)?[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/gi,
        /a\.(?:btn|button|cta)[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/gi,
      ];
      for (const pattern of buttonCssPatterns) {
        const matches = cssContent.matchAll(pattern);
        for (const match of matches) addColor(match[1], 'button', 1);
      }
      
      // Hero section CSS backgrounds (HIGHEST)
      const heroCssMatch = cssContent.match(/\.hero[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/i);
      if (heroCssMatch) addColor(heroCssMatch[1], 'heroBg', 1);
      
      // Nav/header/footer backgrounds (HIGH - priority 2)
      const navBgMatch = cssContent.match(/(?:nav|\.nav|\.navbar|\.navigation)[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/i);
      if (navBgMatch) addColor(navBgMatch[1], 'navBg', 2);
      
      const footerBgMatch = cssContent.match(/footer[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/i);
      if (footerBgMatch) addColor(footerBgMatch[1], 'footerBg', 2);
      
      // Primary/accent class colors (MEDIUM - priority 3)
      const accentPatterns = [
        /\.(?:primary|accent|brand)[^{]*\{[^}]*(?:background(?:-color)?|color):\s*([^;}]+)/gi,
      ];
      for (const pattern of accentPatterns) {
        const matches = cssContent.matchAll(pattern);
        for (const match of matches) addColor(match[1], 'styleTag', 3);
      }
      
      // Link colors (MEDIUM - priority 3)
      const linkColorMatch = cssContent.match(/a(?:\s*,|\s*\{|\s*:)[^{]*\{[^}]*(?<!background-)color:\s*(#[0-9a-fA-F]{3,8})/i);
      if (linkColorMatch) addColor(linkColorMatch[1], 'linkColor', 3);
      
      // Background color for light/dark mode detection
      const bodyBgMatch = cssContent.match(/body[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/i);
      if (bodyBgMatch) {
        const normalized = normalizeColor(bodyBgMatch[1]);
        if (normalized) detectedBackgroundColor = normalized;
      }
    }
    
    // CSS custom properties (HIGH - priority 2)
    const cssVarPatterns = [
      /--(?:primary|brand|main|accent|theme)(?:[-_]?color)?:\s*(#[0-9a-fA-F]{3,8})/gi,
      /--(?:primary|brand|main|accent|theme)(?:[-_]?color)?:\s*(rgb[a]?\([^)]+\))/gi,
      /--(?:color[-_]?(?:primary|brand|accent|main)|(?:primary|brand|accent|main)[-_]color):\s*(#[0-9a-fA-F]{3,8})/gi,
      /--(?:bg|background)[-_]?(?:primary|brand|accent):\s*(#[0-9a-fA-F]{3,8})/gi,
      /--(?:btn|button)[-_]?(?:primary|bg|background):\s*(#[0-9a-fA-F]{3,8})/gi,
    ];
    for (const pattern of cssVarPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) addColor(match[1], 'cssVar', 2);
    }
    
    // Meta theme-color (LOW priority 4 — often CMS defaults)
    const themeColorMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i)
                    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']theme-color["']/i);
    if (themeColorMatch) {
      addColor(themeColorMatch[1], 'themeColor', 4);
    }
    
    // General inline styles (LOW - priority 4)
    const inlineColorPatterns = [
      /style=["'][^"']*background(?:-color)?:\s*(#[0-9a-fA-F]{3,8})/gi,
      /style=["'][^"']*background(?:-color)?:\s*(rgb[a]?\([^)]+\))/gi,
    ];
    for (const pattern of inlineColorPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) addColor(match[1], 'inline', 4);
    }
    
    // Fetch and parse external CSS stylesheets
    const cssLinkPatterns = [
      /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi,
      /<link[^>]*href=["']([^"']+\.css[^"']*)["'][^>]*rel=["']stylesheet["']/gi,
      /<link[^>]*href=["']([^"']+\.css[^"']*)["'][^>]*>/gi,
    ];
    const cssLinks: string[] = [];
    for (const pattern of cssLinkPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        const href = match[1];
        if (!href.includes('googleapis.com/css') && !href.includes('fonts.') && !href.includes('icon') && !cssLinks.includes(href)) {
          try {
            const cssUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
            if (!cssLinks.includes(cssUrl)) cssLinks.push(cssUrl);
          } catch (e) { /* ignore invalid URLs */ }
        }
      }
    }
    
    console.log('[extract] Found CSS links:', cssLinks.length, cssLinks.slice(0, 2).map(u => u.slice(0, 60)));
    
    for (const cssUrl of cssLinks.slice(0, 3)) {
      try {
        console.log('[extract] Fetching external CSS:', cssUrl.slice(0, 80));
        const cssResponse = await fetch(cssUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PageConsultBot/1.0)' }
        });
        if (cssResponse.ok) {
          const cssContent = await cssResponse.text();
          
          // Button/CTA in external CSS (HIGHEST)
          const extButtonPatterns = [
            /\.(?:btn|button|cta)(?:[-_]primary|[-_]main)?[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/gi,
            /\.w-button[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/gi,
          ];
          for (const pattern of extButtonPatterns) {
            const matches = cssContent.matchAll(pattern);
            for (const match of matches) addColor(match[1], 'button', 1);
          }
          
          // Hero backgrounds in external CSS (HIGHEST)
          const extHeroMatch = cssContent.match(/\.hero[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/i);
          if (extHeroMatch) addColor(extHeroMatch[1], 'heroBg', 1);
          
          // H1 color in external CSS (HIGHEST)
          const extH1Match = cssContent.match(/h1[^{]*\{[^}]*(?<!background-)color:\s*([^;}]+)/i);
          if (extH1Match) addColor(extH1Match[1], 'h1Color', 1);
          
          // CSS vars in external (HIGH)
          for (const pattern of cssVarPatterns) {
            const matches = cssContent.matchAll(pattern);
            for (const match of matches) addColor(match[1], 'cssVar', 2);
          }
          
          // Primary/brand class colors (MEDIUM)
          const extBrandPatterns = [
            /\.(?:primary|brand|accent|main|theme)[-_]?(?:color|bg|background)?[^{]*\{[^}]*(?:background(?:-color)?|color):\s*([^;}]+)/gi,
            /\.(?:bg|background)[-_](?:primary|brand|accent|main)[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/gi,
            /\.is[-_]?primary[^{]*\{[^}]*(?:background(?:-color)?|color|border-color):\s*([^;}]+)/gi,
          ];
          for (const pattern of extBrandPatterns) {
            const matches = cssContent.matchAll(pattern);
            for (const match of matches) addColor(match[1], 'cssVar', 3);
          }
          
          // Link colors (MEDIUM)
          const extLinkMatch = cssContent.match(/a(?:\s*,|\s*\{|\s*:)[^{]*\{[^}]*(?<!background-)color:\s*(#[0-9a-fA-F]{3,8})/i);
          if (extLinkMatch) addColor(extLinkMatch[1], 'linkColor', 3);
          
          // Body background for light/dark detection
          const extBodyBg = cssContent.match(/body[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/i);
          if (extBodyBg && !detectedBackgroundColor) {
            const normalized = normalizeColor(extBodyBg[1]);
            if (normalized) detectedBackgroundColor = normalized;
          }
          
          console.log('[extract] Colors after external CSS:', collectedColors.length);
        }
      } catch (e) {
        console.log('[extract] Failed to fetch CSS:', cssUrl.slice(0, 50));
      }
    }
    
    // Sort by priority (lower = better), then vibrancy, excluding CMS defaults when better options exist
    const hasNonCmsColors = collectedColors.some(c => !c.isCmsDefault);
    
    const sortedColors = collectedColors
      .filter(c => !hasNonCmsColors || !c.isCmsDefault) // Remove CMS defaults if we have real colors
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
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
    
    // SAFEGUARD: Duplicate detection — if primary === secondary, derive secondary
    if (uniqueColors.length >= 2 && uniqueColors[0] === uniqueColors[1]) {
      uniqueColors[1] = deriveLighterTint(uniqueColors[0]);
      console.log('[extract] Duplicate primary/secondary detected, derived tint:', uniqueColors[1]);
    } else if (uniqueColors.length === 1) {
      // Only one color found — derive a secondary from it
      uniqueColors.push(deriveLighterTint(uniqueColors[0]));
      console.log('[extract] Only one color found, derived secondary:', uniqueColors[1]);
    }
    
    // Determine confidence
    const highestPrioritySources = collectedColors.filter(c => c.priority <= 1 && !c.isCmsDefault);
    const mediumPrioritySources = collectedColors.filter(c => c.priority <= 3 && !c.isCmsDefault);
    const onlyCmsColors = collectedColors.length > 0 && collectedColors.every(c => c.isCmsDefault);
    
    if (highestPrioritySources.length > 0) {
      colorConfidenceLevel = 'high';
    } else if (mediumPrioritySources.length > 0) {
      colorConfidenceLevel = 'medium';
    } else if (onlyCmsColors) {
      colorConfidenceLevel = 'low'; // Only CMS defaults found
    } else {
      colorConfidenceLevel = uniqueColors.length > 0 ? 'medium' : 'low';
    }
    
    // Default background if none detected
    if (!detectedBackgroundColor) {
      detectedBackgroundColor = '#FFFFFF'; // Assume light mode
    }
    
    // Determine color mode from background
    const backgroundLightness = getLightness(detectedBackgroundColor);
    const detectedColorMode = backgroundLightness >= 50 ? 'light' : 'dark';
    
    // Detect minimal/monochromatic brand
    if (uniqueAllColors.length > 0 && uniqueColors.length === 0) {
      extractedData.isMinimalBrand = true;
      extractedData.brandColors = uniqueAllColors.filter(c => isBrandViableColor(c)).slice(0, 3);
      extractedData.extractionConfidence = 'medium';
      console.log('[extract] Minimal brand detected, using monochromatic colors:', extractedData.brandColors);
    } else {
      extractedData.brandColors = uniqueColors;
      extractedData.extractionConfidence = colorConfidenceLevel;
    }
    
    extractedData.allExtractedColors = uniqueAllColors;
    console.log('[extract] Final colors:', extractedData.brandColors, 'background:', detectedBackgroundColor, 'colorMode:', detectedColorMode, 'confidence:', colorConfidenceLevel, 'isMinimalBrand:', extractedData.isMinimalBrand);

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
    // 4. LOGO EXTRACTION (priority order with filtering)
    // ============================================
    
    // Helper: Check if URL/context seems to be from partner/investor sections
    const isExcludedLogoContext = (imgTag: string, url: string): boolean => {
      const lowerTag = imgTag.toLowerCase();
      const lowerUrl = url.toLowerCase();
      
      // Exclude images from partner/investor/portfolio sections
      const excludedPatterns = [
        /investor/i, /portfolio/i, /partner/i, /backed/i, /funded/i,
        /client/i, /customer/i, /testimonial/i, /press/i, /media/i,
        /award/i, /badge/i, /certification/i, /trust/i,
        /sponsor/i, /supporter/i, /featured/i, /as-seen/i,
      ];
      
      for (const pattern of excludedPatterns) {
        if (pattern.test(lowerTag) || pattern.test(lowerUrl)) {
          console.log('[extract] Excluding logo (partner/investor context):', url.slice(0, 80));
          return true;
        }
      }
      
      // Check if URL contains other company names (VC firms, etc.)
      const vcFirmPatterns = [
        /8vc/i, /a16z/i, /andreessen/i, /sequoia/i, /benchmark/i,
        /greylock/i, /accel/i, /general-catalyst/i, /insight/i,
        /kleiner/i, /khosla/i, /index-ventures/i, /founders-fund/i,
        /tiger-global/i, /softbank/i, /ycombinator/i, /y-combinator/i,
      ];
      
      for (const pattern of vcFirmPatterns) {
        if (pattern.test(lowerUrl)) {
          console.log('[extract] Excluding logo (VC firm detected):', url.slice(0, 80));
          return true;
        }
      }
      
      return false;
    };
    
    // Helper: Check if company name matches alt text
    const companyNameForLogoMatching = extractedData.companyName?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
    
    const altMatchesCompany = (imgTag: string): boolean => {
      if (!companyNameForLogoMatching) return false;
      const altMatch = imgTag.match(/alt=["']([^"']+)["']/i);
      if (!altMatch) return false;
      const altText = altMatch[1].toLowerCase().replace(/[^a-z0-9]/g, '');
      return altText.includes(companyNameForLogoMatching) || companyNameForLogoMatching.includes(altText);
    };
    
    // Priority 1: Favicon/Apple touch icon (strongest signal - set by site owner)
    const faviconPatterns = [
      /<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i,
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:icon|shortcut icon)["']/i,
      /<link[^>]*rel=["']apple-touch-icon[^"']*["'][^>]*href=["']([^"']+)["']/i,
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']apple-touch-icon[^"']*["']/i,
    ];
    
    for (const pattern of faviconPatterns) {
      const match = html.match(pattern);
      if (match && match[1] && !match[1].startsWith('data:') && !match[1].includes('favicon.ico')) {
        // Prefer larger icons (apple-touch-icon, etc.) over tiny favicons
        const url = match[1];
        if (url.includes('apple-touch') || url.includes('180x180') || url.includes('192x192') || url.includes('512x512')) {
          extractedData.logoUrl = url;
          console.log('[extract] Logo from favicon/apple-touch-icon:', extractedData.logoUrl);
          break;
        }
      }
    }
    
    // Priority 2: Extract header/nav section first for targeted search
    const headerMatch = html.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
    const navMatch = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i);
    const headerContent = (headerMatch?.[0] || '') + (navMatch?.[0] || '');
    
    if (!extractedData.logoUrl && headerContent) {
      // Look for images in header/nav with logo-related attributes
      const headerImgMatches = headerContent.matchAll(/<img[^>]+>/gi);
      
      for (const imgMatch of headerImgMatches) {
        const imgTag = imgMatch[0];
        const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
        if (!srcMatch) continue;
        
        const src = srcMatch[1];
        if (src.startsWith('data:') || src.includes('1x1') || src.includes('pixel')) continue;
        if (isExcludedLogoContext(imgTag, src)) continue;
        
        // Check if this looks like a logo
        const isLogoCandidate = 
          /class=["'][^"']*logo/i.test(imgTag) ||
          /alt=["'][^"']*logo/i.test(imgTag) ||
          /logo/i.test(src) ||
          altMatchesCompany(imgTag) ||
          /id=["'][^"']*logo/i.test(imgTag);
        
        if (isLogoCandidate) {
          extractedData.logoUrl = src;
          console.log('[extract] Logo from header (class/alt/src):', extractedData.logoUrl);
          break;
        }
      }
      
      // If no explicit logo found in header, try first reasonable image in header
      if (!extractedData.logoUrl) {
        for (const imgMatch of headerContent.matchAll(/<img[^>]+>/gi)) {
          const imgTag = imgMatch[0];
          const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
          if (!srcMatch) continue;
          
          const src = srcMatch[1];
          if (src.startsWith('data:') || src.includes('1x1') || src.includes('pixel')) continue;
          if (isExcludedLogoContext(imgTag, src)) continue;
          
          // Skip images that are clearly not logos (large dimensions, etc.)
          const widthMatch = imgTag.match(/width=["']?(\d+)/i);
          const heightMatch = imgTag.match(/height=["']?(\d+)/i);
          const width = widthMatch ? parseInt(widthMatch[1]) : 0;
          const height = heightMatch ? parseInt(heightMatch[1]) : 0;
          
          // Skip if dimensions suggest it's not a logo (too large)
          if (width > 500 || height > 200) continue;
          
          extractedData.logoUrl = src;
          console.log('[extract] Logo from header (first image):', extractedData.logoUrl);
          break;
        }
      }
      
      // Priority 2b: SVG in header (often inline logos)
      if (!extractedData.logoUrl) {
        const svgInHeader = headerContent.match(/<svg[^>]*class=["'][^"']*logo[^"']*["'][^>]*>[\s\S]*?<\/svg>/i);
        if (svgInHeader) {
          // We found an SVG logo but can't extract it as URL, continue to other methods
          console.log('[extract] Found SVG logo in header (cannot extract as URL)');
        }
      }
    }
    
    // Priority 3: Any img with alt text matching company name
    if (!extractedData.logoUrl && companyNameForLogoMatching) {
      const allImgTags = html.matchAll(/<img[^>]+>/gi);
      for (const imgMatch of allImgTags) {
        const imgTag = imgMatch[0];
        if (altMatchesCompany(imgTag)) {
          const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
          if (srcMatch && !srcMatch[1].startsWith('data:') && !isExcludedLogoContext(imgTag, srcMatch[1])) {
            extractedData.logoUrl = srcMatch[1];
            console.log('[extract] Logo from alt matching company name:', extractedData.logoUrl);
            break;
          }
        }
      }
    }
    
    // Priority 4: Any img with "logo" in class/id (NOT in URL to avoid partner logos)
    if (!extractedData.logoUrl) {
      const allImgTags = html.matchAll(/<img[^>]+>/gi);
      for (const imgMatch of allImgTags) {
        const imgTag = imgMatch[0];
        const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
        if (!srcMatch) continue;
        
        const src = srcMatch[1];
        if (src.startsWith('data:') || src.includes('1x1') || src.includes('pixel')) continue;
        if (isExcludedLogoContext(imgTag, src)) continue;
        
        // Only match class/id containing logo, NOT filename
        const hasLogoClass = /class=["'][^"']*\blogo\b[^"']*["']/i.test(imgTag);
        const hasLogoId = /id=["'][^"']*\blogo\b[^"']*["']/i.test(imgTag);
        
        if (hasLogoClass || hasLogoId) {
          extractedData.logoUrl = src;
          console.log('[extract] Logo from class/id containing "logo":', extractedData.logoUrl);
          break;
        }
      }
    }
    
    // Priority 5: og:image (only as last resort, often not the logo)
    if (!extractedData.logoUrl) {
      const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
                   || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
      if (ogImage && !isExcludedLogoContext('', ogImage[1])) {
        // og:image is usually a social share image, not the logo, so mark as low confidence
        extractedData.logoUrl = ogImage[1];
        console.log('[extract] Logo from og:image (fallback):', extractedData.logoUrl);
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

    // ── Brand Design DNA Extraction ──────────────
    // COMPLETELY ISOLATED — if this fails, existing extraction returns unchanged
    let designDNA: BrandDesignDNA | null = null;
    try {
      designDNA = await Promise.race([
        (async () => {
          const cssContent = await extractCSS(normalizedUrl, html);
          if (cssContent.length < 100) return null; // Not enough CSS to analyze
          const dna = analyzeBrandDNA(cssContent);
          console.log('🎨 [BrandDNA] Extracted design DNA:', JSON.stringify({
            corners: dna.cornerRadius.style,
            shadows: dna.shadowSystem.style,
            borders: dna.borderSystem.style,
            aesthetic: dna.aesthetic.primary,
            usesBrandBg: dna.colorUsage.usesBrandBg,
          }));
          return dna;
        })(),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('CSS analysis timeout')), 8000))
      ]);
    } catch (err: any) {
      console.log('[extract-website-intelligence] CSS analysis skipped:', err?.message || err);
      designDNA = null;
    }

    console.log('[extract-website-intelligence] Final extracted data:', {
      companyName: extractedData.companyName,
      inferredIndustry,
      hasLogo: !!extractedData.logoUrl,
      colorCount: extractedData.brandColors.length,
      isMinimalBrand: extractedData.isMinimalBrand,
      hasDesignDNA: !!designDNA,
    });

    // Build enhanced response with backward compatibility
    const responseData = {
      success: true,
      // ===== BACKWARD COMPATIBLE FIELDS =====
      companyName: extractedData.companyName,
      logoUrl: extractedData.logoUrl,
      brandColors: extractedData.brandColors,
      fonts: extractedData.fonts,
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
      
      // ===== ENHANCED COLOR FIELDS =====
      primary: extractedData.brandColors[0] || null,
      secondary: extractedData.brandColors[1] || null,
      accent: extractedData.brandColors[2] || null,
      
      // Background color + color mode for SDI light/dark detection
      backgroundColor: detectedBackgroundColor,
      colorMode: detectedColorMode,
      
      // Color confidence: 'low' means we only found CMS defaults or meta tags
      colorConfidence: colorConfidenceLevel,
      colorConfidenceMessage: colorConfidenceLevel === 'low' 
        ? 'We detected these colors but they may be CMS defaults — do they look right?' 
        : null,
      
      // Extended color arrays
      secondaryColors: extractedData.brandColors.slice(1, 3),
      accentColors: extractedData.brandColors.slice(2, 5),
      allColors: extractedData.allExtractedColors,
      
      // Color sources for debugging/transparency
      colorsBySource: extractedData.colorsBySource,
      
      // Enhanced font structure
      extractedFonts: extractedData.extractedFonts,
      
      // ===== BRAND DESIGN DNA =====
      designDNA,
    };
    
    console.log('[extract-website-intelligence] Response:', {
      companyName: responseData.companyName,
      primary: responseData.primary,
      secondary: responseData.secondary,
      accent: responseData.accent,
      backgroundColor: responseData.backgroundColor,
      colorMode: responseData.colorMode,
      colorConfidence: responseData.colorConfidence,
      fonts: responseData.extractedFonts,
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
