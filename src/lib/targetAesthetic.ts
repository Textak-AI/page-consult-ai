/**
 * Target Aesthetic System
 * 
 * Blends provider industry styling with target market expectations when they differ.
 * Example: Cybersecurity firm → Healthcare buyers = healthcare palette + security credibility
 */

import type { IndustryVariant } from '@/config/designSystem/industryVariants';

// ============================================
// TYPES
// ============================================

export interface AestheticMode {
  primary: string;                // Main industry driving design (usually target market)
  secondary: string | null;       // Provider industry for credibility elements
  blend: 'pure' | 'hybrid';       // Whether blending is needed
  rationale: string;              // "Designed for healthcare buyers with security credibility"
}

export interface IndustryAestheticTraits {
  palette: string[];              // [primary, accent, background]
  imagery: string;                // Description of image style
  tone: string;                   // Voice characteristics
  trustSignals: string[];         // Industry-specific credibility markers
}

// ============================================
// INDUSTRY AESTHETIC MAPPINGS
// ============================================

export const INDUSTRY_AESTHETIC_TRAITS: Record<string, IndustryAestheticTraits> = {
  healthcare: {
    palette: ['hsl(192, 82%, 38%)', 'hsl(166, 72%, 40%)', 'hsl(166, 76%, 97%)'], // Cyan, teal, soft mint
    imagery: 'People, care environments, compliance symbols, clean professional settings',
    tone: 'Trustworthy, compliant, patient-focused, empathetic',
    trustSignals: ['HIPAA Compliant', 'SOC 2', 'Healthcare client logos', 'Patient outcome metrics'],
  },
  cybersecurity: {
    palette: ['hsl(215, 28%, 17%)', 'hsl(217, 91%, 60%)', 'hsl(160, 84%, 39%)'], // Dark slate, blue, green
    imagery: 'Shields, locks, network diagrams, dark interfaces, secure environments',
    tone: 'Authoritative, precise, vigilant, technical',
    trustSignals: ['SOC 2 Type II', 'ISO 27001', 'Penetration test certifications', 'Zero breaches'],
  },
  manufacturing: {
    palette: ['hsl(210, 54%, 24%)', 'hsl(38, 92%, 50%)', 'hsl(215, 16%, 47%)'], // Industrial blue, safety orange, steel gray
    imagery: 'Facilities, precision equipment, efficiency charts, production lines',
    tone: 'Practical, results-driven, efficiency-focused, no-nonsense',
    trustSignals: ['ISO certifications', 'Client logos', 'ROI metrics', 'Uptime guarantees'],
  },
  legal: {
    palette: ['hsl(210, 54%, 24%)', 'hsl(0, 73%, 41%)', 'hsl(210, 40%, 98%)'], // Navy, deep red, clean white
    imagery: 'Professional settings, documents, subtle justice symbols, polished offices',
    tone: 'Authoritative, precise, risk-aware, professional',
    trustSignals: ['Bar associations', 'Case results', 'Partner credentials', 'Years of practice'],
  },
  finance: {
    palette: ['hsl(210, 54%, 24%)', 'hsl(142, 71%, 45%)', 'hsl(210, 40%, 98%)'], // Navy, money green, clean white
    imagery: 'Charts, growth indicators, professional settings, trust symbols',
    tone: 'Trustworthy, precise, growth-oriented, conservative',
    trustSignals: ['Regulatory compliance', 'AUM figures', 'Client testimonials', 'Industry awards'],
  },
  saas: {
    palette: ['hsl(260, 67%, 55%)', 'hsl(192, 91%, 45%)', 'hsl(220, 23%, 97%)'], // Purple, cyan, light gray
    imagery: 'Clean interfaces, product screenshots, team photos, modern offices',
    tone: 'Innovative, helpful, modern, approachable',
    trustSignals: ['G2 ratings', 'Customer logos', 'Integration partners', 'Uptime SLAs'],
  },
  ecommerce: {
    palette: ['hsl(262, 83%, 58%)', 'hsl(339, 90%, 51%)', 'hsl(0, 0%, 100%)'], // Purple, pink, white
    imagery: 'Products, happy customers, shopping experiences, lifestyle shots',
    tone: 'Exciting, aspirational, customer-centric, action-oriented',
    trustSignals: ['Revenue metrics', 'Customer reviews', 'Brand logos', 'Growth numbers'],
  },
  consulting: {
    palette: ['hsl(215, 28%, 17%)', 'hsl(192, 91%, 45%)', 'hsl(220, 23%, 97%)'], // Dark slate, cyan, light
    imagery: 'Professional headshots, meeting rooms, strategic frameworks, success stories',
    tone: 'Expert, thoughtful, strategic, collaborative',
    trustSignals: ['Client logos', 'Case studies', 'Credentials', 'Published work'],
  },
  default: {
    palette: ['hsl(215, 28%, 17%)', 'hsl(192, 91%, 45%)', 'hsl(220, 23%, 97%)'],
    imagery: 'Professional settings, people at work, clean environments',
    tone: 'Professional, trustworthy, approachable',
    trustSignals: ['Client testimonials', 'Years in business', 'Results metrics'],
  },
};

// ============================================
// TARGET MARKET DETECTION KEYWORDS
// ============================================

const TARGET_MARKET_KEYWORDS: Record<string, string[]> = {
  healthcare: ['healthcare', 'hospital', 'clinic', 'medical', 'patient', 'hipaa', 'physician', 'nurse', 'health system'],
  manufacturing: ['manufacturing', 'factory', 'plant', 'production', 'industrial', 'oem', 'supply chain'],
  finance: ['financial', 'bank', 'insurance', 'fintech', 'wealth', 'investment', 'asset management'],
  legal: ['law firm', 'legal', 'attorney', 'lawyer', 'litigation'],
  saas: ['saas', 'software', 'tech', 'startup', 'platform'],
  ecommerce: ['ecommerce', 'e-commerce', 'retail', 'dtc', 'd2c', 'shopify', 'amazon'],
  consulting: ['consulting', 'agency', 'professional services'],
};

