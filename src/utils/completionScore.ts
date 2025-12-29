import { FIELD_REGISTRY, FieldTier } from '@/types/consultationContract';

export interface CompletionResult {
  score: number;
  tier: 'insufficient' | 'minimal' | 'good' | 'comprehensive';
  tierScores: Record<FieldTier, { filled: number; total: number; percentage: number }>;
  filledFields: string[];
  missingRequired: string[];
  missingEnrichment: string[];
  missingProof: string[];
  canGenerateBrief: boolean;
}

function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

export function calculateCompletionScore(data: Record<string, any>): CompletionResult {
  const tierScores: Record<FieldTier, { filled: number; total: number; percentage: number }> = {
    required: { filled: 0, total: 0, percentage: 0 },
    enrichment: { filled: 0, total: 0, percentage: 0 },
    proof: { filled: 0, total: 0, percentage: 0 },
    advanced: { filled: 0, total: 0, percentage: 0 },
    brand: { filled: 0, total: 0, percentage: 0 },
  };
  
  const filledFields: string[] = [];
  const missingRequired: string[] = [];
  const missingEnrichment: string[] = [];
  const missingProof: string[] = [];
  
  let totalScore = 0;
  let maxScore = 0;
  
  for (const field of FIELD_REGISTRY) {
    maxScore += field.weight;
    tierScores[field.tier].total += field.weight;
    
    const value = getNestedValue(data, field.key);
    const isFilled = value !== null && value !== undefined && value !== '' && 
                     (Array.isArray(value) ? value.length > 0 : true);
    
    if (isFilled) {
      totalScore += field.weight;
      tierScores[field.tier].filled += field.weight;
      filledFields.push(field.key);
    } else {
      if (field.tier === 'required') missingRequired.push(field.label);
      if (field.tier === 'enrichment') missingEnrichment.push(field.label);
      if (field.tier === 'proof') missingProof.push(field.label);
    }
  }
  
  // Calculate percentages
  for (const tier of Object.keys(tierScores) as FieldTier[]) {
    tierScores[tier].percentage = tierScores[tier].total > 0 
      ? Math.round((tierScores[tier].filled / tierScores[tier].total) * 100)
      : 0;
  }
  
  const score = Math.round((totalScore / maxScore) * 100);
  
  return {
    score,
    tier: score >= 90 ? 'comprehensive' : score >= 70 ? 'good' : score >= 50 ? 'minimal' : 'insufficient',
    tierScores,
    filledFields,
    missingRequired,
    missingEnrichment,
    missingProof,
    canGenerateBrief: missingRequired.length === 0,
  };
}
