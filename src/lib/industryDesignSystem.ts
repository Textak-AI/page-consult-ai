/**
 * INDUSTRY DESIGN SYSTEM
 * Research-backed design tokens and trust signal priorities per vertical
 * Based on: Conversion research, color psychology studies, landing page best practices
 */

// ============================================
// TYPES
// ============================================

export type IndustryVariant = 
  | 'default'
  | 'saas'
  | 'saas-enterprise'
  | 'saas-startup'
  | 'fintech'
  | 'healthtech'
  | 'devtools'
  | 'consulting'
  | 'coaching'
  | 'manufacturing'
  | 'healthcare'
  | 'ecommerce'
  | 'creative'
  | 'realestate'
  | 'investor'
  | 'beta';

export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentAlt?: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
}

export interface IndustryTokens {
  mode: 'light' | 'dark';
  colors: ColorPalette;
  cardStyle: 'glass' | 'elevated' | 'bordered' | 'flat';
  borderRadius: 'sharp' | 'medium' | 'rounded';
  typographyWeight: 'light' | 'medium' | 'bold';
  heroStyle: 'gradient-mesh' | 'solid' | 'image-background' | 'split';
  proofTiming: 'immediate' | 'early' | 'mid' | 'deep';
  trustPriorities: string[];
  sectionHeaders: Record<string, { title: string; subtitle: string }>;
  ctaDefaults: { primary: string; secondary: string };
}

// ============================================
// COLOR PALETTES (Research-Based)
// ============================================

const COLOR_PALETTES: Record<string, ColorPalette> = {
  saas: {
    primary: '#6366F1',       // Indigo
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    accent: '#06B6D4',        // Cyan
    background: '#0F172A',    // Slate-900
    surface: '#1E293B',       // Slate-800
    surfaceElevated: '#334155',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },
  
  fintech: {
    primary: '#5167FC',       // Stripe-style blurple
    primaryLight: '#7069FE',
    primaryDark: '#262C62',
    accent: '#4DB6AC',        // Teal
    accentAlt: '#FF7961',     // Coral for transactions
    background: '#292C2F',    // Dark graphite
    surface: '#FCFCFC',
    surfaceElevated: '#FFFFFF',
    textPrimary: '#1F2937',
    textSecondary: '#444444',
    textMuted: '#6B7280',
  },
  
  healthtech: {
    primary: '#0891B2',       // Teal
    primaryLight: '#4FC3F7',
    primaryDark: '#0E7490',
    accent: '#10B981',        // Emerald
    background: '#FFFFFF',
    surface: '#F0FDFA',       // Teal-50
    surfaceElevated: '#CCFBF1',
    textPrimary: '#134E4A',   // Teal-900
    textSecondary: '#0F766E',
    textMuted: '#5EEAD4',
  },
  
  devtools: {
    primary: '#3B82F6',       // Electric blue
    primaryLight: '#60A5FA',
    primaryDark: '#2563EB',
    accent: '#22C55E',        // Neon green
    accentAlt: '#6366F1',     // Purple
    background: '#050816',    // Near black
    surface: '#111827',
    surfaceElevated: '#1F2937',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
  },
  
  consulting: {
    primary: '#1E40AF',       // Professional blue
    primaryLight: '#3B82F6',
    primaryDark: '#1E3A5F',
    accent: '#7C3AED',        // Violet
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceElevated: '#F1F5F9',
    textPrimary: '#1F2937',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
  },
  
  coaching: {
    primary: '#7C3AED',       // Violet
    primaryLight: '#A78BFA',
    primaryDark: '#5B21B6',
    accent: '#CDAE88',        // Soft gold
    accentAlt: '#F59E0B',     // Amber
    background: '#FFFFFF',
    surface: '#FAF5FF',       // Violet-50
    surfaceElevated: '#F5F5DC', // Cream
    textPrimary: '#1F2937',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
  },
  
  manufacturing: {
    primary: '#1E3A5F',       // Industrial navy
    primaryLight: '#3B5998',
    primaryDark: '#0F1729',
    accent: '#F59E0B',        // Safety amber
    accentAlt: '#EA580C',     // Industrial orange
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceElevated: '#E2E8F0',
    textPrimary: '#1E293B',
    textSecondary: '#475569',
    textMuted: '#64748B',
  },
  
  healthcare: {
    primary: '#0EA5E9',       // Sky blue
    primaryLight: '#38BDF8',
    primaryDark: '#0284C7',
    accent: '#14B8A6',        // Teal
    background: '#FFFFFF',
    surface: '#F0F9FF',       // Sky-50
    surfaceElevated: '#E0F2FE',
    textPrimary: '#0C4A6E',
    textSecondary: '#0369A1',
    textMuted: '#7DD3FC',
  },
  
  ecommerce: {
    primary: '#0F172A',       // Dark
    primaryLight: '#1E293B',
    primaryDark: '#020617',
    accent: '#F59E0B',        // CTA orange
    accentAlt: '#22C55E',     // Trust green
    background: '#FFFFFF',
    surface: '#FAFAFA',
    surfaceElevated: '#F5F5F5',
    textPrimary: '#171717',
    textSecondary: '#525252',
    textMuted: '#A3A3A3',
  },
  
  creative: {
    primary: '#EC4899',       // Bold pink
    primaryLight: '#F472B6',
    primaryDark: '#DB2777',
    accent: '#F59E0B',        // Amber
    accentAlt: '#06B6D4',     // Cyan
    background: '#0A0A0A',
    surface: '#171717',
    surfaceElevated: '#262626',
    textPrimary: '#FAFAFA',
    textSecondary: '#A3A3A3',
    textMuted: '#737373',
  },
  
  investor: {
    primary: '#7C3AED',       // Purple
    primaryLight: '#A78BFA',
    primaryDark: '#5B21B6',
    accent: '#06B6D4',        // Cyan
    background: '#0F0F23',
    surface: '#1E1B4B',
    surfaceElevated: '#312E81',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },
  
  realestate: {
    primary: '#059669',       // Emerald
    primaryLight: '#10B981',
    primaryDark: '#047857',
    accent: '#D4AF37',        // Gold
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceElevated: '#ECFDF5',
    textPrimary: '#1F2937',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
  },
  
  beta: {
    primary: '#8B5CF6',       // Violet
    primaryLight: '#A78BFA',
    primaryDark: '#7C3AED',
    accent: '#06B6D4',        // Cyan
    background: '#0F172A',
    surface: '#1E293B',
    surfaceElevated: '#334155',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },
  
  default: {
    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    accent: '#06B6D4',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceElevated: '#334155',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },
};

