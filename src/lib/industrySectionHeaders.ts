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
    features: { title: 'Our Services', subtitle: 'Professional solutions for your home' },
    process: { title: 'How It Works', subtitle: 'Simple, hassle-free process' },
    proof: { title: 'Trusted Locally', subtitle: 'Serving our community with pride' },
    testimonials: { title: 'What Our Customers Say', subtitle: 'Real reviews from real neighbors' },
    cta: { title: 'Get Your Free Quote', subtitle: 'Call now or book online' },
    gallery: { title: 'Our Recent Work', subtitle: 'See the quality for yourself' },
    serviceArea: { title: 'Areas We Serve', subtitle: 'Fast service in your neighborhood' },
    faq: { title: 'Common Questions', subtitle: 'Answers you need' },
    benefits: { title: 'Why Choose Us', subtitle: 'Licensed, insured, and local' },
    pricing: { title: 'Transparent Pricing', subtitle: 'No hidden fees, ever' },
    team: { title: 'Meet Our Team', subtitle: 'Experienced professionals' },
    credentials: { title: 'Licensed & Certified', subtitle: 'Your peace of mind matters' },
  },

  // SaaS: Speed, efficiency, modern
  saas: {
    features: { title: 'Platform Features', subtitle: 'Everything you need to succeed' },
    process: { title: 'How It Works', subtitle: 'Get started in minutes' },
    proof: { title: 'Trusted By', subtitle: 'Companies that rely on us' },
    testimonials: { title: 'Customer Stories', subtitle: 'Success in their own words' },
    cta: { title: 'Start Free Trial', subtitle: 'No credit card required' },
    gallery: { title: 'Product Screenshots', subtitle: 'See it in action' },
    serviceArea: { title: 'Global Availability', subtitle: 'Available worldwide' },
    faq: { title: 'Frequently Asked Questions', subtitle: 'Get answers fast' },
    benefits: { title: 'Why Teams Choose Us', subtitle: 'Built for modern workflows' },
    pricing: { title: 'Simple Pricing', subtitle: 'Plans that scale with you' },
    team: { title: 'Built By', subtitle: 'The team behind the product' },
    credentials: { title: 'Security & Compliance', subtitle: 'Enterprise-grade protection' },
  },

  // Manufacturing: Precision, reliability, capability
  manufacturing: {
    features: { title: 'Capabilities', subtitle: 'Precision engineering at scale' },
    process: { title: 'Our Process', subtitle: 'Quality at every stage' },
    proof: { title: 'Proven Track Record', subtitle: 'Decades of excellence' },
    testimonials: { title: 'Client Results', subtitle: 'Measurable impact' },
    cta: { title: 'Request a Quote', subtitle: 'Get your custom assessment' },
    gallery: { title: 'Facility & Equipment', subtitle: 'State-of-the-art operations' },
    serviceArea: { title: 'Industries Served', subtitle: 'Cross-sector expertise' },
    faq: { title: 'Technical FAQ', subtitle: 'Specifications and standards' },
    benefits: { title: 'Why Partner With Us', subtitle: 'Quality, reliability, scale' },
    pricing: { title: 'Custom Solutions', subtitle: 'Tailored to your requirements' },
    team: { title: 'Our Engineers', subtitle: 'Technical excellence' },
    credentials: { title: 'Certifications', subtitle: 'ISO, AS9100, and more' },
  },

  // Healthcare: Warmth, trust, care
  healthcare: {
    features: { title: 'How We Support You', subtitle: 'Compassionate care, always' },
    process: { title: 'Your Journey With Us', subtitle: 'Every step of the way' },
    proof: { title: 'Why Families Trust Us', subtitle: 'A legacy of care' },
    testimonials: { title: 'Patient Stories', subtitle: 'Real experiences, real outcomes' },
    cta: { title: 'Schedule a Consultation', subtitle: "We're here to help" },
    gallery: { title: 'Our Facilities', subtitle: 'Modern, comfortable spaces' },
    serviceArea: { title: 'Locations', subtitle: 'Care close to home' },
    faq: { title: 'Your Questions Answered', subtitle: 'Understanding your care' },
    benefits: { title: 'Our Approach', subtitle: 'Patient-centered care' },
    pricing: { title: 'Insurance & Payment', subtitle: 'Flexible options available' },
    team: { title: 'Our Care Team', subtitle: 'Experienced professionals' },
    credentials: { title: 'Accreditations', subtitle: 'Highest standards of care' },
  },

  // Finance: Authority, trust, precision
  finance: {
    features: { title: 'Our Approach', subtitle: 'Strategic solutions for growth' },
    process: { title: 'Investment Process', subtitle: 'Disciplined methodology' },
    proof: { title: 'Track Record', subtitle: 'Performance that speaks' },
    testimonials: { title: 'Client Testimonials', subtitle: 'Partnership stories' },
    cta: { title: 'Schedule a Consultation', subtitle: 'Confidential discussion' },
    gallery: { title: 'Our Offices', subtitle: 'Professional environments' },
    serviceArea: { title: 'Markets Served', subtitle: 'Global reach, local expertise' },
    faq: { title: 'Investment FAQ', subtitle: 'Common questions' },
    benefits: { title: 'Why Choose Us', subtitle: 'Fiduciary commitment' },
    pricing: { title: 'Fee Structure', subtitle: 'Transparent and aligned' },
    team: { title: 'Our Advisors', subtitle: 'Decades of experience' },
    credentials: { title: 'Regulatory Compliance', subtitle: 'SEC, FINRA registered' },
  },

  // Creative: Bold, minimal, portfolio-forward
  creative: {
    features: { title: 'What We Do', subtitle: '' },
    process: { title: 'Our Process', subtitle: '' },
    proof: { title: 'Selected Work', subtitle: '' },
    testimonials: { title: 'Client Words', subtitle: '' },
    cta: { title: "Let's Create", subtitle: 'Start a project' },
    gallery: { title: 'Portfolio', subtitle: '' },
    serviceArea: { title: 'Clients Worldwide', subtitle: '' },
    faq: { title: 'Questions', subtitle: '' },
    benefits: { title: 'Why Us', subtitle: '' },
    pricing: { title: 'Engagement Models', subtitle: '' },
    team: { title: 'The Team', subtitle: '' },
    credentials: { title: 'Recognition', subtitle: '' },
  },

  // Consulting: Professional, strategic, results-focused
  consulting: {
    features: { title: 'Areas of Practice', subtitle: 'Strategic expertise for complex challenges' },
    process: { title: 'Our Engagement Model', subtitle: 'Collaborative partnership' },
    proof: { title: 'Results That Speak', subtitle: 'Measurable outcomes' },
    testimonials: { title: 'Client Impact', subtitle: 'Success stories' },
    cta: { title: "Let's Start a Conversation", subtitle: 'Schedule your consultation' },
    gallery: { title: 'Case Studies', subtitle: 'Transformation in action' },
    serviceArea: { title: 'Industries We Serve', subtitle: 'Deep sector expertise' },
    faq: { title: 'Engagement FAQ', subtitle: 'Common questions' },
    benefits: { title: 'Our Approach', subtitle: 'Strategy meets execution' },
    pricing: { title: 'Engagement Models', subtitle: 'Flexible structures' },
    team: { title: 'Our Consultants', subtitle: 'Senior practitioners' },
    credentials: { title: 'Credentials', subtitle: 'Trusted by leaders' },
  },

  // Legal: Authority, precision, discretion
  legal: {
    features: { title: 'Practice Areas', subtitle: 'Comprehensive legal expertise' },
    process: { title: 'How We Work', subtitle: 'Clear, predictable process' },
    proof: { title: 'Case Results', subtitle: 'Proven track record' },
    testimonials: { title: 'Client Testimonials', subtitle: 'Trust earned' },
    cta: { title: 'Schedule a Consultation', subtitle: 'Confidential review' },
    gallery: { title: 'Our Offices', subtitle: 'Professional environment' },
    serviceArea: { title: 'Jurisdictions', subtitle: 'Where we practice' },
    faq: { title: 'Legal FAQ', subtitle: 'Common questions' },
    benefits: { title: 'Why Choose Our Firm', subtitle: 'Advocacy that matters' },
    pricing: { title: 'Fee Arrangements', subtitle: 'Transparent billing' },
    team: { title: 'Our Attorneys', subtitle: 'Experienced counsel' },
    credentials: { title: 'Bar Admissions', subtitle: 'Licensed to practice' },
  },

  // E-commerce: Speed, convenience, trust
  ecommerce: {
    features: { title: 'Shop Our Collection', subtitle: 'Curated for you' },
    process: { title: 'How to Order', subtitle: 'Easy as 1-2-3' },
    proof: { title: 'Customer Love', subtitle: 'See what people are saying' },
    testimonials: { title: 'Happy Customers', subtitle: 'Real reviews' },
    cta: { title: 'Shop Now', subtitle: 'Free shipping on orders over $50' },
    gallery: { title: 'Product Gallery', subtitle: 'See more details' },
    serviceArea: { title: 'We Ship To', subtitle: 'Fast delivery worldwide' },
    faq: { title: 'Shopping FAQ', subtitle: 'Shipping, returns & more' },
    benefits: { title: 'Why Shop With Us', subtitle: 'Quality guaranteed' },
    pricing: { title: 'Today\'s Deals', subtitle: 'Limited time offers' },
    team: { title: 'Our Story', subtitle: 'Family-owned since...' },
    credentials: { title: 'Secure Shopping', subtitle: 'Your data is safe' },
  },

  // Default fallback
  default: {
    features: { title: 'What We Offer', subtitle: 'Our key services' },
    process: { title: 'How It Works', subtitle: 'Simple steps to success' },
    proof: { title: 'Proven Results', subtitle: 'Track record of success' },
    testimonials: { title: 'What Clients Say', subtitle: 'Real feedback' },
    cta: { title: 'Get Started', subtitle: 'Take the next step' },
    gallery: { title: 'Our Work', subtitle: 'See examples' },
    serviceArea: { title: 'Where We Serve', subtitle: 'Our coverage area' },
    faq: { title: 'FAQ', subtitle: 'Common questions' },
    benefits: { title: 'Why Choose Us', subtitle: 'Our advantages' },
    pricing: { title: 'Pricing', subtitle: 'Flexible options' },
    team: { title: 'Our Team', subtitle: 'Meet the experts' },
    credentials: { title: 'Credentials', subtitle: 'Our qualifications' },
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
