/**
 * Intelligent Industry Classification System
 * 
 * Two-tier classification:
 * 1. Fast keyword match (instant, free) - handles 80% of cases
 * 2. AI-powered classification (when keywords fail) - uses consultation context
 * 
 * The classification result is stored on the consultation record to avoid re-classification.
 */

import { supabase } from '@/integrations/supabase/client';
import type { IndustryVariant } from './industryDesignSystem';

// ============================================
// TYPES
// ============================================

export interface IndustryClassification {
  variant: IndustryVariant;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  source: 'keyword' | 'ai' | 'fallback';
  classifiedAt?: string;
}

export interface ConsultationContext {
  industry?: string;
  industryCategory?: string;
  industrySubcategory?: string;
  businessName?: string;
  idealClient?: string;
  targetAudience?: string;
  uniqueStrength?: string;
  uniqueValue?: string;
  mainOffer?: string;
  offer?: string;
  identitySentence?: string;
  serviceType?: string;
  challenge?: string;
  goal?: string;
  proofElements?: string[];
  authorityMarkers?: string[];
}

// ============================================
// TIER 1: KEYWORD MATCH (Fast, Free)
// ============================================

/**
 * Fast keyword-based industry detection.
 * Returns the variant if a match is found, or 'default' if no match.
 * This is the existing logic extracted for reuse.
 */
export function keywordMatch(
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
  
  if (!searchString) return 'default';
  
  // === COMPOUND TERMS FIRST (most specific) ===
  // These must be checked before generic keywords to avoid misclassification
  
  // Venture studio, accelerator, incubator → consulting (they sell expertise, not software)
  if (searchString.includes('venture studio') || 
      searchString.includes('accelerator') ||
      searchString.includes('incubator') ||
      searchString.includes('studio')) {
    return 'consulting';
  }
  
  // Fractional executive → finance or consulting
  if (searchString.includes('fractional cfo') ||
      searchString.includes('fractional cmo') ||
      searchString.includes('fractional cto') ||
      searchString.includes('fractional exec')) {
    return 'consulting';
  }
  
  // === SUB-INDUSTRY DETECTION (specific tech verticals) ===
  
  if (searchString.includes('fintech') || 
      searchString.includes('financial software') ||
      searchString.includes('payment') ||
      searchString.includes('banking software')) {
    return 'fintech';
  }
  
  if (searchString.includes('healthtech') || 
      searchString.includes('healthcare tech') ||
      searchString.includes('medical software') ||
      searchString.includes('health software')) {
    return 'healthtech';
  }
  
  if (searchString.includes('devtools') || 
      searchString.includes('developer tool') ||
      searchString.includes('api platform') ||
      searchString.includes('sdk') ||
      searchString.includes('infrastructure')) {
    return 'devtools';
  }
  
  // Enterprise SaaS
  if ((searchString.includes('saas') || searchString.includes('software')) &&
      searchString.includes('enterprise')) {
    return 'saas-enterprise';
  }
  
  // === PRIMARY INDUSTRY DETECTION ===
  // Order matters! More specific patterns checked first.
  
  // Consulting detection - MUST come before SaaS
  if (searchString.includes('consult') || 
      searchString.includes('agency') ||
      searchString.includes('professional service') ||
      searchString.includes('advisory') ||
      searchString.includes('accounting') ||
      searchString.includes('legal') ||
      searchString.includes('executive search') ||
      searchString.includes('recruiting') ||
      searchString.includes('staffing') ||
      // HR-specific terms
      searchString.includes('human resource') ||
      searchString.includes('hr ') ||
      searchString.includes(' hr') ||
      searchString.includes('talent') ||
      searchString.includes('workforce') ||
      searchString.includes('retention') ||
      // Management consulting
      searchString.includes('management') ||
      searchString.includes('strategy') ||
      searchString.includes('operations')) {
    return 'consulting';
  }
  
  // Coaching detection
  if (searchString.includes('coach') || 
      searchString.includes('course') ||
      searchString.includes('training') ||
      searchString.includes('mentor') ||
      searchString.includes('speaker') ||
      searchString.includes('author')) {
    return 'coaching';
  }
  
  // Manufacturing detection
  if (searchString.includes('manufactur') || 
      searchString.includes('industrial') ||
      searchString.includes('aerospace') ||
      searchString.includes('defense') ||
      searchString.includes('supply chain') ||
      searchString.includes('precision') ||
      searchString.includes('fabricat') ||
      searchString.includes('oem')) {
    return 'manufacturing';
  }
  
  // Local services detection
  if (searchString.includes('plumb') ||
      searchString.includes('electric') ||
      searchString.includes('hvac') ||
      searchString.includes('roofing') ||
      searchString.includes('landscap') ||
      searchString.includes('cleaning service') ||
      searchString.includes('handyman') ||
      searchString.includes('contractor') ||
      searchString.includes('painter') ||
      searchString.includes('flooring')) {
    return 'default'; // Maps to local-services in the other system
  }
  
  // Healthcare detection
  if (searchString.includes('health') || 
      searchString.includes('medical') ||
      searchString.includes('clinic') ||
      searchString.includes('wellness') ||
      searchString.includes('therapy') ||
      searchString.includes('dental')) {
    return 'healthcare';
  }
  
  // Finance detection
  if (searchString.includes('financ') || 
      searchString.includes('banking') ||
      searchString.includes('invest') ||
      searchString.includes('wealth') ||
      searchString.includes('insurance') ||
      searchString.includes('cfo') ||
      searchString.includes('cpa')) {
    return 'fintech';
  }
  
  // Creative detection
  if (searchString.includes('creative') || 
      searchString.includes('design') ||
      searchString.includes('brand') ||
      searchString.includes('video') ||
      searchString.includes('photo') ||
      searchString.includes('art')) {
    return 'creative';
  }
  
  // Real estate detection
  if (searchString.includes('real estate') || 
      searchString.includes('property') ||
      searchString.includes('realtor') ||
      searchString.includes('proptech')) {
    return 'realestate';
  }
  
  // E-commerce detection
  if (searchString.includes('ecommerce') || 
      searchString.includes('e-commerce') ||
      searchString.includes('retail') ||
      searchString.includes('dtc') ||
      searchString.includes('shop') ||
      searchString.includes('store')) {
    return 'ecommerce';
  }
  
  // SaaS detection - LAST among business types (most generic tech terms)
  if (searchString.includes('saas') || 
      searchString.includes('software as a service') ||
      searchString.includes('tech startup') ||
      searchString.includes('platform')) {
    return 'saas';
  }
  
  return 'default';
}

