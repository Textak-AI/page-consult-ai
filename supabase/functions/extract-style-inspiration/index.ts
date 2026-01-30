import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

/**
 * STYLE INTELLIGENCE - Website Inspiration Extraction
 * 
 * Extracts full visual DNA from inspiration websites:
 * - Colors (primary, secondary, accent, background, text)
 * - Typography (heading font, body font, weights, sizes)
 * - Spacing (section padding, card padding, gaps)
 * - Button styles (shapes, shadows, hover effects)
 * - Card styles (borders, shadows, radius)
 * - Mood classification (minimal, bold, elegant, playful, etc.)
 */

// ============================================
// COLOR UTILITIES (shared with extract-website-intelligence)
// ============================================

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
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

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function normalizeColor(color: string): string | null {
  const trimmed = color.trim().toLowerCase();
  
  // Handle rgb/rgba
  const rgbMatch = trimmed.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return rgbToHex(parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3]));
  }
  
  // Handle hsl/hsla
  const hslMatch = trimmed.match(/hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360;
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
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

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function isNearWhite(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  return rgb.r > 240 && rgb.g > 240 && rgb.b > 240;
}

function isNearBlack(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  return rgb.r < 30 && rgb.g < 30 && rgb.b < 30;
}

function isGray(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const diff = Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b);
  return diff < 25;
}

function getColorVibrancy(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  if (max === 0) return 0;
  return (max - min) / max;
}

function getColorLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

// ============================================
// STYLE EXTRACTION
// ============================================

interface StyleInspiration {
  // Core colors
  colors: {
    primary: string | null;
    secondary: string | null;
    accent: string | null;
    background: string | null;
    backgroundAlt: string | null;
    text: string | null;
    textMuted: string | null;
    all: string[];
  };
  
  // Typography
  typography: {
    headingFont: string;
    bodyFont: string;
    headingWeight: string;
    bodyWeight: string;
    headingSizes: { h1: string; h2: string; h3: string };
  };
  
  // Spacing & Layout
  spacing: {
    sectionPadding: string;
    cardPadding: string;
    gap: string;
    density: 'compact' | 'normal' | 'spacious';
  };
  
  // Component Styles
  components: {
    buttonRadius: string;
    buttonStyle: 'solid' | 'outline' | 'ghost' | 'gradient';
    cardRadius: string;
    cardShadow: string;
    cardBorder: boolean;
  };
  
  // Visual Effects
  effects: {
    hasGradients: boolean;
    hasGlassmorphism: boolean;
    hasShadows: boolean;
    shadowIntensity: 'subtle' | 'medium' | 'dramatic';
  };
  
  // Mood Classification
  mood: {
    primary: 'minimal' | 'bold' | 'elegant' | 'playful' | 'corporate' | 'creative' | 'tech';
    colorMode: 'light' | 'dark';
    contrast: 'low' | 'medium' | 'high';
  };
  
  // Meta
  sourceUrl: string;
  extractionConfidence: 'high' | 'medium' | 'low';
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

    let normalizedUrl = url;
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    console.log('[extract-style-inspiration] Fetching:', normalizedUrl);

