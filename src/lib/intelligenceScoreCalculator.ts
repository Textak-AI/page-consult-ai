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

// Bonus points from research and other unlocks
export interface ScoreBonuses {
  marketResearchComplete?: boolean;  // +10 pts for completing research
  emailCaptured?: boolean;           // For tracking, not points
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
    // Base points for having a value (50% of max)
    points = Math.round(maxPoints * 0.5);
    
    // Combine value and summary for specificity check
    const fullText = `${strValue} ${strSummary || ''}`;
    
    // Bonus for specific numbers/metrics (+30% of max)
    // Match: $500K, 34%, 3.2x, 847 engagements, 8 years, Fortune 500, etc.
    if (/\$[\d,]+[KMB]?|\d+(\.\d+)?%|\d+(\.\d+)?x|\d+\s*(years?|months?|days?|clients?|customers?|companies|engagements?|projects?)/i.test(fullText)) {
      points += Math.round(maxPoints * 0.3);
    }
    
    // Bonus for detailed content (+20% of max) - lower thresholds for easier achievement
    if (strValue.length > 15 || (strSummary && strSummary.length > 30)) {
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

// Research bonus points constant
const RESEARCH_BONUS_POINTS = 10;

export function calculateIntelligenceScore(
  intelligence: GenericIntelligence | null, 
  bonuses?: ScoreBonuses
): IntelligenceScore {
  if (!intelligence) {
    return createEmptyScore();
  }
  
  // Track bonus points for logging
  const bonusPoints = bonuses?.marketResearchComplete ? RESEARCH_BONUS_POINTS : 0;
  if (bonusPoints > 0) {
    console.log('[Score Update]', { source: 'research', points: bonusPoints });
  }

  // Calculate WHO YOU ARE (25 pts max)
  // Using 2 main fields: industry (12), audience (13)
  const industryField = createFieldScore(
    intelligence.industry || intelligence.industryFull,
    intelligence.industrySummary,
    12 // Increased from 10
  );
  const audienceField = createFieldScore(
    intelligence.audience || intelligence.audienceFull,
    intelligence.audienceSummary,
    13 // Increased from 10, absorbs geography points
  );
  // Geography bonus if available
  const geographyField = createFieldScore(
    intelligence.geography,
    intelligence.geographySummary,
    0 // Optional bonus field
  );
  
  const whoYouAreTotal = Math.min(25, industryField.points + audienceField.points + geographyField.points);
  const whoYouAre: WhoYouAreScore = {
    industry: { ...industryField, maxPoints: 12 },
    audience: { ...audienceField, maxPoints: 13 },
    geography: geographyField,
    total: whoYouAreTotal,
    maxPoints: 25,
    percentage: Math.round((whoYouAreTotal / 25) * 100),
  };

  // Calculate WHAT YOU OFFER (25 pts max)
  // Using 2 main fields: valueProp (13), edge (12)
  const valuePropField = createFieldScore(
    intelligence.valueProp || intelligence.valuePropFull,
    intelligence.valuePropSummary,
    13 // Increased from 10
  );
  const edgeField = createFieldScore(
    intelligence.competitiveEdge || intelligence.competitorDifferentiator || intelligence.competitorDifferentiation || intelligence.competitorDifferentiatorFull,
    intelligence.edgeSummary,
    12 // Increased from 10, absorbs method points
  );
  const methodField = createFieldScore(
    intelligence.method,
    intelligence.methodSummary,
    0 // Optional bonus field
  );
  
  const whatYouOfferTotal = Math.min(25, valuePropField.points + edgeField.points + methodField.points);
  const whatYouOffer: WhatYouOfferScore = {
    valueProp: { ...valuePropField, maxPoints: 13 },
    edge: { ...edgeField, maxPoints: 12 },
    method: methodField,
    total: whatYouOfferTotal,
    maxPoints: 25,
    percentage: Math.round((whatYouOfferTotal / 25) * 100),
  };

  // Calculate BUYER REALITY (25 pts max)
  // Using 2 main fields: painPoints (13), objections (12)
  const painPointsField = createFieldScore(
    intelligence.painPoints || intelligence.painPointsFull,
    intelligence.painSummary,
    13 // Increased from 10
  );
  const objectionsField = createFieldScore(
    intelligence.buyerObjections || intelligence.buyerObjectionsFull,
    intelligence.objectionsSummary,
    12 // Increased from 10, absorbs triggers points
  );
  const triggersField = createFieldScore(
    intelligence.triggers,
    intelligence.triggersSummary,
    0 // Optional bonus field
  );
  
  const buyerRealityTotal = Math.min(25, painPointsField.points + objectionsField.points + triggersField.points);
  const buyerReality: BuyerRealityScore = {
    painPoints: { ...painPointsField, maxPoints: 13 },
    objections: { ...objectionsField, maxPoints: 12 },
    triggers: triggersField,
    total: buyerRealityTotal,
    maxPoints: 25,
    percentage: Math.round((buyerRealityTotal / 25) * 100),
  };

  // Calculate PROOF & CREDIBILITY (25 pts max)
  // Using 2 main fields: results/proofElements (13), socialProof (12)
  const resultsField = createFieldScore(
    intelligence.proofElements || intelligence.proofElementsFull || intelligence.results,
    intelligence.proofSummary || intelligence.resultsSummary,
    13 // Increased from 10
  );
  const socialProofField = createFieldScore(
    intelligence.socialProof,
    intelligence.socialProofSummary,
    12 // Increased from 10, absorbs credentials points
  );
  const credentialsField = createFieldScore(
    intelligence.credentials,
    intelligence.credentialsSummary,
    0 // Optional bonus field
  );
  
  const proofCredibilityTotal = Math.min(25, resultsField.points + socialProofField.points + credentialsField.points);
  const proofCredibility: ProofCredibilityScore = {
    results: { ...resultsField, maxPoints: 13 },
    socialProof: { ...socialProofField, maxPoints: 12 },
    credentials: credentialsField,
    total: proofCredibilityTotal,
    maxPoints: 25,
    percentage: Math.round((proofCredibilityTotal / 25) * 100),
  };

  // Calculate totals with research bonus
  const researchBonus = bonuses?.marketResearchComplete ? RESEARCH_BONUS_POINTS : 0;
  const baseScore = whoYouAre.total + whatYouOffer.total + buyerReality.total + proofCredibility.total;
  const totalScore = Math.min(100, baseScore + researchBonus); // Cap at 100
  const totalPercentage = Math.round((totalScore / 100) * 100);

  // Log score calculation for debugging
  if (researchBonus > 0) {
    console.log('[Score Update]', { 
      source: 'calculation', 
      baseScore, 
      researchBonus, 
      totalScore 
    });
  }

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
