// Consultation status lifecycle
export type ConsultationStatus = 
  | 'not_started'
  | 'demo_started'
  | 'demo_complete'
  | 'wizard_in_progress'
  | 'wizard_complete'
  | 'generation_ready';

// Structured intelligence data carried through the journey
export interface ExtractedIntelligence {
  // Source tracking
  source: 'demo' | 'wizard' | 'hybrid';
  capturedAt: string;
  
  // Core positioning (required for generation)
  industry: string | null;  // Raw text from user
  subIndustry: string | null;
  audience: string | null;
  audienceRole: string | null;
  valueProp: string | null;
  businessName: string | null;
  
  // Pre-detected industry category (from intelligent detection)
  industryCategory?: string | null;  // Normalized category (e.g., "creative", "consulting", "saas")
  industryConfidence?: 'high' | 'medium' | 'low' | null;  // Detection confidence
  
  // Strategic depth (required for quality generation)
  painPoints: string[];
  buyerObjections: string[];
  competitorDifferentiation: string | null;
  proofElements: string[];
  toneDirection: string | null;
  goals: string | null;
  
  // Market research (auto-populated)
  marketResearch: {
    marketSize: string | null;
    buyerPersona: string | null;
    commonObjections: string[];
    industryInsights: string[];
    researchedAt: string | null;
  };
  
  // Conversation context
  conversationHistory: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    source: 'demo' | 'wizard';
  }[];
  
  // Readiness scoring
  readinessScore: number;
  readinessBreakdown: ReadinessFieldResult[];
}

export interface ReadinessFieldResult {
  field: string;
  score: number;
  maxScore: number;
  captured: boolean;
}

export interface ReadinessResult {
  score: number;
  canGenerate: boolean;
  missingRequired: string[];
  breakdown: ReadinessFieldResult[];
}

// Default/empty intelligence object
export function createEmptyIntelligence(source: 'demo' | 'wizard' = 'demo'): ExtractedIntelligence {
  return {
    source,
    capturedAt: new Date().toISOString(),
    industry: null,
    subIndustry: null,
    audience: null,
    audienceRole: null,
    valueProp: null,
    businessName: null,
    painPoints: [],
    buyerObjections: [],
    competitorDifferentiation: null,
    proofElements: [],
    toneDirection: null,
    goals: null,
    marketResearch: {
      marketSize: null,
      buyerPersona: null,
      commonObjections: [],
      industryInsights: [],
      researchedAt: null,
    },
    conversationHistory: [],
    readinessScore: 0,
    readinessBreakdown: [],
  };
}
