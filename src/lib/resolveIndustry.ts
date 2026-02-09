/**
 * Unified Industry Resolution Utility
 * 
 * Single source of truth for resolving raw industry strings into 
 * canonical IndustryVariant values with source tracking.
 * 
 * Resolution chain:
 * 1. Exact match against SUPPORTED_INDUSTRIES
 * 2. Keyword mapping (common words → industry)
 * 3. Scored fallback (if confidence >= medium)
 * 4. Default: "default"
 * 
 * @module resolveIndustry
 */

import type { IndustryVariant } from '@/lib/industryDesignSystem';

// =============================================================================
// SUPPORTED INDUSTRIES (canonical keys)
// =============================================================================

export const SUPPORTED_INDUSTRIES: Record<string, IndustryVariant> = {
  saas: 'saas',
  'saas-enterprise': 'saas-enterprise',
  'saas-startup': 'saas-startup',
  fintech: 'fintech',
  healthtech: 'healthtech',
  devtools: 'devtools',
  consulting: 'consulting',
  coaching: 'coaching',
  manufacturing: 'manufacturing',
  healthcare: 'healthcare',
  ecommerce: 'ecommerce',
  creative: 'creative',
  realestate: 'realestate',
  investor: 'investor',
  beta: 'beta',
  default: 'default',
};

// =============================================================================
// KEYWORD → INDUSTRY MAP
// =============================================================================

const KEYWORD_MAP: Array<{ keywords: string[]; industry: IndustryVariant }> = [
  // Consulting / Professional Services (check BEFORE saas to avoid misclassification)
  {
    keywords: ['consulting', 'advisory', 'coaching', 'mentor', 'consultant', 'advisory firm',
               'management consulting', 'strategy consulting', 'hr consulting',
               'venture studio', 'incubator', 'accelerator', 'accounting', 'legal',
               'human resource', 'recruitment', 'staffing', 'workforce', 'retention'],
    industry: 'consulting',
  },
  // Coaching (separate from consulting for design tokens)
  {
    keywords: ['coach', 'course creator', 'training program', 'speaker', 'author',
               'executive coaching', 'life coach', 'business coaching'],
    industry: 'coaching',
  },
  // Manufacturing
  {
    keywords: ['manufacturer', 'industrial', 'supply chain', 'fabricat', 'oem',
               'precision', 'aerospace', 'factory'],
    industry: 'manufacturing',
  },
  // SaaS / Technology (after consulting to avoid false positives)
  {
    keywords: ['platform', 'software', 'app', 'tool', 'saas', 'tech startup',
               'software as a service', 'cloud service', 'b2b software'],
    industry: 'saas',
  },
  // Creative / Agency
  {
    keywords: ['agency', 'studio', 'creative', 'design agency', 'brand agency',
               'video production', 'photography', 'art director'],
    industry: 'creative',
  },
  // Healthcare
  {
    keywords: ['clinic', 'health', 'medical', 'therapy', 'dental', 'wellness',
               'hospital', 'physician', 'patient'],
    industry: 'healthcare',
  },
  // Finance
  {
    keywords: ['fund', 'capital', 'financial', 'banking', 'invest', 'wealth',
               'insurance', 'fintech', 'payment'],
    industry: 'fintech',
  },
  // E-commerce
  {
    keywords: ['ecommerce', 'e-commerce', 'retail', 'dtc', 'shop', 'store',
               'marketplace', 'product sales'],
    industry: 'ecommerce',
  },
  // Real Estate
  {
    keywords: ['real estate', 'property', 'realtor', 'brokerage', 'housing'],
    industry: 'realestate',
  },
  // Developer Tools
  {
    keywords: ['devtools', 'developer tool', 'api', 'sdk', 'infrastructure',
               'developer platform'],
    industry: 'devtools',
  },
];

// =============================================================================
// RESOLUTION RESULT
// =============================================================================

export interface IndustryResolution {
  industry: IndustryVariant;
  source: 'exact' | 'keyword' | 'scored' | 'default';
  confidence: 'high' | 'medium' | 'low';
}

// =============================================================================
// RESOLVE FUNCTION
// =============================================================================

/**
 * Resolve a raw industry string into a canonical IndustryVariant.
 * 
 * @param statedIndustry - User-stated or consultation-derived industry string
 * @param scoredIndustry - AI-scored / classified industry string (optional)
 * @param scoredConfidence - Confidence of the scored result: 'high' | 'medium' | 'low'
 */
export function resolveIndustry(
  statedIndustry?: string | null,
  scoredIndustry?: string | null,
  scoredConfidence?: string | null
): IndustryResolution {
  const normalized = statedIndustry?.toLowerCase().trim() || '';

  // 1. Exact match
  if (normalized && SUPPORTED_INDUSTRIES[normalized]) {
    console.log(`🏭 [resolveIndustry] Exact match: "${normalized}"`);
    return { industry: SUPPORTED_INDUSTRIES[normalized], source: 'exact', confidence: 'high' };
  }

  // 2. Keyword mapping
  for (const entry of KEYWORD_MAP) {
    for (const kw of entry.keywords) {
      if (normalized.includes(kw)) {
        console.log(`🏭 [resolveIndustry] Keyword match: "${kw}" → ${entry.industry}`);
        return { industry: entry.industry, source: 'keyword', confidence: 'high' };
      }
    }
  }

  // 3. Scored fallback
  const scoredNorm = scoredIndustry?.toLowerCase().trim() || '';
  if (scoredNorm && SUPPORTED_INDUSTRIES[scoredNorm] && 
      (scoredConfidence === 'high' || scoredConfidence === 'medium')) {
    console.log(`🏭 [resolveIndustry] Scored fallback: "${scoredNorm}" (${scoredConfidence})`);
    return { 
      industry: SUPPORTED_INDUSTRIES[scoredNorm], 
      source: 'scored', 
      confidence: scoredConfidence as 'high' | 'medium',
    };
  }

  // Also try keyword matching on scored industry
  if (scoredNorm && (scoredConfidence === 'high' || scoredConfidence === 'medium')) {
    for (const entry of KEYWORD_MAP) {
      for (const kw of entry.keywords) {
        if (scoredNorm.includes(kw)) {
          console.log(`🏭 [resolveIndustry] Scored keyword match: "${kw}" → ${entry.industry}`);
          return { industry: entry.industry, source: 'scored', confidence: scoredConfidence as 'high' | 'medium' };
        }
      }
    }
  }

  // 4. Default
  console.log(`🏭 [resolveIndustry] No match for "${normalized}", using default`);
  return { industry: 'default', source: 'default', confidence: 'low' };
}
