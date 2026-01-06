// Strategic Orchestrator Types

export interface OrchestratorInput {
  // What we know about the prospect
  websiteIntelligence?: {
    url: string;
    companyName: string;
    logoUrl?: string;
    extractedColors?: string[];
    detectedServices?: string[];
  };
  
  // From consultation/demo
  consultationData?: {
    industry: string | null;
    targetMarket: string | null;
    audience: string | null;
    valueProp: string | null;
    painPoints?: string[];
    objections?: string[];
  };
  
  // Detected buyer info
  buyerProfile?: {
    type: string | null; // "CISO", "CFO", "Marketing Director", etc.
    decisionStyle?: string; // "ROI-driven", "Technical validation", etc.
  };
  
  // Previous research results (for synthesis phase)
  marketResearch?: ResearchResult[];
  
  // What phase are we in
  phase: 'initial' | 'research' | 'synthesis';
}

export interface ResearchQuery {
  id: string;
  query: string;
  purpose: 'objections' | 'competitive' | 'buyer_psychology' | 'trust_signals' | 'market_trends';
  priority: 'high' | 'medium' | 'low';
}

export interface ResearchResult {
  id: string;
  purpose: string;
  query: string;
  result: string;
  citations?: string[];
}

export interface PredictedObjection {
  objection: string;
  frequency: 'very_common' | 'common' | 'moderate' | 'rare';
  source: string;
  counterStrategy: string;
  proofNeeded: string;
}

export interface CompetitiveInsight {
  finding: string;
  opportunity: string;
  recommendation: string;
  competitors?: string[];
}

export interface BuyerPsychology {
  decisionMakers: string[];
  typicalTriggers: string[];
  timeline: string;
  priorities: string[];
  pageImplications: string[];
}

export interface AhaInsight {
  title: string;
  content: string;
  actionable: boolean;
  action?: string;
}

export interface StrategicRecommendation {
  area: 'headline' | 'proof' | 'structure' | 'cta' | 'trust';
  recommendation: string;
  reasoning: string;
  priority: 'critical' | 'high' | 'medium';
}

export interface OrchestratorOutput {
  // Phase 1: Research queries to execute
  researchQueries?: ResearchQuery[];
  
  // Phase 2/3: Synthesized insights
  predictedObjections?: PredictedObjection[];
  competitiveInsights?: CompetitiveInsight[];
  buyerPsychology?: BuyerPsychology;
  ahaInsights?: AhaInsight[];
  strategicRecommendations?: StrategicRecommendation[];
  
  // Trust signal prioritization
  trustPriority?: Array<{
    signal: string;
    importance: 'critical' | 'high' | 'medium' | 'low';
    reason: string;
  }>;
  
  // Brief generation guidance
  briefGuidance?: {
    headlineStrategy: string;
    heroApproach: string;
    proofPriority: string[];
    uniqueSections: string[];
    toneGuidance: string;
  };
}
