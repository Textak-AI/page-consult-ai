import type {
  IntelligenceScore,
  StrategicLevel,
  WhoYouAreScore,
  WhatYouOfferScore,
  BuyerRealityScore,
  ProofCredibilityScore,
  FieldScore,
} from '@/types/intelligenceScore';
import { FIELD_POINTS } from '@/types/intelligenceScore';

// Generic intelligence type that supports multiple field naming conventions
export interface GenericIntelligence {
  // WHO YOU ARE
  industry?: string | null;
  industryFull?: string | null; // Full value for Hero/CTA (max 50 chars)
  industrySummary?: string | null;
  audience?: string | null;
  audienceFull?: string | null;
  audienceSummary?: string | null;
  geography?: string | null;
  geographySummary?: string | null;
  
  // WHAT YOU OFFER
  valueProp?: string | null;
  valuePropFull?: string | null;
  valuePropSummary?: string | null;
  competitiveEdge?: string | null;
  competitorDifferentiator?: string | null;
  competitorDifferentiatorFull?: string | null;
  competitorDifferentiation?: string | null;
  edgeSummary?: string | null;
  method?: string | null;
  methodSummary?: string | null;
  
  // BUYER REALITY
  painPoints?: string | string[] | null;
  painPointsFull?: string | null;
  painSummary?: string | null;
  buyerObjections?: string | string[] | null;
  buyerObjectionsFull?: string | null;
  objectionsSummary?: string | null;
  triggers?: string | null;
  triggersSummary?: string | null;
  
  // PROOF & CREDIBILITY
  proofElements?: string | string[] | null;
  proofElementsFull?: string | null;
  results?: string | null;
  resultsSummary?: string | null;
  proofSummary?: string | null;
  socialProof?: string | null;
  socialProofSummary?: string | null;
  credentials?: string | null;
  credentialsSummary?: string | null;
}

// Helper to check if field has meaningful value
function hasValue(val: unknown): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0 && val !== 'null';
  if (Array.isArray(val)) return val.length > 0 && val.some(v => typeof v === 'string' && v.trim().length > 0);
  return true;
}

// Helper to get string value from various formats
function getStringValue(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'string' && val.trim() && val !== 'null') return val.trim();
  if (Array.isArray(val) && val.length > 0) {
    const first = val[0];
    return typeof first === 'string' && first.trim() ? first.trim() : null;
  }
  return null;
}

// Create a field score with bonus for specificity
function createFieldScore(
  value: unknown,
  summary: unknown,
  maxPoints: number
): FieldScore {
  const strValue = getStringValue(value);
  const strSummary = typeof summary === 'string' && summary.trim() ? summary.trim() : null;
  
  // Calculate points with specificity bonus
  let points = 0;
  if (strValue) {
    // Base points for having a value (60% of max)
    points = Math.round(maxPoints * 0.6);
    
    // Combine value and summary for specificity check
    const fullText = `${strValue} ${strSummary || ''}`;
    
    // Bonus for specific numbers/metrics (+20% of max)
    if (/\$\d+|\d+%|\d+x|\d+\s*(years?|months?|days?|clients?|customers?)/i.test(fullText)) {
      points += Math.round(maxPoints * 0.2);
    }
    
    // Bonus for detailed content (+20% of max)
    if (strValue.length > 20 || (strSummary && strSummary.length > 50)) {
      points += Math.round(maxPoints * 0.2);
    }
    
    // Cap at maxPoints
    points = Math.min(points, maxPoints);
  }
  
  return {
    value: strValue,
    summary: strSummary,
    points,
    maxPoints,
  };
}

