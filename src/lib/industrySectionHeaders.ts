/**
 * Industry-Specific Section Headers
 * 
 * Each industry needs contextually appropriate section headers.
 * A plumber's "What Our Customers Say" beats SaaS's "Trusted By"
 * A healthcare provider's "Your Journey With Us" beats manufacturing's "Process Framework"
 */

export type SectionHeaderType = 
  | 'features' 
  | 'process' 
  | 'proof' 
  | 'testimonials' 
  | 'cta' 
  | 'gallery' 
  | 'serviceArea' 
  | 'faq'
  | 'benefits'
  | 'pricing'
  | 'team'
  | 'credentials';

export interface SectionHeader {
  title: string;
  subtitle: string;
}

export const SECTION_HEADERS: Record<string, Record<SectionHeaderType, SectionHeader>> = {
  // Local Services: Trust, reliability, local presence
  'local-services': {
    features: { title: 'Our Services', subtitle: '' },
    process: { title: 'How It Works', subtitle: '' },
    proof: { title: 'Trusted Locally', subtitle: '' },
    testimonials: { title: 'What Our Customers Say', subtitle: '' },
    cta: { title: 'Get Your Free Quote', subtitle: '' },
    gallery: { title: 'Our Recent Work', subtitle: '' },
    serviceArea: { title: 'Areas We Serve', subtitle: '' },
    faq: { title: 'Common Questions', subtitle: '' },
    benefits: { title: 'Why Choose Us', subtitle: '' },
    pricing: { title: 'Transparent Pricing', subtitle: '' },
    team: { title: 'Meet Our Team', subtitle: '' },
    credentials: { title: 'Licensed & Certified', subtitle: '' },
  },

  // SaaS: Speed, efficiency, modern
  saas: {
    features: { title: 'Platform Features', subtitle: '' },
    process: { title: 'How It Works', subtitle: '' },
    proof: { title: 'Trusted By', subtitle: '' },
    testimonials: { title: 'Customer Stories', subtitle: '' },
    cta: { title: 'Start Free Trial', subtitle: '' },
    gallery: { title: 'Product Screenshots', subtitle: '' },
    serviceArea: { title: 'Global Availability', subtitle: '' },
    faq: { title: 'Frequently Asked Questions', subtitle: '' },
    benefits: { title: 'Why Teams Choose Us', subtitle: '' },
    pricing: { title: 'Simple Pricing', subtitle: '' },
    team: { title: 'Built By', subtitle: '' },
    credentials: { title: 'Security & Compliance', subtitle: '' },
  },

  // Manufacturing: Precision, reliability, capability
  manufacturing: {
    features: { title: 'Capabilities', subtitle: '' },
    process: { title: 'Our Process', subtitle: '' },
    proof: { title: 'Proven Track Record', subtitle: '' },
    testimonials: { title: 'Client Results', subtitle: '' },
    cta: { title: 'Request a Quote', subtitle: '' },
    gallery: { title: 'Facility & Equipment', subtitle: '' },
    serviceArea: { title: 'Industries Served', subtitle: '' },
    faq: { title: 'Technical FAQ', subtitle: '' },
    benefits: { title: 'Why Partner With Us', subtitle: '' },
    pricing: { title: 'Custom Solutions', subtitle: '' },
    team: { title: 'Our Engineers', subtitle: '' },
    credentials: { title: 'Certifications', subtitle: '' },
  },

  // Healthcare: Warmth, trust, care
  healthcare: {
    features: { title: 'How We Support You', subtitle: '' },
    process: { title: 'Your Journey With Us', subtitle: '' },
    proof: { title: 'Why Families Trust Us', subtitle: '' },
    testimonials: { title: 'Patient Stories', subtitle: '' },
    cta: { title: 'Schedule a Consultation', subtitle: '' },
    gallery: { title: 'Our Facilities', subtitle: '' },
    serviceArea: { title: 'Locations', subtitle: '' },
    faq: { title: 'Your Questions Answered', subtitle: '' },
    benefits: { title: 'Our Approach', subtitle: '' },
    pricing: { title: 'Insurance & Payment', subtitle: '' },
    team: { title: 'Our Care Team', subtitle: '' },
    credentials: { title: 'Accreditations', subtitle: '' },
  },

  // Finance: Authority, trust, precision
  finance: {
    features: { title: 'Our Approach', subtitle: '' },
    process: { title: 'Investment Process', subtitle: '' },
    proof: { title: 'Track Record', subtitle: '' },
    testimonials: { title: 'Client Testimonials', subtitle: '' },
    cta: { title: 'Schedule a Consultation', subtitle: '' },
    gallery: { title: 'Our Offices', subtitle: '' },
    serviceArea: { title: 'Markets Served', subtitle: '' },
    faq: { title: 'Investment FAQ', subtitle: '' },
    benefits: { title: 'Why Choose Us', subtitle: '' },
    pricing: { title: 'Fee Structure', subtitle: '' },
    team: { title: 'Our Advisors', subtitle: '' },
    credentials: { title: 'Regulatory Compliance', subtitle: '' },
  },

  // Creative: Bold, minimal, portfolio-forward
  creative: {
    features: { title: 'What We Do', subtitle: '' },
    process: { title: 'Our Process', subtitle: '' },
    proof: { title: 'Selected Work', subtitle: '' },
    testimonials: { title: 'Client Words', subtitle: '' },
    cta: { title: "Let's Create", subtitle: '' },
    gallery: { title: 'Portfolio', subtitle: '' },
    serviceArea: { title: 'Clients Worldwide', subtitle: '' },
    faq: { title: 'Questions', subtitle: '' },
    benefits: { title: 'Why Us', subtitle: '' },
    pricing: { title: 'Engagement Models', subtitle: '' },
    team: { title: 'The Team', subtitle: '' },
    credentials: { title: 'Recognition', subtitle: '' },
  },

  // Consulting: Professional, strategic, results-focused
  // Design Intent: Warmth, credibility, relationship-building
  consulting: {
    features: { title: 'Areas of Practice', subtitle: '' },
    process: { title: 'Our Engagement Model', subtitle: '' },
    proof: { title: 'Client Success', subtitle: '' },
    testimonials: { title: 'What Clients Say', subtitle: '' },
    cta: { title: 'Schedule a Conversation', subtitle: '' },
    gallery: { title: 'Case Studies', subtitle: '' },
    serviceArea: { title: 'Industries We Serve', subtitle: '' },
    faq: { title: 'Common Questions', subtitle: '' },
    benefits: { title: 'Our Approach', subtitle: '' },
    pricing: { title: 'Engagement Models', subtitle: '' },
    team: { title: 'Our Team', subtitle: '' },
    credentials: { title: 'Credentials', subtitle: '' },
  },

  // Legal: Authority, precision, discretion
  legal: {
    features: { title: 'Practice Areas', subtitle: '' },
    process: { title: 'How We Work', subtitle: '' },
    proof: { title: 'Case Results', subtitle: '' },
    testimonials: { title: 'Client Testimonials', subtitle: '' },
    cta: { title: 'Schedule a Consultation', subtitle: '' },
    gallery: { title: 'Our Offices', subtitle: '' },
    serviceArea: { title: 'Jurisdictions', subtitle: '' },
    faq: { title: 'Legal FAQ', subtitle: '' },
    benefits: { title: 'Why Choose Our Firm', subtitle: '' },
    pricing: { title: 'Fee Arrangements', subtitle: '' },
    team: { title: 'Our Attorneys', subtitle: '' },
    credentials: { title: 'Bar Admissions', subtitle: '' },
  },

  // E-commerce: Speed, convenience, trust
  ecommerce: {
    features: { title: 'Shop Our Collection', subtitle: '' },
    process: { title: 'How to Order', subtitle: '' },
    proof: { title: 'Customer Love', subtitle: '' },
    testimonials: { title: 'Happy Customers', subtitle: '' },
    cta: { title: 'Shop Now', subtitle: '' },
    gallery: { title: 'Product Gallery', subtitle: '' },
    serviceArea: { title: 'We Ship To', subtitle: '' },
    faq: { title: 'Shopping FAQ', subtitle: '' },
    benefits: { title: 'Why Shop With Us', subtitle: '' },
    pricing: { title: 'Today\'s Deals', subtitle: '' },
    team: { title: 'Our Story', subtitle: '' },
    credentials: { title: 'Secure Shopping', subtitle: '' },
  },

  // Default fallback
  default: {
    features: { title: 'What We Offer', subtitle: '' },
    process: { title: 'How It Works', subtitle: '' },
    proof: { title: 'Proven Results', subtitle: '' },
    testimonials: { title: 'What Clients Say', subtitle: '' },
    cta: { title: 'Get Started', subtitle: '' },
    gallery: { title: 'Our Work', subtitle: '' },
    serviceArea: { title: 'Where We Serve', subtitle: '' },
    faq: { title: 'FAQ', subtitle: '' },
    benefits: { title: 'Why Choose Us', subtitle: '' },
    pricing: { title: 'Pricing', subtitle: '' },
    team: { title: 'Our Team', subtitle: '' },
    credentials: { title: 'Credentials', subtitle: '' },
  },
};