// ============================================
// AESTHETIC MODE CALCULATION
// ============================================

/**
 * Calculate the aesthetic mode based on provider industry and target market
 */
export function calculateAestheticMode(
  providerIndustry: string | null,
  targetMarket: string | null,
  audience: string | null
): AestheticMode {
  const normalizedProvider = normalizeIndustry(providerIndustry);
  const normalizedTarget = normalizeIndustry(targetMarket);
  
  // Try to infer target market from audience if not explicitly provided
  const inferredTarget = normalizedTarget || inferTargetFromAudience(audience);
  
  // If no target market detected or same as provider, use pure mode
  if (!inferredTarget || inferredTarget === normalizedProvider) {
    return {
      primary: normalizedProvider || 'default',
      secondary: null,
      blend: 'pure',
      rationale: `Designed for ${formatIndustryName(normalizedProvider || 'your')} industry`
    };
  }
  
  // Hybrid: target market drives primary, provider adds credibility
  return {
    primary: inferredTarget,
    secondary: normalizedProvider,
    blend: 'hybrid',
    rationale: `Designed for ${formatIndustryName(inferredTarget)} buyers with ${formatIndustryName(normalizedProvider || 'industry')} expertise`
  };
}

/**
 * Normalize industry string to a known variant key
 */
function normalizeIndustry(industry: string | null): string | null {
  if (!industry) return null;
  
  const lower = industry.toLowerCase();
  
  // Direct matches
  if (lower.includes('healthcare') || lower.includes('medical') || lower.includes('health')) return 'healthcare';
  if (lower.includes('cybersecurity') || lower.includes('security') || lower.includes('infosec')) return 'cybersecurity';
  if (lower.includes('manufacturing') || lower.includes('industrial')) return 'manufacturing';
  if (lower.includes('legal') || lower.includes('law')) return 'legal';
  if (lower.includes('finance') || lower.includes('financial') || lower.includes('banking')) return 'finance';
  if (lower.includes('saas') || lower.includes('software')) return 'saas';
  if (lower.includes('ecommerce') || lower.includes('e-commerce') || lower.includes('retail')) return 'ecommerce';
  if (lower.includes('consulting') || lower.includes('agency')) return 'consulting';
  
  return null;
}

/**
 * Infer target market from audience description
 */
function inferTargetFromAudience(audience: string | null): string | null {
  if (!audience) return null;
  
  const lower = audience.toLowerCase();
  
  for (const [market, keywords] of Object.entries(TARGET_MARKET_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return market;
    }
  }
  
  return null;
}

/**
 * Format industry name for display
 */
function formatIndustryName(industry: string): string {
  const names: Record<string, string> = {
    healthcare: 'Healthcare',
    cybersecurity: 'Cybersecurity',
    manufacturing: 'Manufacturing',
    legal: 'Legal',
    finance: 'Financial Services',
    saas: 'SaaS',
    ecommerce: 'E-commerce',
    consulting: 'Consulting',
    default: 'General',
    your: 'your',
    industry: 'industry',
  };
  return names[industry] || industry.charAt(0).toUpperCase() + industry.slice(1);
}

// ============================================
// HYBRID PALETTE GENERATION
// ============================================

export interface HybridPalette {
  background: string;
  primary: string;
  accent: string;
  tone: string;
  trustSignals: string[];
}

/**
 * Generate a hybrid palette blending two industries
 */
export function generateHybridPalette(
  primaryIndustry: string,
  secondaryIndustry: string | null
): HybridPalette {
  const primaryTraits = INDUSTRY_AESTHETIC_TRAITS[primaryIndustry] || INDUSTRY_AESTHETIC_TRAITS.default;
  const secondaryTraits = secondaryIndustry 
    ? (INDUSTRY_AESTHETIC_TRAITS[secondaryIndustry] || INDUSTRY_AESTHETIC_TRAITS.default)
    : primaryTraits;

  // Primary drives main colors
  const palette: HybridPalette = {
    background: primaryTraits.palette[2],
    primary: primaryTraits.palette[0],
    // Secondary adds accent (if different industry)
    accent: secondaryIndustry ? secondaryTraits.palette[1] : primaryTraits.palette[1],
    // Blend the tones
    tone: secondaryIndustry 
      ? `${primaryTraits.tone} with ${secondaryTraits.tone} credibility`
      : primaryTraits.tone,
    // Combine trust signals from both
    trustSignals: secondaryIndustry
      ? [...primaryTraits.trustSignals.slice(0, 2), ...secondaryTraits.trustSignals.slice(0, 2)]
      : primaryTraits.trustSignals,
  };

  return palette;
}

/**
 * Get aesthetic traits for a single industry
 */
export function getIndustryAestheticTraits(industry: string): IndustryAestheticTraits {
  return INDUSTRY_AESTHETIC_TRAITS[industry] || INDUSTRY_AESTHETIC_TRAITS.default;
}

/**
 * Check if a hybrid detection is confident (both industries clearly identified)
 */
export function isConfidentHybrid(aestheticMode: AestheticMode): boolean {
  return (
    aestheticMode.blend === 'hybrid' &&
    aestheticMode.primary !== 'default' &&
    aestheticMode.secondary !== null &&
    aestheticMode.secondary !== 'default'
  );
}
