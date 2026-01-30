import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

/**
 * STYLE INTELLIGENCE - Website Inspiration Extraction
 * 
 * Phase 1: CSS-based extraction (current approach)
 * Phase 2: Vision AI analysis using Gemini for deeper pattern recognition
 * 
 * Extracts full visual DNA from inspiration websites:
 * - Colors (primary, secondary, accent, background, text)
 * - Typography (heading font, body font, weights, sizes)
 * - Spacing (section padding, card padding, gaps)
 * - Button styles (shapes, shadows, hover effects)
 * - Card styles (borders, shadows, radius)
 * - Mood classification (minimal, bold, elegant, playful, etc.)
 * - Visual patterns (via Vision AI)
 */

// ============================================
// COLOR UTILITIES
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
  
  const rgbMatch = trimmed.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return rgbToHex(parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3]));
  }
  
  const hslMatch = trimmed.match(/hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360;
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }
  
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
// VISION AI ANALYSIS
// ============================================

interface VisionAnalysisResult {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  textColor?: string;
  backgroundColor?: string;
  temperature?: 'neutral' | 'monochrome' | 'warm' | 'cool';
  fontStyle?: 'bold' | 'light' | 'serif' | 'sans-serif' | 'display';
  spacing?: 'tight' | 'compact' | 'spacious';
  texture?: 'high' | 'medium' | 'subtle';
  layout?: 'balanced' | 'information-rich';
  contrast?: 'high' | 'medium' | 'low';
  imageStyle?: 'full-bleed' | 'contained' | 'mixed';
  elements?: 'geometric' | 'organic' | 'abstract';
  vibe?: 'luxurious' | 'minimalist' | 'playful' | 'professional' | 'tech' | 'creative';
  patterns?: string[];
  confidence: 'high' | 'medium' | 'low';
}