// ============================================
// TRUST SIGNAL PRIORITIES (Conversion Research)
// ============================================

const TRUST_PRIORITIES: Record<string, string[]> = {
  saas: [
    'metrics',           // "Reduced reporting time by 60%"
    'case-studies',      // Challenge → Solution → Results
    'logos',             // Fortune 500 / recognizable tech
    'security-badges',   // SOC 2, ISO, GDPR
    'free-trial',
    'video-testimonials',
    'written-testimonials',
    'media-mentions',
  ],
  
  'saas-enterprise': [
    'security-badges',   // Non-negotiable for enterprise
    'case-studies',
    'metrics',
    'logos',
    'certifications',
    'video-testimonials',
  ],
  
  fintech: [
    'security-badges',   // SOC 2, PCI, ISO - ESSENTIAL
    'certifications',    // Regulatory affiliations
    'metrics',           // Uptime, fraud reduction
    'logos',             // Banks, fintech partners
    'case-studies',
  ],
  
  healthtech: [
    'security-badges',   // HIPAA, SOC 2, HITRUST
    'certifications',    // Hospital partnerships
    'case-studies',      // Clinical outcomes
    'metrics',
    'logos',
    'written-testimonials',
    'team-credentials',
  ],
  
  devtools: [
    'logos',             // GitHub, Vercel, Notion
    'metrics',           // "Deploy 10× faster"
    'case-studies',      // "How X team uses this"
    'free-trial',
    'written-testimonials',
    'media-mentions',
  ],
  
  consulting: [
    'case-studies',      // Before/after with metrics
    'metrics',           // Revenue growth, ROI
    'written-testimonials', // 58% more likely to convert
    'logos',
    'video-testimonials',
    'team-credentials',
    'media-mentions',
    'guarantee',
  ],
  
  coaching: [
    'case-studies',      // Transformation stories
    'written-testimonials', // Specific outcomes
    'video-testimonials',   // Before → after narratives
    'logos',             // Companies where coachees work
    'team-credentials',
    'metrics',
    'media-mentions',
  ],
  
  manufacturing: [
    'metrics',           // On-time %, defect rates
    'case-studies',      // Downtime reduction
    'logos',             // OEMs, industrial brands
    'certifications',    // ISO 9001, AS9100 - PROMINENT
    'years-in-business', // Longevity matters here
    'written-testimonials',
    'guarantee',
  ],
  
  healthcare: [
    'security-badges',   // HIPAA compliance
    'certifications',
    'case-studies',
    'metrics',
    'logos',
    'written-testimonials',
    'team-credentials',
  ],
  
  ecommerce: [
    'guarantee',         // Returns policy - BIGGEST lever
    'metrics',           // Star ratings, review counts
    'written-testimonials',
    'media-mentions',    // "As seen in"
    'logos',
    'video-testimonials',
    'security-badges',
  ],
  
  creative: [
    'portfolio',         // Work samples ARE the proof
    'logos',
    'case-studies',
    'written-testimonials',
    'media-mentions',
  ],
  
  investor: [
    'traction-metrics',  // ARR, growth, users
    'team-credentials',
    'investor-logos',
    'logos',
    'media-mentions',
  ],
  
  realestate: [
    'metrics',           // Homes sold, volume
    'written-testimonials',
    'case-studies',
    'logos',
    'media-mentions',
    'years-in-business',
  ],
  
  beta: [
    'early-access-perks',
    'founder-story',
    'roadmap',
    'waitlist-count',
  ],
  
  default: [
    'metrics',
    'written-testimonials',
    'logos',
    'case-studies',
  ],
};

