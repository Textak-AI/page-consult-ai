import type { ExtractedIntelligence, ReadinessResult, ReadinessFieldResult } from '@/types/consultationReadiness';

interface ReadinessField {
  field: string;
  weight: number;
  required: boolean;
  validator: (intel: ExtractedIntelligence) => boolean;
}

const READINESS_FIELDS: ReadinessField[] = [
  // Required fields (must have ALL for generation)
  { 
    field: 'industry', 
    weight: 10, 
    required: true, 
    validator: (i) => !!i.industry && i.industry.length > 2 
  },
  { 
    field: 'audience', 
    weight: 15, 
    required: true,
    validator: (i) => !!i.audience && i.audience.length > 5 
  },
  { 
    field: 'valueProp', 
    weight: 15, 
    required: true,
    validator: (i) => !!i.valueProp && i.valueProp.length > 10 
  },
  { 
    field: 'painPoints', 
    weight: 15, 
    required: true,
    validator: (i) => i.painPoints.length >= 2 
  },
  
  // Important fields (needed for quality)
  { 
    field: 'audienceRole', 
    weight: 10, 
    required: false,
    validator: (i) => !!i.audienceRole && i.audienceRole.length > 3
  },
  { 
    field: 'buyerObjections', 
    weight: 10, 
    required: false,
    validator: (i) => i.buyerObjections.length >= 1 
  },
  { 
    field: 'competitorDifferentiation', 
    weight: 10, 
    required: false,
    validator: (i) => !!i.competitorDifferentiation && i.competitorDifferentiation.length > 10 
  },
  { 
    field: 'proofElements', 
    weight: 10, 
    required: false,
    validator: (i) => i.proofElements.length >= 1 
  },
  
  // Nice to have
  { 
    field: 'toneDirection', 
    weight: 5, 
    required: false,
    validator: (i) => !!i.toneDirection && i.toneDirection.length > 3
  },
];

export const MINIMUM_SCORE_FOR_GENERATION = 70;
export const REQUIRED_FIELDS_MUST_PASS = true;

/**
 * Calculate readiness score based on captured intelligence
 */
export function calculateReadiness(intel: Partial<ExtractedIntelligence> | null): ReadinessResult {
  if (!intel) {
    return {
      score: 0,
      canGenerate: false,
      missingRequired: READINESS_FIELDS.filter(f => f.required).map(f => f.field),
      breakdown: READINESS_FIELDS.map(f => ({
        field: f.field,
        score: 0,
        maxScore: f.weight,
        captured: false,
      })),
    };
  }

  let totalScore = 0;
  const missingRequired: string[] = [];
  const breakdown: ReadinessFieldResult[] = [];
  
  // Fill in defaults for partial intelligence
  const fullIntel: ExtractedIntelligence = {
    source: intel.source || 'demo',
    capturedAt: intel.capturedAt || new Date().toISOString(),
    industry: intel.industry || null,
    subIndustry: intel.subIndustry || null,
    audience: intel.audience || null,
    audienceRole: intel.audienceRole || null,
    valueProp: intel.valueProp || null,
    businessName: intel.businessName || null,
    painPoints: intel.painPoints || [],
    buyerObjections: intel.buyerObjections || [],
    competitorDifferentiation: intel.competitorDifferentiation || null,
    proofElements: intel.proofElements || [],
    toneDirection: intel.toneDirection || null,
    goals: intel.goals || null,
    marketResearch: intel.marketResearch || {
      marketSize: null,
      buyerPersona: null,
      commonObjections: [],
      industryInsights: [],
      researchedAt: null,
    },
    conversationHistory: intel.conversationHistory || [],
    readinessScore: intel.readinessScore || 0,
    readinessBreakdown: intel.readinessBreakdown || [],
  };
  
  for (const field of READINESS_FIELDS) {
    const captured = field.validator(fullIntel);
    const score = captured ? field.weight : 0;
    
    breakdown.push({
      field: field.field,
      score,
      maxScore: field.weight,
      captured
    });
    
    totalScore += score;
    
    if (field.required && !captured) {
      missingRequired.push(field.field);
    }
  }
  
  const canGenerate = 
    totalScore >= MINIMUM_SCORE_FOR_GENERATION && 
    (REQUIRED_FIELDS_MUST_PASS ? missingRequired.length === 0 : true);
  
  return { score: totalScore, canGenerate, missingRequired, breakdown };
}

/**
 * Format field name for display
 */
export function formatFieldName(field: string): string {
  const fieldNames: Record<string, string> = {
    industry: 'Industry',
    audience: 'Target Audience',
    valueProp: 'Value Proposition',
    painPoints: 'Pain Points',
    audienceRole: 'Audience Role',
    buyerObjections: 'Buyer Objections',
    competitorDifferentiation: 'Competitive Edge',
    proofElements: 'Proof & Credibility',
    toneDirection: 'Brand Tone',
  };
  
  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1);
}

/**
 * Get status description for a consultation status
 */
export function getStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    'not_started': 'No consultation data yet',
    'demo_started': 'Demo in progress',
    'demo_complete': 'Demo complete - ready for full consultation',
    'wizard_in_progress': 'Full consultation in progress',
    'wizard_complete': 'Consultation complete - reviewing',
    'generation_ready': 'Ready to generate landing page',
  };
  
  return descriptions[status] || 'Unknown status';
}

/**
 * Check if a status allows navigation to generate page
 */
export function canNavigateToGenerate(status: string): boolean {
  return status === 'generation_ready' || status === 'wizard_complete';
}

/**
 * Get the next step for a given status
 */
export function getNextStep(status: string): { path: string; label: string } {
  switch (status) {
    case 'not_started':
      return { path: '/', label: 'Start Demo' };
    case 'demo_started':
      return { path: '/', label: 'Continue Demo' };
    case 'demo_complete':
      return { path: '/wizard', label: 'Start Full Consultation' };
    case 'wizard_in_progress':
      return { path: '/wizard', label: 'Continue Consultation' };
    case 'wizard_complete':
    case 'generation_ready':
      return { path: '/generate', label: 'Generate Page' };
    default:
      return { path: '/', label: 'Start Over' };
  }
}
