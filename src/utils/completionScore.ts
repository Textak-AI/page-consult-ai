import { FIELD_REGISTRY, FieldTier } from '@/types/consultationContract';

export interface CompletionResult {
  score: number;
  tier: 'insufficient' | 'minimal' | 'good' | 'comprehensive';
  filledFields: string[];
  missingRequired: string[];
  canGenerateBrief: boolean;
}

export function calculateCompletionScore(data: Record<string, any>): CompletionResult {
  const filledFields: string[] = [];
  const missingRequired: string[] = [];
  
  let totalScore = 0;
  let maxScore = 0;
  
  for (const field of FIELD_REGISTRY) {
    maxScore += field.weight;
    
    const value = data[field.key];
    const isFilled = value !== null && value !== undefined && value !== '' && 
                     (Array.isArray(value) ? value.length > 0 : true);
    
    if (isFilled) {
      totalScore += field.weight;
      filledFields.push(field.key);
    } else if (field.tier === 'required') {
      missingRequired.push(field.label);
    }
  }
  
  const score = Math.round((totalScore / maxScore) * 100);
  
  return {
    score,
    tier: score >= 90 ? 'comprehensive' : score >= 70 ? 'good' : score >= 50 ? 'minimal' : 'insufficient',
    filledFields,
    missingRequired,
    canGenerateBrief: missingRequired.length === 0,
  };
}