// ============================================
// SECTION HEADERS
// ============================================

const SECTION_HEADERS: Record<string, Record<string, { title: string; subtitle: string }>> = {
  saas: {
    features: { title: 'Platform Features', subtitle: 'Everything you need' },
    process: { title: 'How It Works', subtitle: 'Get started in minutes' },
    proof: { title: 'Trusted By', subtitle: 'Teams who love us' },
    problem: { title: 'The Problem', subtitle: '' },
    solution: { title: 'The Solution', subtitle: '' },
    faq: { title: 'FAQ', subtitle: '' },
    cta: { title: 'Ready to Get Started?', subtitle: '' },
  },
  
  consulting: {
    features: { title: 'How We Help', subtitle: 'Our expertise' },
    process: { title: 'Our Approach', subtitle: 'How we work together' },
    proof: { title: 'Client Results', subtitle: 'Proven impact' },
    problem: { title: 'The Challenge', subtitle: '' },
    solution: { title: 'Our Solution', subtitle: '' },
    faq: { title: 'Common Questions', subtitle: '' },
    cta: { title: 'Ready to Talk?', subtitle: 'Start the conversation' },
  },
  
  coaching: {
    features: { title: "What You'll Get", subtitle: 'The transformation' },
    process: { title: 'How It Works', subtitle: 'Your journey' },
    proof: { title: 'Success Stories', subtitle: 'Real transformations' },
    problem: { title: 'Does This Sound Like You?', subtitle: '' },
    solution: { title: "There's a Better Way", subtitle: '' },
    faq: { title: 'Questions', subtitle: '' },
    cta: { title: 'Ready for Change?', subtitle: 'Take the first step' },
  },
  
  manufacturing: {
    features: { title: 'Operational Capabilities', subtitle: 'What we deliver' },
    process: { title: 'Engagement Framework', subtitle: 'How we work' },
    proof: { title: 'Proven Impact', subtitle: 'Measurable results' },
    problem: { title: 'The Challenge', subtitle: '' },
    solution: { title: 'Our Approach', subtitle: '' },
    faq: { title: 'Common Questions', subtitle: '' },
    cta: { title: 'Ready to Optimize?', subtitle: 'Start your assessment' },
    industries: { title: 'Industries Served', subtitle: 'Built for your sector' },
    certifications: { title: 'Certifications', subtitle: 'Quality assured' },
  },
  
  healthcare: {
    features: { title: 'Our Services', subtitle: 'Comprehensive care' },
    process: { title: 'Your Care Journey', subtitle: 'What to expect' },
    proof: { title: 'Patient Stories', subtitle: 'Real experiences' },
    faq: { title: 'Questions & Answers', subtitle: '' },
    cta: { title: 'Your Health Matters', subtitle: 'Take the first step' },
  },
  
  fintech: {
    features: { title: 'Platform Capabilities', subtitle: 'Built for finance' },
    proof: { title: 'Trusted By', subtitle: 'Leading institutions' },
    cta: { title: 'Get Started', subtitle: 'Secure and compliant' },
  },
  
  devtools: {
    features: { title: 'Features', subtitle: 'Built for developers' },
    process: { title: 'Get Started', subtitle: 'Ship in minutes' },
    proof: { title: 'Trusted By', subtitle: 'World-class teams' },
    cta: { title: 'Start Building', subtitle: '' },
  },
  
  ecommerce: {
    features: { title: 'Why Choose Us', subtitle: '' },
    proof: { title: 'Customer Reviews', subtitle: '' },
    problem: { title: 'Tired of...', subtitle: '' },
    solution: { title: 'Introducing', subtitle: '' },
    cta: { title: 'Ready to Order?', subtitle: '' },
  },
  
  creative: {
    features: { title: 'What We Do', subtitle: '' },
    process: { title: 'Our Process', subtitle: '' },
    proof: { title: 'Selected Work', subtitle: '' },
    cta: { title: "Let's Create Together", subtitle: 'Start a project' },
  },
  
  investor: {
    features: { title: 'The Product', subtitle: '' },
    process: { title: 'Go-to-Market', subtitle: '' },
    proof: { title: 'Traction', subtitle: '' },
    problem: { title: 'The Opportunity', subtitle: '' },
    team: { title: 'Leadership', subtitle: '' },
    faq: { title: 'Investment FAQ', subtitle: '' },
    cta: { title: 'Join the Round', subtitle: '' },
  },
  
  realestate: {
    features: { title: 'Our Services', subtitle: 'Full-service real estate' },
    process: { title: 'How We Work', subtitle: 'Your journey to closing' },
    proof: { title: 'Client Success', subtitle: 'What our clients say' },
    cta: { title: 'Find Your Dream Home', subtitle: 'Start your search' },
  },
  
  beta: {
    features: { title: 'Early Adopter Perks', subtitle: 'What you get by joining early' },
    process: { title: 'Roadmap', subtitle: "What's coming" },
    proof: { title: 'Join the Waitlist', subtitle: '' },
    cta: { title: 'Be the First to Know', subtitle: '' },
  },
  
  default: {
    features: { title: 'Why Choose Us', subtitle: '' },
    process: { title: 'How It Works', subtitle: '' },
    proof: { title: 'What People Say', subtitle: '' },
    problem: { title: 'The Problem', subtitle: '' },
    solution: { title: 'The Solution', subtitle: '' },
    faq: { title: 'FAQ', subtitle: '' },
    cta: { title: 'Ready to Start?', subtitle: '' },
  },
};

