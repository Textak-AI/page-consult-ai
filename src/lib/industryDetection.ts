/**
 * Dynamic Industry Detection
 * 
 * Re-evaluates industry variant as conversation builds, weighting recent messages
 * more heavily. Provides confidence levels and keyword tracking for transparency.
 */

import type { IndustryVariant } from '@/config/designSystem/industryVariants';
export type { IndustryVariant };

export interface IndustryDetection {
  variant: IndustryVariant;
  confidence: 'low' | 'medium' | 'high';
  keywords: string[];
  score: number;
  manuallyConfirmed: boolean;
}

// Agency signal patterns - if these appear, the person is likely an agency/consultant
// who SERVES an industry, not a member of that industry
const AGENCY_SIGNALS = [
  'we help',
  'we work with',
  'we serve',
  'our clients are',
  'our clients include',
  'founders who',
  'companies that',
  'businesses that',
  'i help',
  'i work with',
  'helping',
  'partner with',
];

/**
 * Check if the text contains agency signals (e.g., "we help biotech founders")
 * which means they're an agency/consultant, not the client's industry
 */
function containsAgencySignals(text: string): boolean {
  const lowerText = text.toLowerCase();
  return AGENCY_SIGNALS.some(signal => lowerText.includes(signal));
}

// Industry keyword patterns with weights
// CREATIVE has highest weights to catch branding/design agencies before consulting
const INDUSTRY_PATTERNS: Record<IndustryVariant, { keywords: string[]; weight: number }[]> = {
  creative: [
    // Creative/branding agency patterns - HIGHEST weight to catch before consulting
    { keywords: ['creative agency', 'branding agency', 'brand agency', 'design agency'], weight: 20 },
    { keywords: ['brand strategy', 'brand translation', 'brand system'], weight: 18 },
    { keywords: ['visual identity', 'brand identity', 'brand design'], weight: 18 },
    { keywords: ['creative studio', 'design studio', 'creative shop'], weight: 18 },
    { keywords: ['brand consultancy', 'branding consultancy'], weight: 20 },
    { keywords: ['marketing agency', 'advertising agency', 'ad agency'], weight: 18 },
    { keywords: ['creative director', 'art director', 'design director'], weight: 15 },
    { keywords: ['rebrand', 'rebranding', 'brand refresh'], weight: 16 },
    { keywords: ['logo design', 'brand guidelines', 'style guide'], weight: 15 },
    // Key differentiators from generic consulting
    { keywords: ['brands', 'branding'], weight: 15 },
    { keywords: ['brand'], weight: 12 }, // Single 'brand' also matters
    { keywords: ['visual', 'identity'], weight: 10 },
    { keywords: ['creative'], weight: 10 },
    { keywords: ['design'], weight: 8 },
  ],
  consulting: [
    // Traditional consulting patterns - lower weight than creative
    { keywords: ['consulting', 'consultant', 'consultancy'], weight: 10 },
    { keywords: ['advisory', 'advisor', 'advisors'], weight: 10 },
    { keywords: ['professional services', 'b2b services'], weight: 9 },
    { keywords: ['coaching', 'coach', 'executive coach', 'leadership coach'], weight: 10 },
    { keywords: ['hr ', ' hr', 'human resources', 'talent', 'recruitment', 'staffing'], weight: 9 },
    { keywords: ['leadership development', 'executive development', 'leadership training'], weight: 10 },
    { keywords: ['management', 'operations consulting', 'strategy'], weight: 7 },
    { keywords: ['training', 'facilitation', 'facilitator', 'workshop'], weight: 8 },
    { keywords: ['workforce', 'organizational', 'organizational development'], weight: 7 },
    { keywords: ['executive', 'leadership', 'c-suite', 'cfo', 'ceo', 'chro'], weight: 7 },
    { keywords: ['succession', 'retention', 'turnover', 'engagement'], weight: 7 },
    { keywords: ['services', 'service provider'], weight: 3 },
  ],
  legal: [
    { keywords: ['law firm', 'legal', 'attorney', 'lawyer'], weight: 10 },
    { keywords: ['litigation', 'corporate law', 'ip law'], weight: 9 },
    { keywords: ['paralegal', 'legal services'], weight: 8 },
    { keywords: ['contracts', 'compliance'], weight: 5 },
  ],
  finance: [
    { keywords: ['financial services', 'wealth management', 'investment'], weight: 10 },
    { keywords: ['accounting', 'cpa', 'bookkeeping'], weight: 9 },
    { keywords: ['banking', 'fintech'], weight: 8 },
    { keywords: ['insurance', 'mortgage', 'lending'], weight: 7 },
    { keywords: ['tax', 'audit'], weight: 6 },
  ],
  healthcare: [
    { keywords: ['healthcare', 'health care', 'medical'], weight: 10 },
    { keywords: ['clinic', 'hospital', 'practice'], weight: 9 },
    { keywords: ['dental', 'therapy', 'therapist'], weight: 8 },
    { keywords: ['wellness', 'mental health'], weight: 7 },
    { keywords: ['patient', 'telehealth'], weight: 6 },
  ],
  manufacturing: [
    { keywords: ['manufacturing', 'manufacturer'], weight: 10 },
    { keywords: ['industrial', 'factory', 'production'], weight: 9 },
    { keywords: ['supply chain', 'logistics'], weight: 7 },
    { keywords: ['equipment', 'machinery'], weight: 6 },
  ],
  ecommerce: [
    { keywords: ['ecommerce', 'e-commerce', 'online store'], weight: 10 },
    { keywords: ['shopify', 'amazon seller', 'retail'], weight: 9 },
    { keywords: ['dropshipping', 'd2c', 'dtc'], weight: 8 },
    { keywords: ['store', 'shop', 'products'], weight: 5 },
  ],
  saas: [
    { keywords: ['saas', 'software as a service'], weight: 10 },
    { keywords: ['software', 'platform', 'app'], weight: 7 },
    { keywords: ['tech startup', 'startup'], weight: 7 },
    { keywords: ['cloud', 'api'], weight: 6 },
    { keywords: ['digital product', 'subscription'], weight: 5 },
  ],
  default: [],
};

