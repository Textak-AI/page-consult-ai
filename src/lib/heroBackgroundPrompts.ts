/**
 * Smart Hero Background Search Queries
 * 
 * Transforms generic industry names into specific, visual search queries
 * that return high-quality hero images from Unsplash.
 */

export interface HeroPromptContext {
  industry: string;
  subIndustry?: string;
  pageType?: 'customer-acquisition' | 'beta-prelaunch' | 'product-launch' | 'lead-gen';
  tone?: 'confident' | 'friendly' | 'professional' | 'innovative' | 'trusted';
}

interface IndustryVisuals {
  primary: string[];
  secondary: string[];
  style: string[];
}

// Industry-specific visual themes
const INDUSTRY_VISUALS: Record<string, IndustryVisuals> = {
  'saas': {
    primary: ['modern office workspace', 'technology interface', 'digital collaboration', 'abstract data visualization'],
    secondary: ['team meeting laptop', 'clean desk minimal', 'glass office building'],
    style: ['minimal', 'professional', 'bright', 'modern'],
  },
  'marketing': {
    primary: ['creative workspace', 'marketing strategy whiteboard', 'data dashboard screen', 'team brainstorm'],
    secondary: ['analytics display', 'growth chart', 'creative office'],
    style: ['dynamic', 'colorful', 'energetic', 'professional'],
  },
  'environmental': {
    primary: ['nature restoration', 'clean water landscape', 'green technology', 'sustainable industry'],
    secondary: ['earth conservation', 'environmental professional', 'clean energy'],
    style: ['natural', 'hopeful', 'professional', 'documentary'],
  },
  'consulting': {
    primary: ['executive meeting', 'strategy session', 'professional handshake', 'business discussion'],
    secondary: ['conference room', 'mentor coaching', 'presentation'],
    style: ['premium', 'trustworthy', 'warm', 'professional'],
  },
  'healthcare': {
    primary: ['medical professional', 'healthcare technology', 'modern clinic', 'patient care'],
    secondary: ['doctor consultation', 'health innovation', 'wellness'],
    style: ['clean', 'trustworthy', 'caring', 'professional'],
  },
  'finance': {
    primary: ['financial district', 'modern banking', 'secure technology', 'wealth management'],
    secondary: ['city skyline', 'business professional', 'digital finance'],
    style: ['prestigious', 'secure', 'modern', 'trustworthy'],
  },
  'education': {
    primary: ['modern learning', 'workshop training', 'knowledge sharing', 'student success'],
    secondary: ['online learning', 'skill development', 'classroom modern'],
    style: ['inspiring', 'bright', 'hopeful', 'engaging'],
  },
  'realestate': {
    primary: ['modern architecture', 'luxury interior', 'city skyline', 'dream home'],
    secondary: ['property investment', 'urban development', 'home buying'],
    style: ['aspirational', 'luxurious', 'bright', 'welcoming'],
  },
  'technology': {
    primary: ['innovation technology', 'futuristic workspace', 'digital transformation', 'tech startup'],
    secondary: ['coding laptop', 'server room', 'artificial intelligence'],
    style: ['cutting-edge', 'modern', 'sleek', 'innovative'],
  },
  'ecommerce': {
    primary: ['online shopping', 'product photography', 'delivery logistics', 'retail technology'],
    secondary: ['packaging boxes', 'warehouse fulfillment', 'mobile commerce'],
    style: ['vibrant', 'modern', 'trustworthy', 'convenient'],
  },
  'fitness': {
    primary: ['gym workout', 'fitness training', 'healthy lifestyle', 'athletic performance'],
    secondary: ['personal trainer', 'yoga wellness', 'sports motivation'],
    style: ['energetic', 'motivating', 'dynamic', 'healthy'],
  },
  'food': {
    primary: ['restaurant kitchen', 'food photography', 'culinary chef', 'dining experience'],
    secondary: ['farm fresh', 'cooking preparation', 'food delivery'],
    style: ['appetizing', 'warm', 'inviting', 'fresh'],
  },
  'legal': {
    primary: ['law office', 'courtroom justice', 'legal consultation', 'professional lawyer'],
    secondary: ['legal documents', 'courthouse architecture', 'client meeting'],
    style: ['authoritative', 'trustworthy', 'professional', 'prestigious'],
  },
  'default': {
    primary: ['modern business', 'professional workspace', 'innovation technology', 'success achievement'],
    secondary: ['team collaboration', 'growth', 'achievement'],
    style: ['professional', 'clean', 'modern', 'trustworthy'],
  },
};

