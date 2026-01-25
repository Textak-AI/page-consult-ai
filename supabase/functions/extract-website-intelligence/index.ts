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
      pageCopy: null as string | null,
      sourceUrl: normalizedUrl,
      isMinimalBrand: false,
      extractionConfidence: 'low' as 'high' | 'medium' | 'low',
      allExtractedColors: [] as string[] // Track colors before filtering for minimal brand detection
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
    const allExtractedColors: string[] = []; // Track ALL colors before filtering
    
    // Priority 1: Meta theme-color (track even if excluded for minimal brand detection)
    const themeColor = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i)
                    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']theme-color["']/i);
    if (themeColor) {
      allExtractedColors.push(themeColor[1]);
      if (!isExcludedColor(themeColor[1])) {
        collectedColors.push(themeColor[1]);
        console.log('[extract] Color from theme-color:', themeColor[1]);
      }
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
        allExtractedColors.push(match[1]);
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
        allExtractedColors.push(match[1]);
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
        allExtractedColors.push(match[1]);
        if (!isExcludedColor(match[1])) {
          collectedColors.push(match[1]);
        }
      }
    }
    
    // Deduplicate
    const uniqueColors = [...new Set(collectedColors)].slice(0, 5);
    const uniqueAllColors = [...new Set(allExtractedColors.map(c => c.toLowerCase()))].slice(0, 5);
    
    // Detect minimal/monochromatic brand - has colors but all were filtered out
    if (uniqueAllColors.length > 0 && uniqueColors.length === 0) {
      extractedData.isMinimalBrand = true;
      // For minimal brands, use their actual monochromatic colors
      extractedData.brandColors = uniqueAllColors;
      extractedData.extractionConfidence = 'medium';
      console.log('[extract] Minimal brand detected, using monochromatic colors:', uniqueAllColors);
    } else {
      extractedData.brandColors = uniqueColors;
      extractedData.extractionConfidence = uniqueColors.length > 0 ? 'high' : 'low';
    }
    
    extractedData.allExtractedColors = uniqueAllColors;
    console.log('[extract] Final colors:', extractedData.brandColors, 'isMinimalBrand:', extractedData.isMinimalBrand);

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

    return new Response(JSON.stringify({
      success: true,
      // Flatten the response for easier consumption
      companyName: extractedData.companyName,
      logoUrl: extractedData.logoUrl,
      brandColors: extractedData.brandColors,
      fonts: extractedData.fonts,
      title: extractedData.title,
      tagline: extractedData.tagline,
      description: extractedData.description,
      heroText: extractedData.heroText,
      testimonials: extractedData.testimonials,
      pageCopy: extractedData.pageCopy?.slice(0, 1000), // Limit size
      sourceUrl: extractedData.sourceUrl,
      isMinimalBrand: extractedData.isMinimalBrand,
      extractionConfidence: extractedData.extractionConfidence,
      inferredIndustry, // Add inferred industry
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