/**
 * Get section header for a specific industry and section type
 */
export function getSectionHeader(
  industryVariant: string | undefined | null,
  sectionType: SectionHeaderType | string
): SectionHeader {
  const normalizedVariant = normalizeIndustryVariant(industryVariant);
  const industryHeaders = SECTION_HEADERS[normalizedVariant] || SECTION_HEADERS.default;
  
  return industryHeaders[sectionType as SectionHeaderType] || 
         SECTION_HEADERS.default[sectionType as SectionHeaderType] || 
         { title: sectionType, subtitle: '' };
}

/**
 * Normalize industry variant string to match our keys
 */
function normalizeIndustryVariant(variant: string | undefined | null): string {
  if (!variant) return 'default';
  
  const normalized = variant.toLowerCase().trim();
  
  // Map common variations to our standard keys
  const variantMap: Record<string, string> = {
    'local-services': 'local-services',
    'localservices': 'local-services',
    'local services': 'local-services',
    'plumber': 'local-services',
    'plumbing': 'local-services',
    'hvac': 'local-services',
    'electrician': 'local-services',
    'contractor': 'local-services',
    'tech': 'saas',
    'software': 'saas',
    'saas': 'saas',
    'manufacturing': 'manufacturing',
    'industrial': 'manufacturing',
    'healthcare': 'healthcare',
    'medical': 'healthcare',
    'health': 'healthcare',
    'finance': 'finance',
    'financial': 'finance',
    'fintech': 'finance',
    'creative': 'creative',
    'agency': 'creative',
    'design': 'creative',
    'branding': 'creative',
    'consulting': 'consulting',
    'professional': 'consulting',
    'legal': 'legal',
    'law': 'legal',
    'ecommerce': 'ecommerce',
    'e-commerce': 'ecommerce',
    'retail': 'ecommerce',
    'shop': 'ecommerce',
  };
  
  return variantMap[normalized] || (SECTION_HEADERS[normalized] ? normalized : 'default');
}

/**
 * Get all section headers for an industry
 */
export function getAllSectionHeaders(industryVariant: string | undefined | null): Record<SectionHeaderType, SectionHeader> {
  const normalizedVariant = normalizeIndustryVariant(industryVariant);
  return SECTION_HEADERS[normalizedVariant] || SECTION_HEADERS.default;
}