// ============================================
// TIER 2: AI CLASSIFICATION (When Keywords Fail)
// ============================================

/**
 * Call the AI classification edge function.
 * Only called when keyword match returns 'default'.
 */
async function classifyWithAI(
  industry: string,
  context: ConsultationContext
): Promise<IndustryClassification> {
  console.log('🧠 [industryClassification] Invoking AI classification for:', industry);
  
  const { data, error } = await supabase.functions.invoke('classify-industry', {
    body: { industry, context }
  });
  
  if (error) {
    console.error('🧠 [industryClassification] AI call failed:', error);
    throw error;
  }
  
  if (!data?.success && data?.fallback) {
    console.log('🧠 [industryClassification] Using fallback from API:', data.fallback);
    return {
      ...data.fallback,
      classifiedAt: new Date().toISOString()
    };
  }
  
  if (!data?.success) {
    throw new Error(data?.error || 'Unknown classification error');
  }
  
  return {
    ...data.classification,
    classifiedAt: new Date().toISOString()
  };
}

// ============================================
// MAIN CLASSIFICATION FUNCTION
// ============================================

/**
 * Two-tier intelligent industry classification.
 * 
 * 1. First tries fast keyword matching (instant, free)
 * 2. If keywords fail, uses AI with full consultation context
 * 3. Falls back to 'consulting' if AI also fails
 * 
 * @param industry - The raw industry string from the user
 * @param consultationContext - Full context from consultation (optional for AI tier)
 * @param options - Configuration options
 */
export async function classifyIndustry(
  industry?: string,
  consultationContext?: ConsultationContext,
  options?: {
    industryCategory?: string;
    industrySubcategory?: string;
    pageType?: string;
    skipAI?: boolean; // For sync-only contexts
  }
): Promise<IndustryClassification> {
  const { industryCategory, industrySubcategory, pageType, skipAI } = options || {};
  
  // === TIER 1: Keyword match ===
  const keywordResult = keywordMatch(industry, industryCategory, industrySubcategory, pageType);
  
  if (keywordResult !== 'default') {
    console.log('🏭 [industryClassification] Keyword match:', keywordResult);
    return {
      variant: keywordResult,
      confidence: 'high',
      reasoning: `Direct keyword match for "${industry}"`,
      source: 'keyword',
      classifiedAt: new Date().toISOString()
    };
  }
  
  // === TIER 2: AI Classification ===
  if (consultationContext && !skipAI) {
    console.log('🧠 [industryClassification] No keyword match for:', industry, '— invoking AI classification');
    
    try {
      const aiResult = await classifyWithAI(industry || 'Unknown', {
        ...consultationContext,
        industry,
        industryCategory,
        industrySubcategory
      });
      
      console.log('🧠 [industryClassification] AI classified as:', aiResult.variant, '| Reason:', aiResult.reasoning);
      return aiResult;
    } catch (error) {
      console.error('🧠 [industryClassification] AI classification failed:', error);
    }
  }
  
  // === TIER 3: Safe fallback ===
  console.log('🏭 [industryClassification] Falling back to consulting (safest default)');
  return {
    variant: 'consulting',
    confidence: 'low',
    reasoning: `Could not classify "${industry}" — defaulting to professional services treatment`,
    source: 'fallback',
    classifiedAt: new Date().toISOString()
  };
}

