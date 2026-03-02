/**
 * Industry-aware CTA copy helper.
 * Maps industry strings to appropriate CTA language based on business model.
 */

interface CtaSet {
  primary: string;
  secondary: string;
  reason: string;
}

const CONSULTATIVE_KEYWORDS = [
  'consulting', 'agency', 'creative', 'legal', 'accounting', 'advisory',
  'coaching', 'services', 'strategy', 'marketing', 'branding', 'design',
  'architecture', 'freelance', 'studio',
];

const SAAS_KEYWORDS = [
  'saas', 'software', 'platform', 'app', 'developer', 'devtools', 'api',
  'fintech', 'payment', 'processing', 'automation', 'analytics', 'cloud',
  'ai', 'machine learning', 'data', 'infrastructure', 'security', 'cyber',
  'tech', 'b2b software',
];

const ECOMMERCE_KEYWORDS = [
  'ecommerce', 'e-commerce', 'retail', 'shop', 'store', 'dtc',
  'direct-to-consumer', 'fashion', 'apparel', 'beauty', 'food', 'beverage',
  'consumer goods', 'marketplace',
];

const HEALTHCARE_KEYWORDS = [
  'healthcare', 'health', 'medical', 'dental', 'clinic', 'therapy',
  'wellness', 'chiropractic', 'optometry', 'veterinary', 'pharma',
  'biotech', 'mental health',
];

function matchesKeywords(industry: string, keywords: string[]): boolean {
  const lower = industry.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

export function getCtaByIndustry(industry: string | null | undefined): CtaSet {
  if (!industry) {
    return {
      primary: 'Get Started',
      secondary: 'Learn More',
      reason: 'Universal low-friction CTA',
    };
  }

  if (matchesKeywords(industry, SAAS_KEYWORDS)) {
    return {
      primary: 'Start for Free',
      secondary: 'See It In Action',
      reason: 'Product-led growth CTA for SaaS/tech',
    };
  }

  if (matchesKeywords(industry, ECOMMERCE_KEYWORDS)) {
    return {
      primary: 'Shop Now',
      secondary: 'Explore Products',
      reason: 'Direct purchase CTA for e-commerce',
    };
  }

  if (matchesKeywords(industry, HEALTHCARE_KEYWORDS)) {
    return {
      primary: 'Book a Consultation',
      secondary: 'Request Assessment',
      reason: 'Trust-forward CTA for healthcare/professional',
    };
  }

  if (matchesKeywords(industry, CONSULTATIVE_KEYWORDS)) {
    return {
      primary: 'Schedule Strategic Consultation',
      secondary: 'Download Technical Overview',
      reason: 'Low-friction, high-value ask for complex B2B sale',
    };
  }

  // Default: neutral
  return {
    primary: 'Get Started',
    secondary: 'Learn More',
    reason: 'Universal low-friction CTA',
  };
}