// ============================================
// CTA DEFAULTS
// ============================================

const CTA_DEFAULTS: Record<string, { primary: string; secondary: string }> = {
  saas: { primary: 'Start Free Trial', secondary: 'Book a Demo' },
  'saas-enterprise': { primary: 'Talk to Sales', secondary: 'See Pricing' },
  fintech: { primary: 'Get Started', secondary: 'See How It Works' },
  healthtech: { primary: 'Schedule a Demo', secondary: 'Learn More' },
  devtools: { primary: 'Start Building', secondary: 'View Docs' },
  consulting: { primary: 'Schedule a Conversation', secondary: 'See Case Studies' },
  coaching: { primary: 'Book Your Call', secondary: 'Watch Free Training' },
  manufacturing: { primary: 'Request a Quote', secondary: 'Download Capabilities' },
  healthcare: { primary: 'Schedule a Consultation', secondary: 'Learn More' },
  ecommerce: { primary: 'Shop Now', secondary: 'See Reviews' },
  creative: { primary: "Let's Create", secondary: 'See Our Work' },
  investor: { primary: 'Request Investment Deck', secondary: 'View Traction' },
  realestate: { primary: 'Schedule a Showing', secondary: 'Browse Listings' },
  beta: { primary: 'Join the Waitlist', secondary: 'Learn More' },
  default: { primary: 'Get Started', secondary: 'Learn More' },
};