/**
 * Synchronous classification - keyword only.
 * Use this when you can't await (e.g., initial render).
 * For full AI-powered classification, use classifyIndustry() and await it.
 */
export function classifyIndustrySync(
  industry?: string,
  options?: {
    industryCategory?: string;
    industrySubcategory?: string;
    pageType?: string;
  }
): IndustryClassification {
  const { industryCategory, industrySubcategory, pageType } = options || {};
  const keywordResult = keywordMatch(industry, industryCategory, industrySubcategory, pageType);
  
  if (keywordResult !== 'default') {
    return {
      variant: keywordResult,
      confidence: 'high',
      reasoning: `Direct keyword match for "${industry}"`,
      source: 'keyword',
      classifiedAt: new Date().toISOString()
    };
  }
  
  // For sync, default to consulting (safest)
  return {
    variant: 'consulting',
    confidence: 'low',
    reasoning: `Could not classify "${industry}" synchronously — use classifyIndustry() for AI-powered classification`,
    source: 'fallback',
    classifiedAt: new Date().toISOString()
  };
}

// ============================================
// STORAGE HELPERS
// ============================================

/**
 * Store classification result on a consultation record.
 * This prevents re-classification on every page load.
 * 
 * Note: This merges the classification into the existing extracted_intelligence JSON.
 */
export async function storeClassificationOnConsultation(
  consultationId: string,
  classification: IndustryClassification
): Promise<void> {
  console.log('💾 [industryClassification] Storing classification on consultation:', consultationId);
  
  // First, get existing intelligence to merge
  const { data: existing } = await supabase
    .from('consultations')
    .select('extracted_intelligence')
    .eq('id', consultationId)
    .single();
  
  const currentIntelligence = (existing?.extracted_intelligence as Record<string, unknown>) || {};
  
  // Convert classification to JSON-compatible format
  const classificationJson = {
    variant: classification.variant,
    confidence: classification.confidence,
    reasoning: classification.reasoning,
    source: classification.source,
    classifiedAt: classification.classifiedAt || new Date().toISOString()
  };
  
  const { error } = await supabase
    .from('consultations')
    .update({
      extracted_intelligence: {
        ...currentIntelligence,
        industryClassification: classificationJson
      }
    })
    .eq('id', consultationId);
  
  if (error) {
    console.error('💾 [industryClassification] Failed to store classification:', error);
  }
}

/**
 * Retrieve stored classification from consultation.
 */
export function getStoredClassification(
  extractedIntelligence: any
): IndustryClassification | null {
  if (!extractedIntelligence?.industryClassification) {
    return null;
  }
  
  const stored = extractedIntelligence.industryClassification;
  
  // Validate it has required fields
  if (!stored.variant || !stored.source) {
    return null;
  }
  
  return stored as IndustryClassification;
}

// ============================================
// DESIGN INTELLIGENCE REPORT HELPERS
// ============================================

/**
 * Generate a human-readable design intelligence report section.
 */
export function generateDesignIntelligenceReport(
  classification: IndustryClassification,
  industryInput: string
): string {
  const methodMap = {
    'keyword': 'Keyword match',
    'ai': 'AI-inferred (intelligent classification)',
    'fallback': 'Fallback (classification unavailable)'
  };
  
  const variantDescriptions: Record<string, string> = {
    'saas': 'B2B SaaS → Dark mode, glass cards, product-forward',
    'saas-enterprise': 'Enterprise SaaS → Dark mode, security-first, compliance-forward',
    'consulting': 'Professional Services → Light mode, trust-forward, credibility-focused',
    'coaching': 'Coaching/Training → Warm mode, transformation-focused',
    'manufacturing': 'Manufacturing → Light mode, capability-forward, certifications prominent',
    'healthcare': 'Healthcare → Light mode, trust + compliance, calm palette',
    'finance': 'Finance → Light mode, stability-focused, navy/green palette',
    'fintech': 'Fintech → Dark mode, security-forward, modern finance',
    'healthtech': 'Healthtech → Light mode, clinical + tech blend',
    'devtools': 'Developer Tools → Dark mode, technical, code-forward',
    'creative': 'Creative → Dark mode, portfolio-forward, bold accents',
    'ecommerce': 'E-commerce → Light mode, product-forward, conversion-optimized',
    'realestate': 'Real Estate → Light mode, property-forward, earth tones',
    'investor': 'Investor Relations → Dark mode, metrics-forward',
    'beta': 'Beta/Pre-launch → Dark mode, exclusivity-focused'
  };
  
  return `### Design Intelligence Report

**Industry Classification:** ${industryInput} → ${variantDescriptions[classification.variant] || classification.variant}
**Classification method:** ${methodMap[classification.source]}
**Confidence:** ${classification.confidence}
**Reasoning:** "${classification.reasoning}"
`;
}