    const response = await fetch(normalizedUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Initialize result
    const result: StyleInspiration = {
      colors: {
        primary: null,
        secondary: null,
        accent: null,
        background: null,
        backgroundAlt: null,
        text: null,
        textMuted: null,
        all: [],
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        headingWeight: '700',
        bodyWeight: '400',
        headingSizes: { h1: '48px', h2: '36px', h3: '24px' },
      },
      spacing: {
        sectionPadding: '80px',
        cardPadding: '24px',
        gap: '24px',
        density: 'normal',
      },
      components: {
        buttonRadius: '8px',
        buttonStyle: 'solid',
        cardRadius: '12px',
        cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        cardBorder: false,
      },
      effects: {
        hasGradients: false,
        hasGlassmorphism: false,
        hasShadows: true,
        shadowIntensity: 'medium',
      },
      mood: {
        primary: 'corporate',
        colorMode: 'light',
        contrast: 'medium',
      },
      sourceUrl: normalizedUrl,
      extractionConfidence: 'low',
    };

    // ============================================
    // 1. EXTRACT COLORS
    // ============================================
    const collectedColors: Array<{ color: string; role: string; priority: number }> = [];
    
    // CSS Variables (highest priority for design intent)
    const cssVarPatterns: [RegExp, string][] = [
      [/--(?:primary|brand|main)(?:[-_]?color)?:\s*([^;}\n]+)/gi, 'primary'],
      [/--(?:secondary|accent)(?:[-_]?color)?:\s*([^;}\n]+)/gi, 'secondary'],
      [/--(?:accent|highlight)(?:[-_]?color)?:\s*([^;}\n]+)/gi, 'accent'],
      [/--(?:background|bg)(?:[-_]?color)?:\s*([^;}\n]+)/gi, 'background'],
      [/--(?:foreground|text)(?:[-_]?color)?:\s*([^;}\n]+)/gi, 'text'],
      [/--(?:muted|subtle)(?:[-_]?color)?:\s*([^;}\n]+)/gi, 'textMuted'],
    ];
    
    for (const [pattern, role] of cssVarPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        const normalized = normalizeColor(match[1]);
        if (normalized) {
          collectedColors.push({ color: normalized, role, priority: 1 });
        }
      }
    }
    
    // Button backgrounds
    const buttonPatterns = [
      /\.(?:btn|button|cta)[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/gi,
      /button[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/gi,
    ];
    for (const pattern of buttonPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        const normalized = normalizeColor(match[1]);
        if (normalized && !isNearWhite(normalized) && !isNearBlack(normalized)) {
          collectedColors.push({ color: normalized, role: 'primary', priority: 2 });
        }
      }
    }
    
    // Hero/header backgrounds
    const heroPatterns = [
      /\.(?:hero|header|banner)[^{]*\{[^}]*background(?:-color)?:\s*([^;}]+)/gi,
    ];
    for (const pattern of heroPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        const normalized = normalizeColor(match[1]);
        if (normalized) {
          const luminance = getColorLuminance(normalized);
          const role = luminance > 0.5 ? 'background' : 'backgroundAlt';
          collectedColors.push({ color: normalized, role, priority: 2 });
        }
      }
    }
    
    // Body/text colors
    const textPatterns = [
      /body[^{]*\{[^}]*color:\s*([^;}]+)/gi,
      /\.(?:text|content|body)[^{]*\{[^}]*color:\s*([^;}]+)/gi,
    ];
    for (const pattern of textPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        const normalized = normalizeColor(match[1]);
        if (normalized) {
          collectedColors.push({ color: normalized, role: 'text', priority: 3 });
        }
      }
    }
    
    // Assign colors by role
    const colorsByRole: Record<string, string[]> = {};
    for (const { color, role } of collectedColors.sort((a, b) => a.priority - b.priority)) {
      if (!colorsByRole[role]) colorsByRole[role] = [];
      if (!colorsByRole[role].includes(color)) {
        colorsByRole[role].push(color);
      }
    }
    
    result.colors.primary = colorsByRole['primary']?.[0] || null;
    result.colors.secondary = colorsByRole['secondary']?.[0] || colorsByRole['primary']?.[1] || null;
    result.colors.accent = colorsByRole['accent']?.[0] || colorsByRole['primary']?.[2] || null;
    result.colors.background = colorsByRole['background']?.[0] || null;
    result.colors.backgroundAlt = colorsByRole['backgroundAlt']?.[0] || null;
    result.colors.text = colorsByRole['text']?.[0] || null;
    result.colors.textMuted = colorsByRole['textMuted']?.[0] || null;
    result.colors.all = [...new Set(collectedColors.map(c => c.color))].slice(0, 10);
    
    // Determine color mode
    if (result.colors.background) {
      result.mood.colorMode = getColorLuminance(result.colors.background) > 0.5 ? 'light' : 'dark';
    }

    // ============================================
    // 2. EXTRACT TYPOGRAPHY
    // ============================================
    
    // Google Fonts
    const googleFontsMatches = html.matchAll(/fonts\.googleapis\.com\/css2?\?[^"']*family=([^"']+)/gi);
    const detectedFonts: string[] = [];
    for (const match of googleFontsMatches) {
      const familyParam = decodeURIComponent(match[1]);
      const families = familyParam.split(/[&|]/).map(f => {
        const familyMatch = f.match(/(?:family=)?([^:@]+)/);
        return familyMatch ? familyMatch[1].replace(/\+/g, ' ').split(',')[0].trim() : null;
      }).filter(Boolean) as string[];
      detectedFonts.push(...families);
    }
    
    if (detectedFonts.length > 0) {
      result.typography.headingFont = detectedFonts[0];
      result.typography.bodyFont = detectedFonts[1] || detectedFonts[0];
      result.extractionConfidence = 'high';
    }
    
    // Heading styles
    const h1Patterns = [
      /h1[^{]*\{[^}]*font-size:\s*([^;}]+)/gi,
      /\.(?:heading|title|hero-title)[^{]*\{[^}]*font-size:\s*([^;}]+)/gi,
    ];
    for (const pattern of h1Patterns) {
      const match = html.match(pattern);
      if (match) {
        result.typography.headingSizes.h1 = match[1].trim();
        break;
      }
    }
    
    // Heading weight
    const weightPattern = /h[12][^{]*\{[^}]*font-weight:\s*(\d+|bold|semibold)/gi;
    const weightMatch = html.match(weightPattern);
    if (weightMatch) {
      const weight = weightMatch[1];
      result.typography.headingWeight = weight === 'bold' ? '700' : weight === 'semibold' ? '600' : weight;
    }

    // ============================================
    // 3. EXTRACT SPACING & LAYOUT
    // ============================================
    
    // Section padding
    const sectionPatterns = [
      /\.(?:section|container)[^{]*\{[^}]*padding(?:-top|-bottom)?:\s*([^;}]+)/gi,
      /section[^{]*\{[^}]*padding(?:-top|-bottom)?:\s*([^;}]+)/gi,
    ];
    for (const pattern of sectionPatterns) {
      const match = html.match(pattern);
      if (match) {
        const value = match[1].trim();
        result.spacing.sectionPadding = value;
        
        // Determine density
        const numValue = parseInt(value);
        if (numValue < 40) result.spacing.density = 'compact';
        else if (numValue > 100) result.spacing.density = 'spacious';
        break;
      }
    }
    
    // Gap/grid spacing
    const gapPattern = /gap:\s*([^;}]+)/gi;
    const gapMatch = html.match(gapPattern);
    if (gapMatch) {
      result.spacing.gap = gapMatch[1].trim();
    }

    // ============================================
    // 4. EXTRACT COMPONENT STYLES
    // ============================================
    
    // Button radius
    const buttonRadiusPatterns = [
      /\.(?:btn|button)[^{]*\{[^}]*border-radius:\s*([^;}]+)/gi,
      /button[^{]*\{[^}]*border-radius:\s*([^;}]+)/gi,
    ];
    for (const pattern of buttonRadiusPatterns) {
      const match = html.match(pattern);
      if (match) {
        result.components.buttonRadius = match[1].trim();
        
        // Determine button style
        const radius = parseInt(match[1]);
        if (radius >= 9999 || match[1].includes('full')) {
          result.components.buttonRadius = '9999px';
        }
        break;
      }
    }
    
    // Button style (gradient, outline, etc.)
    if (html.match(/\.(?:btn|button)[^{]*\{[^}]*background:\s*linear-gradient/i)) {
      result.components.buttonStyle = 'gradient';
    } else if (html.match(/\.(?:btn|button)[^{]*\{[^}]*border:\s*[^0]/i)) {
      result.components.buttonStyle = 'outline';
    }
    
    // Card styles
    const cardPatterns = [
      /\.(?:card)[^{]*\{[^}]*border-radius:\s*([^;}]+)/gi,
    ];
    for (const pattern of cardPatterns) {
      const match = html.match(pattern);
      if (match) {
        result.components.cardRadius = match[1].trim();
        break;
      }
    }
    
    // Card shadow
    const cardShadowPattern = /\.(?:card)[^{]*\{[^}]*box-shadow:\s*([^;}]+)/gi;
    const cardShadowMatch = html.match(cardShadowPattern);
    if (cardShadowMatch) {
      result.components.cardShadow = cardShadowMatch[1].trim();
    }
    
    // Card border
    if (html.match(/\.(?:card)[^{]*\{[^}]*border:\s*[^0none]/i)) {
      result.components.cardBorder = true;
    }

    // ============================================
    // 5. DETECT VISUAL EFFECTS
    // ============================================
    
    // Gradients
    if (html.match(/linear-gradient|radial-gradient/i)) {
      result.effects.hasGradients = true;
    }
    
    // Glassmorphism (backdrop-filter)
    if (html.match(/backdrop-filter:\s*blur/i)) {
      result.effects.hasGlassmorphism = true;
    }
    
    // Shadow intensity
    const shadowMatches = html.matchAll(/box-shadow:\s*([^;}]+)/gi);
    let maxShadowBlur = 0;
    for (const match of shadowMatches) {
      const blurMatch = match[1].match(/(\d+)px/g);
      if (blurMatch && blurMatch.length >= 3) {
        const blur = parseInt(blurMatch[2]);
        if (blur > maxShadowBlur) maxShadowBlur = blur;
      }
    }
    if (maxShadowBlur > 30) result.effects.shadowIntensity = 'dramatic';
    else if (maxShadowBlur < 10) result.effects.shadowIntensity = 'subtle';

    // ============================================
    // 6. CLASSIFY MOOD
    // ============================================
    
    // Analyze collected data to determine mood
    const classifyMood = (): StyleInspiration['mood']['primary'] => {
      // High contrast + bold colors = bold
      if (result.effects.hasGradients && getColorVibrancy(result.colors.primary || '') > 0.5) {
        return 'bold';
      }
      
      // Glassmorphism + subtle shadows = tech
      if (result.effects.hasGlassmorphism) {
        return 'tech';
      }
      
      // Serif fonts = elegant
      const serifFonts = ['Playfair', 'Georgia', 'Merriweather', 'Lora', 'Serif'];
      if (serifFonts.some(f => result.typography.headingFont.includes(f))) {
        return 'elegant';
      }
      
      // Spacious layout + subtle effects = minimal
      if (result.spacing.density === 'spacious' && result.effects.shadowIntensity === 'subtle') {
        return 'minimal';
      }
      
      // Rounded buttons + bright colors = playful
      if (result.components.buttonRadius.includes('9999') || parseInt(result.components.buttonRadius) > 20) {
        const primary = result.colors.primary;
        if (primary && getColorVibrancy(primary) > 0.6) {
          return 'playful';
        }
      }
      
      // Creative agencies often have dramatic shadows
      if (result.effects.shadowIntensity === 'dramatic') {
        return 'creative';
      }
      
      return 'corporate';
    };
    
    result.mood.primary = classifyMood();
    
    // Determine contrast level
    if (result.colors.primary && result.colors.background) {
      const primaryLum = getColorLuminance(result.colors.primary);
      const bgLum = getColorLuminance(result.colors.background);
      const contrast = Math.abs(primaryLum - bgLum);
      
      if (contrast > 0.7) result.mood.contrast = 'high';
      else if (contrast < 0.3) result.mood.contrast = 'low';
    }
    
    // Update confidence based on data quality
    const hasColors = result.colors.primary !== null;
    const hasFonts = result.typography.headingFont !== 'Inter';
    const hasComponents = result.components.buttonRadius !== '8px';
    
    if (hasColors && hasFonts && hasComponents) {
      result.extractionConfidence = 'high';
    } else if (hasColors || hasFonts) {
      result.extractionConfidence = 'medium';
    }

    console.log('[extract-style-inspiration] Result:', {
      mood: result.mood,
      colors: result.colors.primary,
      typography: result.typography.headingFont,
      confidence: result.extractionConfidence,
    });

    return new Response(JSON.stringify({
      success: true,
      ...result,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[extract-style-inspiration] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze website';
    const origin = req.headers.get('Origin');
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 200,
      headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' }
    });
  }
});
