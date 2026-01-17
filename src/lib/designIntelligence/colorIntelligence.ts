/**
 * COLOR INTELLIGENCE SYSTEM
 * 
 * Industry-specific palettes + emotional driver overrides.
 * Based on B2B conversion research showing 90% of initial judgments are color-based.
 */

export type ColorPalette = {
  mode: 'light' | 'dark' | 'warm';
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  ctaBackground: string;
  ctaText: string;
  reasoning: string;
};

export type EmotionalDriver = 'urgency' | 'protection' | 'growth' | 'transformation' | 'premium';

// Industry base palettes
const INDUSTRY_PALETTES: Record<string, ColorPalette> = {
  healthcare: {
    mode: 'light',
    primary: '#0D9488',      // Teal - clinical trust
    secondary: '#1E3A5F',    // Navy - stability
    accent: '#10B981',       // Green - positive outcomes
    background: '#F8FAFC',
    foreground: '#0F172A',
    muted: '#64748B',
    ctaBackground: '#0D9488',
    ctaText: '#FFFFFF',
    reasoning: 'Cool, muted tones increase perceived trust and privacy in healthcare contexts'
  },
  cybersecurity: {
    mode: 'dark',
    primary: '#3B82F6',      // Blue - protection
    secondary: '#1E3A5F',    // Navy - security authority
    accent: '#06B6D4',       // Cyan - tech modern
    background: '#0F172A',
    foreground: '#F1F5F9',
    muted: '#94A3B8',
    ctaBackground: '#10B981',
    ctaText: '#FFFFFF',
    reasoning: 'Dark mode signals technical sophistication; blue conveys protection'
  },
  finance: {
    mode: 'light',
    primary: '#1E3A5F',      // Navy - stability, trust
    secondary: '#0F766E',    // Teal - growth
    accent: '#10B981',       // Green - positive financial
    background: '#FFFFFF',
    foreground: '#0F172A',
    muted: '#64748B',
    ctaBackground: '#1E3A5F',
    ctaText: '#FFFFFF',
    reasoning: 'Blue dominates finance for trust/stability; green signals growth'
  },
  saas: {
    mode: 'dark',
    primary: '#7C3AED',      // Purple - innovation
    secondary: '#1E293B',    // Slate - professional
    accent: '#06B6D4',       // Cyan - modern tech
    background: '#0F172A',
    foreground: '#F1F5F9',
    muted: '#94A3B8',
    ctaBackground: '#7C3AED',
    ctaText: '#FFFFFF',
    reasoning: 'Purple/cyan signal innovation while maintaining professionalism'
  },
  consulting: {
    mode: 'light',
    primary: '#1E3A5F',      // Navy - authority
    secondary: '#374151',    // Gray - seriousness
    accent: '#D97706',       // Gold - premium subtle
    background: '#FFFFFF',
    foreground: '#0F172A',
    muted: '#6B7280',
    ctaBackground: '#1E3A5F',
    ctaText: '#FFFFFF',
    reasoning: 'Navy + charcoal builds authority; gold accent for premium positioning'
  },
  manufacturing: {
    mode: 'light',
    primary: '#0369A1',      // Industrial blue
    secondary: '#374151',    // Steel gray
    accent: '#EA580C',       // Safety orange
    background: '#F8FAFC',
    foreground: '#0F172A',
    muted: '#6B7280',
    ctaBackground: '#0369A1',
    ctaText: '#FFFFFF',
    reasoning: 'Industrial palette signals capability, reliability, and safety'
  },
  creative: {
    mode: 'dark',
    primary: '#8B5CF6',      // Purple - creativity, innovation
    secondary: '#0F172A',    // Deep slate - sophistication
    accent: '#F97316',       // Orange - energy, bold expression
    background: '#0A0A0F',   // Near-black - gallery feel
    foreground: '#F8FAFC',
    muted: '#94A3B8',
    ctaBackground: '#8B5CF6',
    ctaText: '#FFFFFF',
    reasoning: 'Dark mode signals creative sophistication; purple conveys creativity and transformation'
  },
  agency: {
    mode: 'dark',
    primary: '#8B5CF6',      // Purple - creativity
    secondary: '#1E293B',    // Slate - professional
    accent: '#06B6D4',       // Cyan - modern, digital
    background: '#0F172A',
    foreground: '#F1F5F9',
    muted: '#94A3B8',
    ctaBackground: '#8B5CF6',
    ctaText: '#FFFFFF',
    reasoning: 'Creative agency palette with dark sophistication and vibrant accents'
  },
  coaching: {
    mode: 'warm',
    primary: '#7C3AED',      // Purple - transformation
    secondary: '#4F46E5',    // Indigo - depth
    accent: '#F59E0B',       // Warm amber - energy
    background: '#FFFBEB',
    foreground: '#1F2937',
    muted: '#6B7280',
    ctaBackground: '#7C3AED',
    ctaText: '#FFFFFF',
    reasoning: 'Warmer tones signal transformation and human connection'
  },
  technology: {
    mode: 'dark',
    primary: '#3B82F6',      // Blue - trust
    secondary: '#1E293B',    // Slate
    accent: '#10B981',       // Green - growth
    background: '#0F172A',
    foreground: '#F1F5F9',
    muted: '#94A3B8',
    ctaBackground: '#3B82F6',
    ctaText: '#FFFFFF',
    reasoning: 'Tech-forward dark mode with trust-building blue'
  }
};