// ============================================
// INDUSTRY DETECTION
// ============================================

export function detectIndustryVariant(
  industry?: string,
  industryCategory?: string,
  industrySubcategory?: string,
  pageType?: string
): IndustryVariant {
  
  // Page type overrides everything
  if (pageType === 'investor-relations') return 'investor';
  if (pageType === 'beta-prelaunch') return 'beta';
  
  // Build search string from all available fields
  const searchString = [
    industrySubcategory,
    industryCategory,
    industry
  ].filter(Boolean).join(' ').toLowerCase();
  
  // Sub-industry detection (most specific first)
  
  // Fintech detection
  if (searchString.includes('fintech') || 
      searchString.includes('financial software') ||
      searchString.includes('payment') ||
      searchString.includes('banking software')) {
    return 'fintech';
  }
  
  // Healthtech detection
  if (searchString.includes('healthtech') || 
      searchString.includes('healthcare tech') ||
      searchString.includes('medical software') ||
      searchString.includes('health software')) {
    return 'healthtech';
  }
  
  // Developer tools detection
  if (searchString.includes('devtools') || 
      searchString.includes('developer tool') ||
      searchString.includes('api') ||
      searchString.includes('sdk') ||
      searchString.includes('infrastructure')) {
    return 'devtools';
  }
  
  // Enterprise SaaS detection
  if ((searchString.includes('saas') || searchString.includes('software')) &&
      searchString.includes('enterprise')) {
    return 'saas-enterprise';
  }
  
  // Primary industry detection
  
  if (searchString.includes('saas') || 
      searchString.includes('software as a service') ||
      searchString.includes('tech startup') ||
      searchString.includes('platform')) {
    return 'saas';
  }
  
  if (searchString.includes('manufactur') || 
      searchString.includes('industrial') ||
      searchString.includes('aerospace') ||
      searchString.includes('supply chain') ||
      searchString.includes('precision') ||
      searchString.includes('fabricat') ||
      searchString.includes('oem')) {
    return 'manufacturing';
  }
  
  if (searchString.includes('coach') || 
      searchString.includes('course') ||
      searchString.includes('training') ||
      searchString.includes('mentor') ||
      searchString.includes('speaker') ||
      searchString.includes('author')) {
    return 'coaching';
  }
  
  if (searchString.includes('consult') || 
      searchString.includes('agency') ||
      searchString.includes('professional service') ||
      searchString.includes('advisory') ||
      searchString.includes('accounting') ||
      searchString.includes('legal')) {
    return 'consulting';
  }
  
  if (searchString.includes('ecommerce') || 
      searchString.includes('e-commerce') ||
      searchString.includes('retail') ||
      searchString.includes('dtc') ||
      searchString.includes('shop') ||
      searchString.includes('store')) {
    return 'ecommerce';
  }
  
  if (searchString.includes('health') || 
      searchString.includes('medical') ||
      searchString.includes('clinic') ||
      searchString.includes('wellness') ||
      searchString.includes('therapy') ||
      searchString.includes('dental')) {
    return 'healthcare';
  }
  
  if (searchString.includes('financ') || 
      searchString.includes('banking') ||
      searchString.includes('invest') ||
      searchString.includes('wealth') ||
      searchString.includes('insurance')) {
    return 'fintech'; // Default financial to fintech styling
  }
  
  if (searchString.includes('creative') || 
      searchString.includes('design') ||
      searchString.includes('brand') ||
      searchString.includes('video') ||
      searchString.includes('photo') ||
      searchString.includes('art')) {
    return 'creative';
  }
  
  if (searchString.includes('real estate') || 
      searchString.includes('property') ||
      searchString.includes('realtor')) {
    return 'realestate';
  }
  
  return 'default';
}

