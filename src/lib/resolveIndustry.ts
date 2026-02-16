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

// =============================================================================
// WEIGHTED KEYWORD SCORING
// =============================================================================

interface WeightedKeyword {
  keyword: string;
  weight: number; // 1 = low, 2 = medium, 3 = high
}

interface WeightedIndustryEntry {
  industry: IndustryVariant;
  keywords: WeightedKeyword[];
  /** Minimum score to auto-classify (default: 5) */
  threshold?: number;
  /** Score range for "likely" classification (default: 3-4) */
  likelyMin?: number;
}

const WEIGHTED_INDUSTRY_MAP: WeightedIndustryEntry[] = [
  // Healthcare — must score before creative/consulting to avoid misclassification
  {
    industry: 'healthcare',
    threshold: 5,
    likelyMin: 3,
    keywords: [
      // High-weight (3 pts)
      { keyword: 'patient', weight: 3 },
      { keyword: 'healthcare', weight: 3 },
      { keyword: 'medical', weight: 3 },
      { keyword: 'clinical', weight: 3 },
      { keyword: 'pharma', weight: 3 },
      { keyword: 'biopharma', weight: 3 },
      { keyword: 'hospital', weight: 3 },
      { keyword: 'physician', weight: 3 },
      { keyword: 'therapy', weight: 3 },
      { keyword: 'prescription', weight: 3 },
      { keyword: 'diagnosis', weight: 3 },
      { keyword: 'hipaa', weight: 3 },
      { keyword: 'fda', weight: 3 },
      { keyword: 'ehr', weight: 3 },
      { keyword: 'emr', weight: 3 },
      { keyword: 'telehealth', weight: 3 },
      { keyword: 'telemedicine', weight: 3 },
      // Medium-weight (2 pts)
      { keyword: 'sdoh', weight: 2 },
      { keyword: 'prior authorization', weight: 2 },
      { keyword: 'formulary', weight: 2 },
      { keyword: 'copay', weight: 2 },
      { keyword: 'adherence', weight: 2 },
      { keyword: 'specialty pharma', weight: 2 },
      { keyword: 'hub services', weight: 2 },
      { keyword: 'patient access', weight: 2 },
      { keyword: 'clinical trial', weight: 2 },
      { keyword: 'drug', weight: 2 },
      { keyword: 'medication', weight: 2 },
      { keyword: 'treatment', weight: 2 },
      { keyword: 'care coordination', weight: 2 },
      { keyword: 'health plan', weight: 2 },
      { keyword: 'payer', weight: 2 },
      // Low-weight (1 pt)
      { keyword: 'wellness', weight: 1 },
      { keyword: 'health', weight: 1 },
      { keyword: 'outcomes', weight: 1 },
      { keyword: 'compliance', weight: 1 },
      { keyword: 'regulatory', weight: 1 },
      { keyword: 'provider', weight: 1 },
      { keyword: 'coverage', weight: 1 },
      { keyword: 'reimbursement', weight: 1 },
    ],
  },
  // Finance / Fintech
  {
    industry: 'fintech',
    threshold: 5,
    likelyMin: 3,
    keywords: [
      { keyword: 'loan', weight: 3 },
      { keyword: 'mortgage', weight: 3 },
      { keyword: 'apr', weight: 3 },
      { keyword: 'portfolio', weight: 3 },
      { keyword: 'investment', weight: 3 },
      { keyword: 'banking', weight: 3 },
      { keyword: 'fintech', weight: 3 },
      { keyword: 'trading', weight: 3 },
      { keyword: 'asset', weight: 2 },
      { keyword: 'wealth', weight: 2 },
      { keyword: 'fiduciary', weight: 2 },
      { keyword: 'financial', weight: 2 },
      { keyword: 'fund', weight: 2 },
      { keyword: 'capital', weight: 2 },
      { keyword: 'insurance', weight: 2 },
      { keyword: 'payment', weight: 2 },
      { keyword: 'invest', weight: 2 },
    ],
  },
  // Legal → maps to consulting (no dedicated variant)
  {
    industry: 'consulting',
    threshold: 5,
    likelyMin: 3,
    keywords: [
      { keyword: 'attorney', weight: 3 },
      { keyword: 'litigation', weight: 3 },
      { keyword: 'court', weight: 3 },
      { keyword: 'deposition', weight: 3 },
      { keyword: 'paralegal', weight: 3 },
      { keyword: 'statute', weight: 3 },
      { keyword: 'counsel', weight: 3 },
      { keyword: 'plaintiff', weight: 3 },
      { keyword: 'defense', weight: 2 },
      { keyword: 'case', weight: 1 },
      { keyword: 'legal', weight: 2 },
      { keyword: 'law firm', weight: 3 },
    ],
  },
  // Education → maps to coaching (no dedicated variant)
  {
    industry: 'coaching',
    threshold: 5,
    likelyMin: 3,
    keywords: [
      { keyword: 'curriculum', weight: 3 },
      { keyword: 'student', weight: 3 },
      { keyword: 'enrollment', weight: 3 },
      { keyword: 'campus', weight: 3 },
      { keyword: 'tuition', weight: 3 },
      { keyword: 'faculty', weight: 3 },
      { keyword: 'coursework', weight: 3 },
      { keyword: 'accreditation', weight: 3 },
    ],
  },
  // Consulting / Professional Services
  {
    industry: 'consulting',
    threshold: 3,
    keywords: [
      { keyword: 'consulting', weight: 3 },
      { keyword: 'advisory', weight: 3 },
      { keyword: 'consultant', weight: 3 },
      { keyword: 'advisory firm', weight: 3 },
      { keyword: 'management consulting', weight: 3 },
      { keyword: 'strategy consulting', weight: 3 },
      { keyword: 'hr consulting', weight: 3 },
      { keyword: 'venture studio', weight: 3 },
      { keyword: 'incubator', weight: 3 },
      { keyword: 'accelerator', weight: 3 },
      { keyword: 'accounting', weight: 2 },
      { keyword: 'human resource', weight: 2 },
      { keyword: 'recruitment', weight: 2 },
      { keyword: 'staffing', weight: 2 },
      { keyword: 'workforce', weight: 2 },
      { keyword: 'retention', weight: 1 },
      { keyword: 'mentor', weight: 1 },
    ],
  },
  // Coaching
  {
    industry: 'coaching',
    threshold: 3,
    keywords: [
      { keyword: 'coach', weight: 3 },
      { keyword: 'coaching', weight: 3 },
      { keyword: 'course creator', weight: 3 },
      { keyword: 'training program', weight: 3 },
      { keyword: 'speaker', weight: 2 },
      { keyword: 'author', weight: 1 },
      { keyword: 'executive coaching', weight: 3 },
      { keyword: 'life coach', weight: 3 },
      { keyword: 'business coaching', weight: 3 },
    ],
  },
  // Manufacturing
  {
    industry: 'manufacturing',
    threshold: 3,
    keywords: [
      { keyword: 'manufacturer', weight: 3 },
      { keyword: 'industrial', weight: 3 },
      { keyword: 'supply chain', weight: 3 },
      { keyword: 'fabricat', weight: 3 },
      { keyword: 'oem', weight: 3 },
      { keyword: 'precision', weight: 2 },
      { keyword: 'aerospace', weight: 2 },
      { keyword: 'factory', weight: 2 },
    ],
  },
  // SaaS / Technology
  {
    industry: 'saas',
    threshold: 3,
    keywords: [
      { keyword: 'saas', weight: 3 },
      { keyword: 'software as a service', weight: 3 },
      { keyword: 'b2b software', weight: 3 },
      { keyword: 'cloud service', weight: 3 },
      { keyword: 'platform', weight: 2 },
      { keyword: 'software', weight: 2 },
      { keyword: 'app', weight: 1 },
      { keyword: 'tool', weight: 1 },
      { keyword: 'tech startup', weight: 2 },
    ],
  },
  // Creative / Agency
  {
    industry: 'creative',
    threshold: 3,
    keywords: [
      { keyword: 'design agency', weight: 3 },
      { keyword: 'brand agency', weight: 3 },
      { keyword: 'video production', weight: 3 },
      { keyword: 'photography', weight: 3 },
      { keyword: 'art director', weight: 3 },
      { keyword: 'agency', weight: 2 },
      { keyword: 'studio', weight: 2 },
      { keyword: 'creative', weight: 1 },
    ],
  },
  // E-commerce
  {
    industry: 'ecommerce',
    threshold: 3,
    keywords: [
      { keyword: 'ecommerce', weight: 3 },
      { keyword: 'e-commerce', weight: 3 },
      { keyword: 'retail', weight: 3 },
      { keyword: 'dtc', weight: 3 },
      { keyword: 'marketplace', weight: 3 },
      { keyword: 'product sales', weight: 3 },
      { keyword: 'shop', weight: 2 },
      { keyword: 'store', weight: 1 },
    ],
  },
  // Real Estate
  {
    industry: 'realestate',
    threshold: 3,
    keywords: [
      { keyword: 'real estate', weight: 3 },
      { keyword: 'property', weight: 3 },
      { keyword: 'realtor', weight: 3 },
      { keyword: 'brokerage', weight: 3 },
      { keyword: 'housing', weight: 2 },
    ],
  },
  // Developer Tools
  {
    industry: 'devtools',
    threshold: 3,
    keywords: [
      { keyword: 'devtools', weight: 3 },
      { keyword: 'developer tool', weight: 3 },
      { keyword: 'developer platform', weight: 3 },
      { keyword: 'api', weight: 2 },
      { keyword: 'sdk', weight: 2 },
      { keyword: 'infrastructure', weight: 1 },
    ],
  },
];