// Emotional driver accent overrides
const EMOTIONAL_ACCENTS: Record<EmotionalDriver, { color: string; reasoning: string }> = {
  urgency: {
    color: '#F59E0B',  // Amber - urgency without alarm
    reasoning: 'Amber creates urgency without the anxiety spike of red'
  },
  protection: {
    color: '#3B82F6',  // Blue - shield, safety
    reasoning: 'Blue conveys protection and security'
  },
  growth: {
    color: '#10B981',  // Green - positive outcomes
    reasoning: 'Green signals growth and positive financial/business outcomes'
  },
  transformation: {
    color: '#7C3AED',  // Purple - change, evolution
    reasoning: 'Purple represents transformation and breakthrough'
  },
  premium: {
    color: '#D97706',  // Gold - exclusive
    reasoning: 'Gold suggests premium positioning and exclusivity'
  }
};

// Emotional driver detection patterns
const EMOTIONAL_PATTERNS: Record<EmotionalDriver, string[]> = {
  urgency: ['risk', 'fine', 'penalty', 'deadline', 'urgent', 'critical', 'immediately', 'before', 'breach', 'threat'],
  protection: ['protect', 'secure', 'shield', 'prevent', 'safe', 'guard', 'defense', 'compliance'],
  growth: ['grow', 'increase', 'scale', 'expand', 'revenue', 'profit', 'ROI', 'improve'],
  transformation: ['transform', 'change', 'evolve', 'breakthrough', 'reimagine', 'revolutionize'],
  premium: ['exclusive', 'boutique', 'premium', 'luxury', 'high-end', 'elite', 'select']
};