// ============================================
// GET INDUSTRY TOKENS
// ============================================

export function getIndustryTokens(variant: IndustryVariant): IndustryTokens {
  // Get base variant for token lookup (handle sub-variants)
  const baseVariant = variant.replace(/-enterprise|-startup/, '');
  
  const colors = COLOR_PALETTES[baseVariant] || COLOR_PALETTES.default;
  const trustPriorities = TRUST_PRIORITIES[variant] || TRUST_PRIORITIES[baseVariant] || TRUST_PRIORITIES.default || [];
  const sectionHeaders = SECTION_HEADERS[baseVariant] || SECTION_HEADERS.default;
  const ctaDefaults = CTA_DEFAULTS[variant] || CTA_DEFAULTS[baseVariant] || CTA_DEFAULTS.default;
  
  // Define tokens per variant
  const tokenConfig: Record<string, Partial<IndustryTokens>> = {
    saas: {
      mode: 'dark',
      cardStyle: 'glass',
      borderRadius: 'rounded',
      typographyWeight: 'medium',
      heroStyle: 'gradient-mesh',
      proofTiming: 'early',
    },
    'saas-enterprise': {
      mode: 'dark',
      cardStyle: 'glass',
      borderRadius: 'medium',
      typographyWeight: 'medium',
      heroStyle: 'gradient-mesh',
      proofTiming: 'immediate', // Security badges above fold
    },
    fintech: {
      mode: 'dark',
      cardStyle: 'glass',
      borderRadius: 'medium',
      typographyWeight: 'medium',
      heroStyle: 'gradient-mesh',
      proofTiming: 'immediate', // Security badges essential
    },
    healthtech: {
      mode: 'light',
      cardStyle: 'elevated',
      borderRadius: 'medium',
      typographyWeight: 'medium',
      heroStyle: 'image-background',
      proofTiming: 'immediate', // HIPAA badges
    },
    devtools: {
      mode: 'dark',
      cardStyle: 'bordered',
      borderRadius: 'sharp',
      typographyWeight: 'medium',
      heroStyle: 'gradient-mesh',
      proofTiming: 'early',
    },
    consulting: {
      mode: 'light',
      cardStyle: 'elevated',
      borderRadius: 'medium',
      typographyWeight: 'medium',
      heroStyle: 'solid',
      proofTiming: 'early',
    },
    coaching: {
      mode: 'light',
      cardStyle: 'elevated',
      borderRadius: 'rounded',
      typographyWeight: 'medium',
      heroStyle: 'split',
      proofTiming: 'deep', // Build relationship first
    },
    manufacturing: {
      mode: 'light',
      cardStyle: 'bordered',
      borderRadius: 'sharp',
      typographyWeight: 'bold',
      heroStyle: 'solid',
      proofTiming: 'early', // Certifications upfront
    },
    healthcare: {
      mode: 'light',
      cardStyle: 'elevated',
      borderRadius: 'medium',
      typographyWeight: 'medium',
      heroStyle: 'image-background',
      proofTiming: 'mid',
    },
    ecommerce: {
      mode: 'light',
      cardStyle: 'elevated',
      borderRadius: 'medium',
      typographyWeight: 'medium',
      heroStyle: 'image-background',
      proofTiming: 'early', // Reviews fast
    },
    creative: {
      mode: 'dark',
      cardStyle: 'flat',
      borderRadius: 'medium',
      typographyWeight: 'bold',
      heroStyle: 'image-background',
      proofTiming: 'early', // Portfolio is proof
    },
    investor: {
      mode: 'dark',
      cardStyle: 'glass',
      borderRadius: 'medium',
      typographyWeight: 'bold',
      heroStyle: 'gradient-mesh',
      proofTiming: 'immediate', // Metrics above fold
    },
    realestate: {
      mode: 'light',
      cardStyle: 'elevated',
      borderRadius: 'medium',
      typographyWeight: 'medium',
      heroStyle: 'image-background',
      proofTiming: 'early',
    },
    beta: {
      mode: 'dark',
      cardStyle: 'glass',
      borderRadius: 'rounded',
      typographyWeight: 'medium',
      heroStyle: 'gradient-mesh',
      proofTiming: 'deep', // Build excitement first
    },
    default: {
      mode: 'dark',
      cardStyle: 'glass',
      borderRadius: 'medium',
      typographyWeight: 'medium',
      heroStyle: 'gradient-mesh',
      proofTiming: 'mid',
    },
  };
  
  const config = tokenConfig[variant] || tokenConfig[baseVariant] || tokenConfig.default;
  
  return {
    mode: config.mode || 'dark',
    colors,
    cardStyle: config.cardStyle || 'glass',
    borderRadius: config.borderRadius || 'medium',
    typographyWeight: config.typographyWeight || 'medium',
    heroStyle: config.heroStyle || 'gradient-mesh',
    proofTiming: config.proofTiming || 'mid',
    trustPriorities,
    sectionHeaders,
    ctaDefaults,
  };
}

