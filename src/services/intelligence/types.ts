/**
 * Intelligence-First Content Generation Types
 * Every piece of content traces back to researched data
 */

// ============ Research Inputs ============

export interface ResearchInputs {
  industry: string;
  serviceType?: string;
  targetAudience: string;
  location?: string;
  challenge?: string;
  uniqueValue?: string;
}

// ============ Market Research (Perplexity) ============

export interface MarketClaim {
  claim: string;
  source: string;
  sourceUrl?: string;
  year?: number;
  confidence: 'high' | 'medium' | 'low';
  category: 'statistic' | 'trend' | 'pain_point' | 'competitor' | 'demographic';
}

export interface MarketDemographics {
  ageRange?: string;
  income?: string;
  location?: string;
  buyingBehavior?: string[];
  decisionFactors?: string[];
}

export interface CompetitorInsight {
  type: string;
  commonClaims: string[];
  pricingRange?: string;
  marketGaps?: string[];
}

export interface MarketResearch {
  claims: MarketClaim[];
  demographics: MarketDemographics;
  competitors: CompetitorInsight[];
  painPoints: string[];
  marketSize?: string;
  trends?: string[];
  researchedAt: string;
  sources: string[];
}

// ============ Synthesized Persona (Claude) ============

export interface PersonaDemographics {
  primaryAge: string;
  income: string;
  location: string;
  occupation: string;
  familyStatus?: string;
}

export interface PersonaPsychographics {
  values: string[];
  fears: string[];
  aspirations: string[];
  decisionStyle: string;
  trustSignals: string[];
}

export interface SynthesizedPersona {
  name: string; // Persona archetype name e.g. "The Overwhelmed Homeowner"
  demographics: PersonaDemographics;
  psychographics: PersonaPsychographics;
  languagePatterns: string[]; // How they talk about problems
  painPoints: PainPoint[];
  desires: Desire[];
  objections: Objection[];
  buyingJourney: BuyingStage[];
}

export interface PainPoint {
  pain: string;
  intensity: 'critical' | 'high' | 'moderate';
  trigger: string; // What makes them feel this pain
  languageUsed: string[]; // How they express this
}

export interface Desire {
  desire: string;
  priority: 'must_have' | 'nice_to_have' | 'aspirational';
  emotionalBenefit: string;
}

export interface Objection {
  objection: string;
  likelihood: 'common' | 'occasional' | 'rare';
  counterArgument: string;
}

export interface BuyingStage {
  stage: 'awareness' | 'consideration' | 'decision';
  questions: string[];
  concerns: string[];
  triggers: string[];
}

// ============ Persona Intelligence Record ============

export interface PersonaIntelligence {
  id: string;
  consultationId: string;
  userId: string;
  
  // Inputs
  industry: string;
  targetAudience: string;
  location?: string;
  serviceType?: string;
  
  // Research results
  marketResearch: MarketResearch;
  synthesizedPersona: SynthesizedPersona;
  
  // Metadata
  researchSources: string[];
  confidenceScore: number;
  researchStatus: 'pending' | 'researching' | 'synthesizing' | 'complete' | 'failed';
  
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// ============ Content Generation ============

export interface GenerationContext {
  consultationData: ConsultationData;
  intelligence: PersonaIntelligence;
}

export interface ConsultationData {
  industry?: string;
  serviceType?: string;
  goal?: string;
  targetAudience?: string;
  challenge?: string;
  uniqueValue?: string;
  offer?: string;
}

export interface GeneratedContent {
  headline: string;
  subheadline: string;
  features: Feature[];
  problemStatement: string;
  solutionStatement: string;
  socialProof: string;
  ctaText: string;
  sections: string[];
  images: ImageQueries;
  
  // Intelligence references
  intelligenceUsed: IntelligenceReference;
}

export interface Feature {
  title: string;
  description: string;
  icon?: string;
}

export interface ImageQueries {
  hero: string;
  gallery?: string[];
  features?: string;
  background?: string;
}

export interface IntelligenceReference {
  marketClaimsUsed: string[];
  personaInsightsUsed: string[];
  painPointsReferenced: string[];
  confidenceScore: number;
}

// ============ Generation Logs ============

export interface GenerationLog {
  id: string;
  consultationId: string;
  personaIntelligenceId?: string;
  userId: string;
  
  generationType: 'headline' | 'subheadline' | 'features' | 'problem' | 'solution' | 'cta' | 'full_page';
  inputData: ConsultationData;
  intelligenceUsed: IntelligenceReference;
  generatedContent: Partial<GeneratedContent>;
  
  confidenceScore: number;
  regenerationCount: number;
  createdAt: string;
}

// ============ API Responses ============

export interface MarketResearchResponse {
  success: boolean;
  research?: MarketResearch;
  error?: string;
}

export interface PersonaSynthesisResponse {
  success: boolean;
  persona?: SynthesizedPersona;
  error?: string;
}

export interface ContentGenerationResponse {
  success: boolean;
  content?: GeneratedContent;
  log?: GenerationLog;
  error?: string;
}