const PAGE_TYPE_MODIFIERS: Record<string, string[]> = {
  'beta-prelaunch': ['futuristic', 'innovative', 'cutting-edge'],
  'customer-acquisition': ['success', 'growth', 'partnership'],
  'product-launch': ['new', 'exciting', 'breakthrough'],
  'lead-gen': ['helpful', 'solution', 'expert'],
};

/**
 * Detect the industry key from industry and sub-industry strings
 */
export function detectIndustryKey(industry: string, subIndustry?: string): string {
  const combined = `${industry} ${subIndustry || ''}`.toLowerCase();
  
  if (combined.includes('saas') || combined.includes('software')) return 'saas';
  if (combined.includes('marketing') || combined.includes('advertising') || combined.includes('sales')) return 'marketing';
  if (combined.includes('environmental') || combined.includes('waste') || combined.includes('sustainability')) return 'environmental';
  if (combined.includes('consulting') || combined.includes('professional service') || combined.includes('advisory')) return 'consulting';
  if (combined.includes('health') || combined.includes('medical') || combined.includes('wellness')) return 'healthcare';
  if (combined.includes('finance') || combined.includes('fintech') || combined.includes('banking') || combined.includes('investment')) return 'finance';
  if (combined.includes('education') || combined.includes('training') || combined.includes('learning') || combined.includes('coaching')) return 'education';
  if (combined.includes('real estate') || combined.includes('property') || combined.includes('realestate')) return 'realestate';
  if (combined.includes('tech') || combined.includes('ai') || combined.includes('startup')) return 'technology';
  if (combined.includes('ecommerce') || combined.includes('retail') || combined.includes('shop')) return 'ecommerce';
  if (combined.includes('fitness') || combined.includes('gym') || combined.includes('sport')) return 'fitness';
  if (combined.includes('food') || combined.includes('restaurant') || combined.includes('culinary')) return 'food';
  if (combined.includes('legal') || combined.includes('law') || combined.includes('attorney')) return 'legal';
  
  return 'default';
}

/**
 * Generate multiple search queries in order of preference
 */
export function generateSearchQueries(context: HeroPromptContext): string[] {
  const industryKey = detectIndustryKey(context.industry, context.subIndustry);
  const config = INDUSTRY_VISUALS[industryKey] || INDUSTRY_VISUALS['default'];
  const pageModifiers = PAGE_TYPE_MODIFIERS[context.pageType || 'customer-acquisition'] || [];
  
  const queries: string[] = [];
  
  // Primary + style (best match)
  queries.push(`${config.primary[0]} ${config.style[0]}`);
  
  // Secondary + different style  
  queries.push(`${config.secondary[0]} ${config.style[1] || config.style[0]}`);
  
  // With page type modifier
  if (pageModifiers[0]) {
    queries.push(`${config.primary[1] || config.primary[0]} ${pageModifiers[0]}`);
  }
  
  // Composition-focused (good for text overlay)
  queries.push(`${config.primary[0]} minimal negative space`);
  
  // Alternative primary
  if (config.primary[2]) {
    queries.push(`${config.primary[2]} ${config.style[0]}`);
  }
  
  // Generic fallback
  queries.push(`${config.style[0]} business professional`);
  
  return queries;
}

/**
 * Build primary and fallback search queries
 */
export function buildHeroSearchQuery(context: HeroPromptContext): {
  primary: string;
  fallback: string;
  all: string[];
} {
  const queries = generateSearchQueries(context);
  return {
    primary: queries[0],
    fallback: queries[queries.length - 1],
    all: queries,
  };
}

/**
 * Transform a legacy generic query into a smarter one
 */
export function enhanceLegacyQuery(query: string): string {
  // Detect industry from legacy query
  const industryKey = detectIndustryKey(query);
  
  if (industryKey !== 'default') {
    const config = INDUSTRY_VISUALS[industryKey];
    return `${config.primary[0]} ${config.style[0]}`;
  }
  
  // If we can't detect, clean up the query
  const cleaned = query
    .replace(/\b(b2b|b2c|saas|api)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned || 'modern business professional minimal';
}