// ============================================
// CSS VARIABLE GENERATOR
// ============================================

export function generateIndustryCSS(
  tokens: IndustryTokens,
  brandOverrides?: { primaryColor?: string; accentColor?: string }
): Record<string, string> {
  const { colors } = tokens;
  
  // Use brand overrides if provided
  const primary = brandOverrides?.primaryColor || colors.primary;
  const accent = brandOverrides?.accentColor || colors.accent;
  
  const radiusMap = {
    sharp: '0.375rem',
    medium: '0.75rem',
    rounded: '1rem',
  };
  
  const weightMap = {
    light: '400',
    medium: '500',
    bold: '700',
  };
  
  return {
    '--color-primary': primary,
    '--color-primary-light': colors.primaryLight,
    '--color-primary-dark': colors.primaryDark,
    '--color-accent': accent,
    '--color-background': colors.background,
    '--color-surface': colors.surface,
    '--color-surface-elevated': colors.surfaceElevated,
    '--color-text-primary': colors.textPrimary,
    '--color-text-secondary': colors.textSecondary,
    '--color-text-muted': colors.textMuted,
    '--radius-card': radiusMap[tokens.borderRadius],
    '--font-weight-heading': weightMap[tokens.typographyWeight],
    '--mode': tokens.mode,
    '--card-style': tokens.cardStyle,
  };
}

// ============================================
// PROOF STACK GENERATOR
// ============================================

export function getOptimalProofStack(
  variant: IndustryVariant,
  availableProof: {
    hasLogos?: boolean;
    hasMetrics?: boolean;
    hasCaseStudies?: boolean;
    hasTestimonials?: boolean;
    hasVideoTestimonials?: boolean;
    hasCertifications?: boolean;
    hasSecurityBadges?: boolean;
    hasGuarantee?: boolean;
    hasYearsInBusiness?: boolean;
    hasTeamCredentials?: boolean;
    hasMediaMentions?: boolean;
  }
): string[] {
  const tokens = getIndustryTokens(variant);
  const priorities = tokens.trustPriorities;
  
  const proofMap: Record<string, boolean> = {
    'logos': !!availableProof.hasLogos,
    'metrics': !!availableProof.hasMetrics,
    'case-studies': !!availableProof.hasCaseStudies,
    'written-testimonials': !!availableProof.hasTestimonials,
    'video-testimonials': !!availableProof.hasVideoTestimonials,
    'certifications': !!availableProof.hasCertifications,
    'security-badges': !!availableProof.hasSecurityBadges,
    'guarantee': !!availableProof.hasGuarantee,
    'years-in-business': !!availableProof.hasYearsInBusiness,
    'team-credentials': !!availableProof.hasTeamCredentials,
    'media-mentions': !!availableProof.hasMediaMentions,
    'free-trial': true, // Always available as CTA
  };
  
  return priorities
    .filter(signal => proofMap[signal])
    .slice(0, 4); // Return top 4 available
}

// ============================================
// CSS STRING GENERATOR (for style tag)
// ============================================

export function generateIndustryCSSString(
  tokens: IndustryTokens,
  brandOverrides?: { primaryColor?: string; accentColor?: string }
): string {
  const cssVars = generateIndustryCSS(tokens, brandOverrides);
  
  return Object.entries(cssVars)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n  ');
}