// Order matters - more specific industries should be checked first
// CREATIVE goes first to catch branding/design agencies before generic consulting
const DETECTION_ORDER: IndustryVariant[] = [
  'creative',     // Check BEFORE consulting to catch branding agencies
  'consulting',   // Most common for B2B services
  'legal',
  'finance',
  'healthcare',
  'manufacturing',
  'ecommerce',
  'saas',
  'default',
];

/**
 * Detect industry from conversation messages
 * Weights recent messages more heavily (last 3 get 2x weight)
 */
export function detectIndustryFromConversation(
  messages: string[],
  existingDetection?: IndustryDetection | null
): IndustryDetection {
  // If manually confirmed, don't re-detect
  if (existingDetection?.manuallyConfirmed) {
    return existingDetection;
  }

  // Combine messages with recency weighting
  const recentMessages = messages.slice(-3);
  const olderMessages = messages.slice(0, -3);
  
  // Create weighted text - recent messages count double
  const weightedText = [
    ...olderMessages,
    ...recentMessages,
    ...recentMessages, // Double weight for recent
  ].join(' ').toLowerCase();

  // Check for agency signals - if present, boost consulting/agency score
  const hasAgencySignals = containsAgencySignals(weightedText);

  // Score each industry
  const scores: Map<IndustryVariant, { score: number; keywords: string[] }> = new Map();

  for (const variant of DETECTION_ORDER) {
    const patterns = INDUSTRY_PATTERNS[variant];
    let totalScore = 0;
    const matchedKeywords: string[] = [];

    for (const { keywords, weight } of patterns) {
      for (const keyword of keywords) {
        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'gi');
        const matches = weightedText.match(regex);
        if (matches) {
          totalScore += weight * matches.length;
          if (!matchedKeywords.includes(keyword)) {
            matchedKeywords.push(keyword);
          }
        }
      }
    }

    // If agency signals detected and this is consulting, boost score
    // If agency signals detected and this is NOT consulting, reduce score
    // This handles "we help biotech founders" → consulting, not healthcare
    if (hasAgencySignals) {
      if (variant === 'consulting') {
        totalScore += 15; // Boost consulting when agency signals present
        matchedKeywords.push('(agency signal detected)');
      } else if (variant !== 'default' && totalScore > 0) {
        // Reduce non-consulting scores when agency signals present
        // They're probably serving that industry, not in it
        totalScore = Math.max(0, totalScore - 8);
      }
    }

    if (totalScore > 0) {
      scores.set(variant, { score: totalScore, keywords: matchedKeywords });
    }
  }

  // Find highest scoring variant
  let bestVariant: IndustryVariant = 'default';
  let bestScore = 0;
  let bestKeywords: string[] = [];

  for (const [variant, { score, keywords }] of scores) {
    if (score > bestScore) {
      bestScore = score;
      bestVariant = variant;
      bestKeywords = keywords;
    }
  }

  // Determine confidence based on score and keyword count
  let confidence: 'low' | 'medium' | 'high' = 'low';
  if (bestScore >= 20 && bestKeywords.length >= 3) {
    confidence = 'high';
  } else if (bestScore >= 10 && bestKeywords.length >= 2) {
    confidence = 'medium';
  } else if (bestScore >= 5) {
    confidence = 'low';
  }

  // If score changed significantly, return new detection
  const existingScore = existingDetection?.score || 0;
  const scoreChanged = Math.abs(bestScore - existingScore) >= 5;
  const variantChanged = existingDetection?.variant !== bestVariant;

  // Keep existing if no significant change and existing had higher confidence
  if (!variantChanged && !scoreChanged && existingDetection) {
    return existingDetection;
  }

  return {
    variant: bestVariant,
    confidence,
    keywords: bestKeywords.slice(0, 5), // Limit to top 5 keywords
    score: bestScore,
    manuallyConfirmed: false,
  };
}