export function detectIndustry(text: string): string {
  const lowered = text.toLowerCase();
  
  // Industry detection patterns - order matters! Check more specific first
  const patterns: Record<string, string[]> = {
    // Creative/branding agencies - check FIRST (before consulting)
    creative: ['branding', 'brand agency', 'creative agency', 'design agency', 'brand strategy', 
               'visual identity', 'brand identity', 'translate into brands', 'brand studio',
               'creative studio', 'brand design', 'brand consultancy', 'rebranding', 'rebrand'],
    agency: ['agency', 'advertising', 'marketing agency', 'digital agency'],
    healthcare: ['healthcare', 'hospital', 'clinic', 'patient', 'medical', 'HIPAA', 'health', 'clinical', 'physician'],
    cybersecurity: ['cybersecurity', 'security', 'penetration', 'vulnerability', 'breach', 'hacker', 'threat', 'SOC'],
    finance: ['finance', 'financial', 'bank', 'investment', 'wealth', 'insurance', 'fintech', 'trading'],
    saas: ['SaaS', 'software', 'platform', 'app', 'subscription', 'cloud', 'API'],
    consulting: ['consulting', 'consultant', 'advisory', 'management consulting'],
    manufacturing: ['manufacturing', 'factory', 'production', 'supply chain', 'industrial', 'warehouse'],
    coaching: ['coaching', 'coach', 'mentor', 'training', 'development', 'leadership'],
    technology: ['tech', 'developer', 'devops', 'engineering', 'startup']
  };

  const scores: Record<string, number> = {};
  
  for (const [industry, keywords] of Object.entries(patterns)) {
    scores[industry] = keywords.filter(kw => lowered.includes(kw.toLowerCase())).length;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const detected = sorted[0][1] > 0 ? sorted[0][0] : 'saas'; // Default to SaaS
  
  console.log('🎨 [SDI] Industry detected:', detected, scores);
  return detected;
}

export function detectEmotionalDrivers(text: string): EmotionalDriver[] {
  const lowered = text.toLowerCase();
  const detected: EmotionalDriver[] = [];

  for (const [driver, patterns] of Object.entries(EMOTIONAL_PATTERNS)) {
    const matches = patterns.filter(p => lowered.includes(p.toLowerCase())).length;
    if (matches >= 2) {
      detected.push(driver as EmotionalDriver);
    }
  }

  console.log('🎨 [SDI] Emotional drivers detected:', detected);
  return detected;
}

export function getColorPalette(
  industry: string, 
  targetMarket?: string,
  emotionalDrivers: EmotionalDriver[] = []
): ColorPalette {
  // Check for industry combination (e.g., healthcare + cybersecurity)
  let baseIndustry = industry;
  
  // Healthcare overrides dark mode for trust
  if (targetMarket?.toLowerCase().includes('healthcare') || industry === 'healthcare') {
    if (industry === 'cybersecurity') {
      // Healthcare + Cybersecurity = light mode with cybersecurity authority
      const palette = { ...INDUSTRY_PALETTES.healthcare };
      palette.secondary = '#1E3A5F'; // Add security navy
      palette.reasoning = 'Healthcare trust requirement overrides cybersecurity dark mode; navy adds security authority';
      console.log('🎨 [SDI] Color palette: healthcare+cybersecurity hybrid');
      return applyEmotionalOverrides(palette, emotionalDrivers);
    }
    baseIndustry = 'healthcare';
  }

  const palette = INDUSTRY_PALETTES[baseIndustry] || INDUSTRY_PALETTES.saas;
  console.log('🎨 [SDI] Color palette:', baseIndustry);
  
  return applyEmotionalOverrides(palette, emotionalDrivers);
}

function applyEmotionalOverrides(palette: ColorPalette, drivers: EmotionalDriver[]): ColorPalette {
  if (drivers.length === 0) return palette;

  const result = { ...palette };
  
  // Primary emotional driver affects accent
  const primaryDriver = drivers[0];
  if (EMOTIONAL_ACCENTS[primaryDriver]) {
    // Don't override accent for healthcare if it would be red/orange (causes anxiety)
    if (palette.mode === 'light' && primaryDriver === 'urgency') {
      // Use amber for CTA instead of accent
      result.ctaBackground = EMOTIONAL_ACCENTS.urgency.color;
      result.reasoning += `. CTA uses amber for urgency without anxiety.`;
    } else {
      result.accent = EMOTIONAL_ACCENTS[primaryDriver].color;
      result.reasoning += `. ${EMOTIONAL_ACCENTS[primaryDriver].reasoning}`;
    }
  }

  return result;
}
