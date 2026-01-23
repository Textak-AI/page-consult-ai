/**
 * Industry-Specific Section Selection
 * 
 * Different industries need different sections in different orders.
 * A local plumber needs Gallery + Service Area + Trust Badges
 * A SaaS product needs Features + Pricing + Integration logos
 * 
 * This module provides the optimal section list per industry.
 */

export type IndustrySectionType = 
  | 'hero'
  | 'trust-badges'
  | 'stats-bar'
  | 'problem-solution'
  | 'features'
  | 'benefits'
  | 'services'
  | 'gallery'
  | 'photo-gallery'
  | 'testimonials'
  | 'social-proof'
  | 'service-area'
  | 'how-it-works'
  | 'process'
  | 'credentials'
  | 'team'
  | 'pricing'
  | 'faq'
  | 'comparison'
  | 'case-studies'
  | 'final-cta'
  | 'logo-bar'
  | 'transformation'
  | 'curriculum'
  | 'guarantee'
  | 'care-journey'
  | 'pain-points'
  | 'risk-reversal';

/**
 * Optimal section order per industry
 * Based on conversion research and industry best practices
 */
export const INDUSTRY_SECTIONS: Record<string, IndustrySectionType[]> = {
  // Local Services: Trust + Local + Visual proof
  'local-services': [
    'hero',
    'trust-badges',         // Licensed, Bonded, Insured badges
    'stats-bar',            // Years in business, jobs completed
    'services',             // Service offerings grid (maps to features)
    'photo-gallery',        // Work photos - critical for trades
    'testimonials',         // Local reviews with names
    'how-it-works',         // Simple 3-step process
    'service-area',         // Map or area list
    'faq',                  // Common questions
    'final-cta',            // Phone number prominent
  ],

  // SaaS: Features + Social proof + Pricing
  saas: [
    'hero',
    'stats-bar',            // Users, uptime, etc.
    'logo-bar',             // Customer logos
    'problem-solution',     // Pain → Solution
    'features',             // Platform features
    'how-it-works',         // Onboarding flow
    'testimonials',         // Customer stories
    'pricing',              // Plans and pricing
    'faq',                  // Common questions
    'final-cta',            // Start trial CTA
  ],

  // Manufacturing: Capabilities + Credentials + Case studies
  manufacturing: [
    'hero',
    'credentials',          // Certifications, ISO, etc.
    'stats-bar',            // Capacity, precision, experience
    'features',             // Capabilities
    'how-it-works',         // Process framework
    'case-studies',         // Industry examples (maps to testimonials)
    'service-area',         // Industries served
    'faq',                  // Technical questions
    'final-cta',            // Quote request
  ],

  // Healthcare: Trust + Care journey + Team
  healthcare: [
    'hero',
    'trust-badges',         // HIPAA, certifications
    'features',             // Services offered
    'how-it-works',         // Care journey / Patient experience
    'team',                 // Care team (maps to social-proof with team layout)
    'testimonials',         // Patient stories
    'service-area',         // Locations
    'faq',                  // Patient questions
    'final-cta',            // Schedule consultation
  ],

  // Coaching / Training: Transformation + Curriculum + Guarantee
  coaching: [
    'hero',
    'problem-solution',     // "Are you struggling with..."
    'stats-bar',            // Clients helped, success rate
    'transformation',       // Before/after (maps to problem-solution variant)
    'features',             // Curriculum / What you'll learn
    'testimonials',         // Story-based testimonials
    'guarantee',            // Risk reversal (maps to risk-reversal)
    'pricing',              // Program pricing
    'faq',                  // Program questions
    'final-cta',            // Enroll CTA
  ],

  // Finance: Authority + Track record + Compliance
  finance: [
    'hero',
    'credentials',          // SEC, FINRA, certifications
    'stats-bar',            // AUM, years, performance
    'features',             // Services / Approach
    'how-it-works',         // Investment process
    'testimonials',         // Client testimonials
    'team',                 // Advisor profiles
    'faq',                  // Investment questions
    'final-cta',            // Schedule consultation
  ],

  // Creative: Portfolio-forward, minimal text
  creative: [
    'hero',
    'photo-gallery',        // Portfolio / Selected work
    'features',             // Services
    'how-it-works',         // Process
    'testimonials',         // Client words
    'team',                 // The creatives
    'final-cta',            // Start a project
  ],

  // Consulting: Expertise + Results + Process
  consulting: [
    'hero',
    'stats-bar',            // Clients, years, results
    'problem-solution',     // Challenge → Solution
    'features',             // Service areas
    'how-it-works',         // Engagement process
    'testimonials',         // Client impact
    'case-studies',         // Transformation stories
    'faq',                  // Engagement questions
    'final-cta',            // Start conversation
  ],

  // Legal: Authority + Practice areas + Results
  legal: [
    'hero',
    'credentials',          // Bar admissions, honors
    'features',             // Practice areas
    'stats-bar',            // Cases won, experience
    'testimonials',         // Client testimonials
    'team',                 // Attorney profiles
    'faq',                  // Legal questions
    'final-cta',            // Schedule consultation
  ],

  // E-commerce: Products + Trust + Convenience
  ecommerce: [
    'hero',
    'trust-badges',         // Secure checkout, shipping
    'features',             // Product collection
    'testimonials',         // Customer reviews
    'how-it-works',         // Order process
    'faq',                  // Shipping, returns
    'final-cta',            // Shop now
  ],

  // Default fallback
  default: [
    'hero',
    'stats-bar',
    'problem-solution',
    'features',
    'how-it-works',
    'testimonials',
    'faq',
    'final-cta',
  ],
};