async function captureScreenshot(url: string): Promise<string | null> {
  try {
    // Use microlink.io API (free tier) for reliable screenshots
    console.log('[Vision AI] Capturing screenshot via microlink...');
    
    // Note: Do NOT use embed parameter - it redirects to raw image
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&waitForTimeout=3000`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.log('[Vision AI] Microlink API returned:', response.status);
      return null;
    }
    
    const contentType = response.headers.get('content-type') || '';
    
    // Handle JSON response
    if (contentType.includes('application/json')) {
      const data = await response.json();
      const screenshotUrl = data?.data?.screenshot?.url;
      
      if (screenshotUrl) {
        console.log('[Vision AI] Got screenshot URL, fetching image...');
        
        // Fetch the actual screenshot image
        const imageResponse = await fetch(screenshotUrl);
        if (!imageResponse.ok) {
          console.log('[Vision AI] Failed to fetch screenshot image');
          return null;
        }
        
        const imageBuffer = await imageResponse.arrayBuffer();
        const uint8Array = new Uint8Array(imageBuffer);
        
        // Convert to base64 in chunks to avoid call stack issues with large images
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        const base64 = btoa(binary);
        
        console.log('[Vision AI] Screenshot captured successfully, size:', Math.round(base64.length / 1024), 'KB');
        return base64;
      } else {
        console.log('[Vision AI] No screenshot URL in response:', JSON.stringify(data).substring(0, 200));
      }
    } else {
      console.log('[Vision AI] Unexpected content type:', contentType);
    }
    
    return null;
  } catch (error) {
    console.error('[Vision AI] Screenshot capture failed:', error);
    return null;
  }
}

async function analyzeWithVisionAI(screenshotBase64: string): Promise<VisionAnalysisResult | null> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    console.log('[Vision AI] LOVABLE_API_KEY not configured, skipping vision analysis');
    return null;
  }

  try {
    const systemPrompt = `You are a senior UI/UX designer analyzing a website screenshot to extract its visual DNA. 
Your job is to identify the exact design patterns and styles used.

Analyze the screenshot and return a JSON object with these fields:
- primaryColor: The main brand/CTA color as a hex code (e.g., "#3B82F6")
- secondaryColor: Secondary brand color as hex
- accentColor: Accent/highlight color as hex
- textColor: Main text color as hex
- backgroundColor: Background color as hex
- temperature: "neutral" | "monochrome" | "warm" | "cool"
- fontStyle: "bold" | "light" | "serif" | "sans-serif" | "display"
- spacing: "tight" | "compact" | "spacious"
- texture: "high" | "medium" | "subtle" (visual complexity)
- layout: "balanced" | "information-rich"
- contrast: "high" | "medium" | "low"
- imageStyle: "full-bleed" | "contained" | "mixed"
- elements: "geometric" | "organic" | "abstract"
- vibe: "luxurious" | "minimalist" | "playful" | "professional" | "tech" | "creative"
- patterns: Array of design patterns you recognize (e.g., ["Stripe", "Linear", "Apple", "Notion"])
- confidence: "high" | "medium" | "low" based on how clear the design patterns are

Return ONLY valid JSON, no markdown or explanation.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${screenshotBase64}`
                }
              },
              {
                type: 'text',
                text: 'Analyze this website screenshot and extract its visual DNA. Return only valid JSON.'
              }
            ]
          }
        ],
        max_tokens: 1000,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Vision AI] API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('[Vision AI] No content in response');
      return null;
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    const result = JSON.parse(jsonStr.trim());
    console.log('[Vision AI] Analysis result:', result);
    return result;
  } catch (error) {
    console.error('[Vision AI] Analysis failed:', error);
    return null;
  }
}

// ============================================
// STYLE INSPIRATION INTERFACE
// ============================================

interface StyleInspiration {
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
  
  typography: {
    headingFont: string;
    bodyFont: string;
    headingWeight: string;
    bodyWeight: string;
    headingSizes: { h1: string; h2: string; h3: string };
  };
  
  spacing: {
    sectionPadding: string;
    cardPadding: string;
    gap: string;
    density: 'compact' | 'normal' | 'spacious';
  };
  
  components: {
    buttonRadius: string;
    buttonStyle: 'solid' | 'outline' | 'ghost' | 'gradient';
    cardRadius: string;
    cardShadow: string;
    cardBorder: boolean;
  };
  
  effects: {
    hasGradients: boolean;
    hasGlassmorphism: boolean;
    hasShadows: boolean;
    shadowIntensity: 'subtle' | 'medium' | 'dramatic';
  };
  
  mood: {
    primary: 'minimal' | 'bold' | 'elegant' | 'playful' | 'corporate' | 'creative' | 'tech';
    colorMode: 'light' | 'dark';
    contrast: 'low' | 'medium' | 'high';
  };
  
  // Vision AI enrichment
  visionAnalysis?: {
    temperature?: string;
    fontStyle?: string;
    texture?: string;
    layout?: string;
    imageStyle?: string;
    elements?: string;
    vibe?: string;
    patterns?: string[];
  };
  
  sourceUrl: string;
  screenshotUrl?: string;
  extractionConfidence: 'high' | 'medium' | 'low';
}

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const { url, useVisionAI = true } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    let normalizedUrl = url;
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    console.log('[extract-style-inspiration] Fetching:', normalizedUrl);

    // Fetch HTML for CSS-based analysis
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
    
    // Initialize result with defaults
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
    // PHASE 1: CSS-BASED EXTRACTION
    // ============================================
    
    const collectedColors: Array<{ color: string; role: string; priority: number }> = [];
    
    // CSS Variables (highest priority)
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
    
    // Text colors
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
    
    // Color mode
    if (result.colors.background) {
      result.mood.colorMode = getColorLuminance(result.colors.background) > 0.5 ? 'light' : 'dark';
    }

    // Typography extraction
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
    }

    // Component styles
    const buttonRadiusPatterns = [
      /\.(?:btn|button)[^{]*\{[^}]*border-radius:\s*([^;}]+)/gi,
      /button[^{]*\{[^}]*border-radius:\s*([^;}]+)/gi,
    ];
    for (const pattern of buttonRadiusPatterns) {
      const match = html.match(pattern);
      if (match) {
        result.components.buttonRadius = match[1].trim();
        break;
      }
    }
    
    if (html.match(/\.(?:btn|button)[^{]*\{[^}]*background:\s*linear-gradient/i)) {
      result.components.buttonStyle = 'gradient';
    } else if (html.match(/\.(?:btn|button)[^{]*\{[^}]*border:\s*[^0]/i)) {
      result.components.buttonStyle = 'outline';
    }

    // Visual effects
    if (html.match(/linear-gradient|radial-gradient/i)) {
      result.effects.hasGradients = true;
    }
    if (html.match(/backdrop-filter:\s*blur/i)) {
      result.effects.hasGlassmorphism = true;
    }

    // ============================================
    // PHASE 2: VISION AI ENHANCEMENT
    // ============================================
    
    if (useVisionAI) {
      console.log('[extract-style-inspiration] Attempting Vision AI analysis...');
      
      const screenshotBase64 = await captureScreenshot(normalizedUrl);
      
      if (screenshotBase64) {
        const visionResult = await analyzeWithVisionAI(screenshotBase64);
        
        if (visionResult) {
          // Merge Vision AI results with CSS-based extraction
          // Vision AI colors take priority if CSS extraction failed
          if (!result.colors.primary && visionResult.primaryColor) {
            result.colors.primary = visionResult.primaryColor;
          }
          if (!result.colors.secondary && visionResult.secondaryColor) {
            result.colors.secondary = visionResult.secondaryColor;
          }
          if (!result.colors.accent && visionResult.accentColor) {
            result.colors.accent = visionResult.accentColor;
          }
          if (!result.colors.background && visionResult.backgroundColor) {
            result.colors.background = visionResult.backgroundColor;
          }
          if (!result.colors.text && visionResult.textColor) {
            result.colors.text = visionResult.textColor;
          }
          
          // Map Vision AI vibe to mood
          if (visionResult.vibe) {
            const vibeToMood: Record<string, StyleInspiration['mood']['primary']> = {
              'luxurious': 'elegant',
              'minimalist': 'minimal',
              'playful': 'playful',
              'professional': 'corporate',
              'tech': 'tech',
              'creative': 'creative',
            };
            result.mood.primary = vibeToMood[visionResult.vibe] || result.mood.primary;
          }
          
          // Map Vision AI spacing
          if (visionResult.spacing) {
            const spacingMap: Record<string, StyleInspiration['spacing']['density']> = {
              'tight': 'compact',
              'compact': 'compact',
              'spacious': 'spacious',
            };
            result.spacing.density = spacingMap[visionResult.spacing] || 'normal';
          }
          
          // Map Vision AI contrast
          if (visionResult.contrast) {
            result.mood.contrast = visionResult.contrast as 'low' | 'medium' | 'high';
          }
          
          // Store additional vision analysis data
          result.visionAnalysis = {
            temperature: visionResult.temperature,
            fontStyle: visionResult.fontStyle,
            texture: visionResult.texture,
            layout: visionResult.layout,
            imageStyle: visionResult.imageStyle,
            elements: visionResult.elements,
            vibe: visionResult.vibe,
            patterns: visionResult.patterns,
          };
          
          // Boost confidence if vision analysis succeeded
          if (visionResult.confidence === 'high') {
            result.extractionConfidence = 'high';
          } else if (result.extractionConfidence === 'low') {
            result.extractionConfidence = 'medium';
          }
          
          console.log('[Vision AI] Enhanced with patterns:', visionResult.patterns);
        }
      }
    }

    // ============================================
    // FINAL MOOD CLASSIFICATION
    // ============================================
    
    const classifyMood = (): StyleInspiration['mood']['primary'] => {
      if (result.visionAnalysis?.vibe) {
        const vibeMap: Record<string, StyleInspiration['mood']['primary']> = {
          'luxurious': 'elegant',
          'minimalist': 'minimal', 
          'playful': 'playful',
          'professional': 'corporate',
          'tech': 'tech',
          'creative': 'creative',
        };
        return vibeMap[result.visionAnalysis.vibe] || 'corporate';
      }
      
      if (result.effects.hasGradients && getColorVibrancy(result.colors.primary || '') > 0.5) {
        return 'bold';
      }
      if (result.effects.hasGlassmorphism) {
        return 'tech';
      }
      
      const serifFonts = ['Playfair', 'Georgia', 'Merriweather', 'Lora', 'Serif'];
      if (serifFonts.some(f => result.typography.headingFont.includes(f))) {
        return 'elegant';
      }
      
      if (result.spacing.density === 'spacious' && result.effects.shadowIntensity === 'subtle') {
        return 'minimal';
      }
      
      return 'corporate';
    };
    
    result.mood.primary = classifyMood();
    
    // Update confidence based on data quality
    const hasColors = result.colors.primary !== null;
    const hasFonts = result.typography.headingFont !== 'Inter';
    const hasVision = !!result.visionAnalysis;
    
    if (hasColors && hasFonts && hasVision) {
      result.extractionConfidence = 'high';
    } else if ((hasColors && hasFonts) || hasVision) {
      result.extractionConfidence = 'medium';
    }

    console.log('[extract-style-inspiration] Complete:', {
      mood: result.mood,
      colors: result.colors.primary,
      typography: result.typography.headingFont,
      visionPatterns: result.visionAnalysis?.patterns,
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