// =============================================================================
// SCORE CALCULATOR
// =============================================================================

function scoreText(text: string, keywords: WeightedKeyword[]): number {
  let score = 0;
  const lower = text.toLowerCase();
  for (const { keyword, weight } of keywords) {
    if (lower.includes(keyword)) {
      score += weight;
    }
  }
  return score;
}

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

  // 2. Weighted keyword scoring — find the highest-scoring industry
  const scores: Array<{ industry: IndustryVariant; score: number; threshold: number; likelyMin: number }> = [];
  for (const entry of WEIGHTED_INDUSTRY_MAP) {
    const score = scoreText(normalized, entry.keywords);
    if (score > 0) {
      scores.push({
        industry: entry.industry,
        score,
        threshold: entry.threshold ?? 5,
        likelyMin: entry.likelyMin ?? 3,
      });
    }
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  if (scores.length > 0) {
    const best = scores[0];
    if (best.score >= best.threshold) {
      console.log(`🏭 [resolveIndustry] Weighted match: "${normalized}" → ${best.industry} (score: ${best.score}, threshold: ${best.threshold})`);
      return { industry: best.industry, source: 'keyword', confidence: 'high' };
    }
    if (best.score >= best.likelyMin) {
      console.log(`🏭 [resolveIndustry] Likely match: "${normalized}" → ${best.industry} (score: ${best.score}, likely range)`);
      return { industry: best.industry, source: 'keyword', confidence: 'medium' };
    }
  }

  // 3. Scored fallback (AI classification)
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

  // Also try weighted scoring on scored industry string
  if (scoredNorm && (scoredConfidence === 'high' || scoredConfidence === 'medium')) {
    const scoredScores: Array<{ industry: IndustryVariant; score: number; threshold: number }> = [];
    for (const entry of WEIGHTED_INDUSTRY_MAP) {
      const score = scoreText(scoredNorm, entry.keywords);
      if (score > 0) {
        scoredScores.push({ industry: entry.industry, score, threshold: entry.threshold ?? 5 });
      }
    }
    scoredScores.sort((a, b) => b.score - a.score);
    if (scoredScores.length > 0 && scoredScores[0].score >= (scoredScores[0].threshold)) {
      console.log(`🏭 [resolveIndustry] Scored weighted match: "${scoredNorm}" → ${scoredScores[0].industry} (score: ${scoredScores[0].score})`);
      return { industry: scoredScores[0].industry, source: 'scored', confidence: scoredConfidence as 'high' | 'medium' };
    }
  }

  // 4. Default
  console.log(`🏭 [resolveIndustry] No match for "${normalized}", using default`);
  return { industry: 'default', source: 'default', confidence: 'low' };
}