/**
 * Get optimal sections for an industry
 */
export function getIndustrySections(industry: string | undefined | null): IndustrySectionType[] {
  if (!industry) return INDUSTRY_SECTIONS.default;
  
  const normalized = normalizeIndustryKey(industry);
  return INDUSTRY_SECTIONS[normalized] || INDUSTRY_SECTIONS.default;
}

/**
 * Normalize industry string to match our keys
 */
function normalizeIndustryKey(industry: string): string {
  const normalized = industry.toLowerCase().replace(/[^a-z-]/g, '').trim();
  
  // Map common variations
  const keyMap: Record<string, string> = {
    'localservices': 'local-services',
    'plumber': 'local-services',
    'plumbing': 'local-services',
    'hvac': 'local-services',
    'electrician': 'local-services',
    'contractor': 'local-services',
    'landscaping': 'local-services',
    'cleaning': 'local-services',
    'autorepair': 'local-services',
    'roofing': 'local-services',
    'tech': 'saas',
    'software': 'saas',
    'startup': 'saas',
    'industrial': 'manufacturing',
    'medical': 'healthcare',
    'health': 'healthcare',
    'clinic': 'healthcare',
    'dental': 'healthcare',
    'therapy': 'healthcare',
    'training': 'coaching',
    'coach': 'coaching',
    'financial': 'finance',
    'fintech': 'finance',
    'investment': 'finance',
    'wealth': 'finance',
    'agency': 'creative',
    'design': 'creative',
    'branding': 'creative',
    'marketing': 'creative',
    'professional': 'consulting',
    'advisory': 'consulting',
    'law': 'legal',
    'attorney': 'legal',
    'lawyer': 'legal',
    'retail': 'ecommerce',
    'shop': 'ecommerce',
    'store': 'ecommerce',
  };
  
  return keyMap[normalized] || (INDUSTRY_SECTIONS[normalized] ? normalized : 'default');
}

/**
 * Check if a section type is required for an industry
 */
export function isSectionRequired(industry: string, sectionType: string): boolean {
  const sections = getIndustrySections(industry);
  return sections.includes(sectionType as IndustrySectionType);
}

/**
 * Get section priority (order) for an industry
 * Lower number = higher priority (appears earlier)
 */
export function getSectionPriority(industry: string, sectionType: string): number {
  const sections = getIndustrySections(industry);
  const index = sections.indexOf(sectionType as IndustrySectionType);
  return index >= 0 ? index : 999; // Unknown sections go last
}

/**
 * Map section type aliases to canonical names
 * Some sections have multiple names but render the same component
 */
export function getCanonicalSectionType(sectionType: string): string {
  const aliasMap: Record<string, string> = {
    'services': 'features',
    'benefits': 'features',
    'capabilities': 'features',
    'curriculum': 'features',
    'care-journey': 'how-it-works',
    'transformation': 'problem-solution',
    'pain-points': 'problem-solution',
    'case-studies': 'testimonials',
    'guarantee': 'risk-reversal',
    'gallery': 'photo-gallery',
    'team': 'social-proof',
    'logo-bar': 'stats-bar',
  };
  
  return aliasMap[sectionType] || sectionType;
}