/**
 * Create a manually confirmed industry detection
 */
export function confirmIndustry(variant: IndustryVariant): IndustryDetection {
  return {
    variant,
    confidence: 'high',
    keywords: ['User confirmed'],
    score: 100,
    manuallyConfirmed: true,
  };
}

/**
 * Map user-friendly option to variant
 */
export function optionToVariant(option: string): IndustryVariant {
  const mapping: Record<string, IndustryVariant> = {
    'SaaS / Software': 'saas',
    'Consulting / Agency': 'consulting',
    'Healthcare': 'healthcare',
    'E-commerce': 'ecommerce',
    'Manufacturing': 'manufacturing',
    'Financial Services': 'finance',
    'Legal': 'legal',
    'Professional Services': 'consulting',
    'Other': 'default',
  };
  return mapping[option] || 'default';
}

/**
 * Map variant to display name
 */
export function variantToDisplayName(variant: IndustryVariant): string {
  const mapping: Record<IndustryVariant, string> = {
    consulting: 'Consulting / Services',
    creative: 'Creative Agency',
    saas: 'SaaS / Software',
    healthcare: 'Healthcare',
    ecommerce: 'E-commerce',
    manufacturing: 'Manufacturing',
    finance: 'Financial Services',
    legal: 'Legal',
    default: 'General',
  };
  return mapping[variant] || 'General';
}

/**
 * Map user-friendly display option to variant
 * Handles additional options like 'Creative Agency' that map to 'creative'
 */
export function displayOptionToVariant(option: string): IndustryVariant {
  const mapping: Record<string, IndustryVariant> = {
    'SaaS / Software': 'saas',
    'Consulting / Agency': 'consulting',
    'Creative Agency': 'creative', // Bold, expressive, portfolio-forward
    'Coaching / Training': 'consulting',
    'Healthcare': 'healthcare',
    'E-commerce': 'ecommerce',
    'Manufacturing': 'manufacturing',
    'Financial Services': 'finance',
    'Legal': 'legal',
    'Real Estate': 'consulting',
    'Professional Services': 'consulting',
    'Other': 'default',
  };
  return mapping[option] || 'default';
}

/**
 * Get industry options for correction UI
 */
export const INDUSTRY_OPTIONS = [
  'SaaS / Software',
  'Consulting / Agency',
  'Creative Agency',
  'Coaching / Training',
  'Healthcare',
  'E-commerce',
  'Manufacturing',
  'Financial Services',
  'Legal',
  'Real Estate',
  'Other',
] as const;

export type IndustryOption = typeof INDUSTRY_OPTIONS[number];
