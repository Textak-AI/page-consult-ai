// Industry Detection v2.1 - Local Services Support (Jan 23, 2026)
console.log('🏗️ [IndustryDetection] v2.1 loaded - local-services enabled');

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
  displayName?: string; // User-selected display name (e.g., "Marketing Agency" instead of generic "General")
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
// LOCAL-SERVICES catches local service businesses (plumbers, electricians, etc.)
const INDUSTRY_PATTERNS: Record<IndustryVariant, { keywords: string[]; weight: number }[]> = {
  'local-services': [
    // Home services - HIGH weight for exact matches
    { keywords: ['plumber', 'plumbing', 'plumb'], weight: 20 },
    { keywords: ['electrician', 'electrical', 'electric'], weight: 20 },
    { keywords: ['hvac', 'heating', 'cooling', 'air conditioning', 'ac repair'], weight: 20 },
    { keywords: ['roofing', 'roofer', 'roof repair', 'roof'], weight: 20 },
    { keywords: ['landscaping', 'landscaper', 'lawn care', 'lawn service', 'yard'], weight: 20 },
    { keywords: ['cleaning service', 'cleaning company', 'maid service', 'janitorial'], weight: 20 },
    { keywords: ['handyman', 'home repair', 'maintenance'], weight: 18 },
    { keywords: ['pest control', 'exterminator', 'pest'], weight: 18 },
    { keywords: ['moving company', 'mover', 'moving service'], weight: 18 },
    { keywords: ['auto repair', 'mechanic', 'auto shop', 'garage'], weight: 18 },
    { keywords: ['towing', 'tow truck', 'tow service'], weight: 18 },
    { keywords: ['locksmith'], weight: 18 },
    // Construction trades
    { keywords: ['contractor', 'general contractor', 'construction'], weight: 18 },
    { keywords: ['painter', 'painting', 'house painting'], weight: 18 },
    { keywords: ['flooring', 'carpet', 'tile installer'], weight: 18 },
    { keywords: ['window', 'glass', 'window repair'], weight: 16 },
    { keywords: ['garage door', 'door repair'], weight: 16 },
    { keywords: ['appliance repair'], weight: 16 },
    { keywords: ['pool', 'pool service', 'pool cleaning', 'spa service'], weight: 16 },
    { keywords: ['tree service', 'arborist', 'tree removal'], weight: 16 },
    { keywords: ['gutter', 'gutter cleaning'], weight: 16 },
    { keywords: ['pressure washing', 'power washing'], weight: 16 },
    { keywords: ['junk removal', 'hauling'], weight: 16 },
    { keywords: ['drywall'], weight: 14 },
    { keywords: ['concrete', 'mason', 'masonry'], weight: 14 },
    { keywords: ['fencing', 'fence'], weight: 14 },
    { keywords: ['siding'], weight: 14 },
    { keywords: ['insulation'], weight: 14 },
    { keywords: ['solar', 'solar panel'], weight: 14 },
    { keywords: ['septic', 'septic tank'], weight: 14 },
    { keywords: ['well', 'water treatment', 'water softener'], weight: 14 },
    // Personal services
    { keywords: ['salon', 'hair salon', 'barber', 'barbershop'], weight: 16 },
    { keywords: ['spa', 'massage', 'wellness center'], weight: 16 },
    { keywords: ['restaurant', 'catering', 'food service'], weight: 14 },
    // Location signals - boost for local audience
    { keywords: ['homeowner', 'homeowners'], weight: 10 },
    { keywords: ['local', 'neighborhood', 'community'], weight: 8 },
    { keywords: ['metro area', 'county', 'city of', 'greater'], weight: 8 },
    { keywords: ['residential', 'commercial'], weight: 6 },
  ],
  creative: [
    // Creative/branding agency patterns - HIGHEST weight to catch before consulting
    { keywords: ['creative agency', 'branding agency', 'brand agency', 'design agency', 'strategic brand agency'], weight: 25 },
    { keywords: ['brand strategy', 'brand translation', 'brand system', 'brand positioning'], weight: 22 },
    { keywords: ['visual identity', 'brand identity', 'brand design', 'identity design'], weight: 22 },
    { keywords: ['creative studio', 'design studio', 'creative shop', 'brand studio'], weight: 20 },
    { keywords: ['brand consultancy', 'branding consultancy', 'brand consultant'], weight: 22 },
    { keywords: ['marketing agency', 'advertising agency', 'ad agency'], weight: 18 },
    { keywords: ['creative director', 'art director', 'design director'], weight: 15 },
    { keywords: ['rebrand', 'rebranding', 'brand refresh', 'brand transformation'], weight: 18 },
    { keywords: ['logo design', 'brand guidelines', 'style guide', 'brand book'], weight: 15 },
    // Key differentiators - these should strongly signal creative
    { keywords: ['translate technology into brands', 'translate into brands', 'into brands'], weight: 25 },
    { keywords: ['brands', 'branding'], weight: 18 },
    { keywords: ['brand'], weight: 14 }, // Single 'brand' - higher weight
    { keywords: ['visual', 'identity'], weight: 12 },
    { keywords: ['creative'], weight: 12 },
    { keywords: ['design'], weight: 10 },
  ],
  consulting: [
    // Traditional consulting patterns - lower weight than creative
    // IMPORTANT: Avoid patterns that could match creative agencies (e.g., "strategy" alone)
    { keywords: ['consulting', 'consultant', 'consultancy'], weight: 10 },
    { keywords: ['advisory', 'advisor', 'advisors'], weight: 10 },
    { keywords: ['professional services', 'b2b services'], weight: 9 },
    { keywords: ['coaching', 'coach', 'executive coach', 'leadership coach'], weight: 10 },
    { keywords: ['hr ', ' hr', 'human resources', 'talent', 'recruitment', 'staffing'], weight: 9 },
    { keywords: ['leadership development', 'executive development', 'leadership training'], weight: 10 },
    { keywords: ['management consulting', 'operations consulting', 'business strategy'], weight: 8 },
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
    { keywords: ['dental', 'dentist', 'therapy', 'therapist'], weight: 8 },
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
// LOCAL-SERVICES goes first to catch plumbers, electricians, etc.
// CREATIVE goes before consulting to catch branding agencies
const DETECTION_ORDER: IndustryVariant[] = [
  'local-services', // Check FIRST to catch plumbers, HVAC, etc.
  'creative',       // Check BEFORE consulting to catch branding agencies
  'consulting',     // Most common for B2B services
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

    // If agency signals detected, handle creative vs consulting
    // Creative agencies ARE agencies, so boost BOTH creative and consulting
    if (hasAgencySignals) {
      if (variant === 'consulting' || variant === 'creative') {
        // Boost both agency-type industries when agency signals present
        totalScore += 10;
        matchedKeywords.push('(agency signal detected)');
      } else if (variant !== 'default' && totalScore > 0) {
        // Only penalize non-agency industries (healthcare, saas, etc.)
        // They're probably serving that industry, not in it
        totalScore = Math.max(0, totalScore - 8);
      }
    }

    // Debug logging
    if (totalScore > 0) {
      console.log(`🎯 [Industry] ${variant}: score=${totalScore}, keywords=[${matchedKeywords.join(', ')}]`);
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

  // Log final decision
  console.log(`🎯 [Industry] FINAL: ${bestVariant} (score=${bestScore}, confidence=${confidence})`);
  console.log(`🎯 [Industry] All scores:`, Array.from(scores.entries()).map(([v, s]) => `${v}=${s.score}`).join(', '));

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
export function confirmIndustry(variant: IndustryVariant, displayName?: string): IndustryDetection {
  return {
    variant,
    confidence: 'high',
    keywords: ['User confirmed'],
    score: 100,
    manuallyConfirmed: true,
    displayName: displayName || undefined,
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
    'local-services': 'Local Services',
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