export function calculateIntelligenceScore(intelligence: GenericIntelligence | null): IntelligenceScore {
  if (!intelligence) {
    return createEmptyScore();
  }

  // Calculate WHO YOU ARE (25 pts max)
  const industryField = createFieldScore(
    intelligence.industry,
    intelligence.industrySummary,
    FIELD_POINTS.industry
  );
  const audienceField = createFieldScore(
    intelligence.audience,
    intelligence.audienceSummary,
    FIELD_POINTS.audience
  );
  const geographyField = createFieldScore(
    intelligence.geography,
    intelligence.geographySummary,
    FIELD_POINTS.geography
  );
  
  const whoYouAre: WhoYouAreScore = {
    industry: industryField,
    audience: audienceField,
    geography: geographyField,
    total: industryField.points + audienceField.points + geographyField.points,
    maxPoints: 25,
    percentage: Math.round(((industryField.points + audienceField.points + geographyField.points) / 25) * 100),
  };

  // Calculate WHAT YOU OFFER (25 pts max)
  const valuePropField = createFieldScore(
    intelligence.valueProp,
    intelligence.valuePropSummary,
    FIELD_POINTS.valueProp
  );
  const edgeField = createFieldScore(
    intelligence.competitiveEdge || intelligence.competitorDifferentiator || intelligence.competitorDifferentiation,
    intelligence.edgeSummary,
    FIELD_POINTS.edge
  );
  const methodField = createFieldScore(
    intelligence.method,
    intelligence.methodSummary,
    FIELD_POINTS.method
  );
  
  const whatYouOffer: WhatYouOfferScore = {
    valueProp: valuePropField,
    edge: edgeField,
    method: methodField,
    total: valuePropField.points + edgeField.points + methodField.points,
    maxPoints: 25,
    percentage: Math.round(((valuePropField.points + edgeField.points + methodField.points) / 25) * 100),
  };

  // Calculate BUYER REALITY (25 pts max)
  const painPointsField = createFieldScore(
    intelligence.painPoints,
    intelligence.painSummary,
    FIELD_POINTS.painPoints
  );
  const objectionsField = createFieldScore(
    intelligence.buyerObjections,
    intelligence.objectionsSummary,
    FIELD_POINTS.objections
  );
  const triggersField = createFieldScore(
    intelligence.triggers,
    intelligence.triggersSummary,
    FIELD_POINTS.triggers
  );
  
  const buyerReality: BuyerRealityScore = {
    painPoints: painPointsField,
    objections: objectionsField,
    triggers: triggersField,
    total: painPointsField.points + objectionsField.points + triggersField.points,
    maxPoints: 25,
    percentage: Math.round(((painPointsField.points + objectionsField.points + triggersField.points) / 25) * 100),
  };

  // Calculate PROOF & CREDIBILITY (25 pts max)
  const resultsField = createFieldScore(
    intelligence.proofElements || intelligence.results,
    intelligence.proofSummary || intelligence.resultsSummary,
    FIELD_POINTS.results
  );
  const socialProofField = createFieldScore(
    intelligence.socialProof,
    intelligence.socialProofSummary,
    FIELD_POINTS.socialProof
  );
  const credentialsField = createFieldScore(
    intelligence.credentials,
    intelligence.credentialsSummary,
    FIELD_POINTS.credentials
  );
  
  const proofCredibility: ProofCredibilityScore = {
    results: resultsField,
    socialProof: socialProofField,
    credentials: credentialsField,
    total: resultsField.points + socialProofField.points + credentialsField.points,
    maxPoints: 25,
    percentage: Math.round(((resultsField.points + socialProofField.points + credentialsField.points) / 25) * 100),
  };

  // Calculate totals
  const totalScore = whoYouAre.total + whatYouOffer.total + buyerReality.total + proofCredibility.total;
  const totalPercentage = Math.round((totalScore / 100) * 100);

  // Determine level
  let level: StrategicLevel = 'unqualified';
  if (totalScore >= 85) level = 'proven';
  else if (totalScore >= 70) level = 'armed';
  else if (totalScore >= 50) level = 'positioned';
  else if (totalScore >= 25) level = 'identified';

  return {
    whoYouAre,
    whatYouOffer,
    buyerReality,
    proofCredibility,
    totalScore,
    totalPercentage,
    level,
  };
}

function createEmptyScore(): IntelligenceScore {
  const emptyField = (maxPoints: number): FieldScore => ({
    value: null,
    summary: null,
    points: 0,
    maxPoints,
  });

  return {
    whoYouAre: {
      industry: emptyField(10),
      audience: emptyField(10),
      geography: emptyField(5),
      total: 0,
      maxPoints: 25,
      percentage: 0,
    },
    whatYouOffer: {
      valueProp: emptyField(10),
      edge: emptyField(10),
      method: emptyField(5),
      total: 0,
      maxPoints: 25,
      percentage: 0,
    },
    buyerReality: {
      painPoints: emptyField(10),
      objections: emptyField(10),
      triggers: emptyField(5),
      total: 0,
      maxPoints: 25,
      percentage: 0,
    },
    proofCredibility: {
      results: emptyField(10),
      socialProof: emptyField(10),
      credentials: emptyField(5),
      total: 0,
      maxPoints: 25,
      percentage: 0,
    },
    totalScore: 0,
    totalPercentage: 0,
    level: 'unqualified',
  };
}

// Get next prompt based on missing fields
export function getNextPrompt(score: IntelligenceScore): string | null {
  // Priority order for prompts
  const prompts: Array<{ check: () => boolean; prompt: string }> = [
    { check: () => !score.whoYouAre.industry.value, prompt: "What industry are you in?" },
    { check: () => !score.whoYouAre.audience.value, prompt: "Who are your ideal customers?" },
    { check: () => !score.whatYouOffer.valueProp.value, prompt: "What's the main outcome you deliver?" },
    { check: () => !score.whatYouOffer.edge.value, prompt: "What makes you different from alternatives?" },
    { check: () => !score.buyerReality.painPoints.value, prompt: "What problems keep your buyers up at night?" },
    { check: () => !score.buyerReality.objections.value, prompt: "What hesitations do buyers typically have?" },
    { check: () => !score.proofCredibility.results.value, prompt: "What results have you achieved for clients?" },
    { check: () => !score.whoYouAre.geography.value, prompt: "What regions do you primarily serve?" },
    { check: () => !score.whatYouOffer.method.value, prompt: "How do you deliver your service?" },
    { check: () => !score.buyerReality.triggers.value, prompt: "What typically triggers someone to seek you out?" },
    { check: () => !score.proofCredibility.socialProof.value, prompt: "Do you have testimonials or notable clients?" },
    { check: () => !score.proofCredibility.credentials.value, prompt: "What credentials or experience back this up?" },
  ];

  for (const { check, prompt } of prompts) {
    if (check()) return prompt;
  }

  return null; // All fields filled
}

// Check if ready to generate
export function canGenerate(score: IntelligenceScore): boolean {
  return score.level === 'armed' || score.level === 'proven';
}

// Check if eligible for trial signup
export function canStartTrial(score: IntelligenceScore): boolean {
  return score.level === 'positioned' || score.level === 'armed' || score.level === 'proven';
}
