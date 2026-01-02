import { useMemo } from 'react';

export interface ExtractedIntelligence {
  // Category 1: Industry & Market
  industryVertical?: string;
  industryVerticalSource?: 'demo' | 'consultation';
  industrySegment?: string;
  industrySegmentSource?: 'demo' | 'consultation';
  marketMaturity?: string;
  geographicFocus?: string;
  
  // Category 2: Target Audience
  buyerRole?: string;
  buyerRoleSource?: 'demo' | 'consultation';
  companyStage?: string;
  companyStageSource?: 'demo' | 'consultation';
  companySize?: string;
  buyerTrigger?: string;
  
  // Category 3: Value Proposition
  coreOffer?: string;
  coreOfferSource?: 'demo' | 'consultation';
  transformation?: string;
  transformationSource?: 'demo' | 'consultation';
  timeframe?: string;
  methodology?: string;
  
  // Category 4: Competitive Position
  keyDifferentiator?: string;
  keyDifferentiatorSource?: 'demo' | 'consultation';
  proofElements?: string;
  proofElementsSource?: 'demo' | 'consultation';
  whyNotAlternatives?: string;
  whyNotAlternativesSource?: 'demo' | 'consultation';
  
  // Category 5: Buyer Psychology
  primaryPainPoint?: string;
  primaryPainPointSource?: 'demo' | 'consultation';
  commonObjections?: string;
  commonObjectionsSource?: 'demo' | 'consultation';
  decisionDrivers?: string;
  decisionDriversSource?: 'demo' | 'consultation';
  
  // Category 6: Goals & Conversion
  pageGoal?: string;
  successMetric?: string;
  investmentRange?: string;
}

interface Subcategory {
  id: string;
  label: string;
  shortLabel: string;
  value: string | null;
  confidence: number;
  source?: 'demo' | 'consultation';
  justFilled?: boolean;
}

interface Category {
  id: string;
  name: string;
  weight: number;
  score: number;
  subcategories: Subcategory[];
}

export interface IntelligenceProfileData {
  categories: Category[];
  totalReadiness: number;
  readinessLevel: 'IDENTIFIED' | 'POSITIONED' | 'ARMED' | 'PROVEN';
  hasDataFromDemo: boolean;
  nextQuestion: string;
  missingRequired: string[];
}

const CATEGORY_WEIGHTS = {
  industryMarket: 0.15,
  targetAudience: 0.20,
  valueProposition: 0.20,
  competitivePosition: 0.15,
  buyerPsychology: 0.20,
  goalsConversion: 0.10,
};

// Questions to ask for each missing field
const QUESTION_MAP: Record<string, string> = {
  industryVertical: "What industry or market do you operate in?",
  industrySegment: "What specific segment within your industry do you focus on?",
  marketMaturity: "Is your market emerging, growing, or mature?",
  geographicFocus: "What geographic region do you primarily serve?",
  buyerRole: "Who is your primary buyer? What's their role or title?",
  companyStage: "What stage companies do you typically work with?",
  companySize: "What size companies are your ideal clients?",
  buyerTrigger: "What typically triggers them to seek your solution?",
  coreOffer: "What's your main product or service offering?",
  transformation: "What transformation do clients experience?",
  timeframe: "How quickly do clients typically see results?",
  methodology: "What's your unique approach or methodology?",
  keyDifferentiator: "What makes you different from alternatives?",
  proofElements: "What proof or credentials do you have?",
  whyNotAlternatives: "Why shouldn't they go with alternatives?",
  primaryPainPoint: "What's the main pain point you solve?",
  commonObjections: "What objections do prospects typically raise?",
  decisionDrivers: "What drives their final decision to buy?",
  pageGoal: "What's the primary action you want visitors to take?",
  successMetric: "How will you measure this page's success?",
  investmentRange: "What's your typical engagement price range?",
};

export function useIntelligenceProfile(
  extracted: ExtractedIntelligence,
  recentlyFilled?: string[]
): IntelligenceProfileData {
  
  return useMemo(() => {
    const hasValue = (val?: string) => val && val.trim() !== '' && val !== 'null';
    let hasDataFromDemo = false;
    
    // Helper to create subcategory with source tracking
    const createSub = (
      id: string,
      label: string,
      shortLabel: string,
      value: string | undefined,
      source?: 'demo' | 'consultation'
    ): Subcategory => {
      const filled = hasValue(value);
      if (filled && source === 'demo') hasDataFromDemo = true;
      return {
        id,
        label,
        shortLabel,
        value: value || null,
        confidence: filled ? 100 : 0,
        source: filled ? source : undefined,
        justFilled: recentlyFilled?.includes(id),
      };
    };
    
    // Category 1: Industry & Market
    const industryMarket: Category = {
      id: 'industry-market',
      name: 'Industry & Market',
      weight: CATEGORY_WEIGHTS.industryMarket,
      score: 0,
      subcategories: [
        createSub('industryVertical', 'Industry Vertical', 'Vertical', extracted.industryVertical, extracted.industryVerticalSource),
        createSub('industrySegment', 'Industry Segment', 'Segment', extracted.industrySegment, extracted.industrySegmentSource),
        createSub('marketMaturity', 'Market Maturity', 'Maturity', extracted.marketMaturity),
        createSub('geographicFocus', 'Geographic Focus', 'Geography', extracted.geographicFocus),
      ],
    };
    industryMarket.score = industryMarket.subcategories.filter(s => s.confidence >= 70).length * 25;
    
    // Category 2: Target Audience
    const targetAudience: Category = {
      id: 'target-audience',
      name: 'Target Audience',
      weight: CATEGORY_WEIGHTS.targetAudience,
      score: 0,
      subcategories: [
        createSub('buyerRole', 'Buyer Role', 'Buyer', extracted.buyerRole, extracted.buyerRoleSource),
        createSub('companyStage', 'Company Stage', 'Stage', extracted.companyStage, extracted.companyStageSource),
        createSub('companySize', 'Company Size', 'Size', extracted.companySize),
        createSub('buyerTrigger', 'Buyer Trigger', 'Trigger', extracted.buyerTrigger),
      ],
    };
    targetAudience.score = targetAudience.subcategories.filter(s => s.confidence >= 70).length * 25;
    
    // Category 3: Value Proposition
    const valueProposition: Category = {
      id: 'value-proposition',
      name: 'Value Proposition',
      weight: CATEGORY_WEIGHTS.valueProposition,
      score: 0,
      subcategories: [
        createSub('coreOffer', 'Core Offer', 'Offer', extracted.coreOffer, extracted.coreOfferSource),
        createSub('transformation', 'Transformation', 'Transform', extracted.transformation, extracted.transformationSource),
        createSub('timeframe', 'Timeframe', 'Timeframe', extracted.timeframe),
        createSub('methodology', 'Methodology', 'Method', extracted.methodology),
      ],
    };
    valueProposition.score = valueProposition.subcategories.filter(s => s.confidence >= 70).length * 25;
    
    // Category 4: Competitive Position (3 subcategories)
    const competitivePosition: Category = {
      id: 'competitive-position',
      name: 'Competitive Position',
      weight: CATEGORY_WEIGHTS.competitivePosition,
      score: 0,
      subcategories: [
        createSub('keyDifferentiator', 'Key Differentiator', 'Edge', extracted.keyDifferentiator, extracted.keyDifferentiatorSource),
        createSub('proofElements', 'Proof Elements', 'Proof', extracted.proofElements, extracted.proofElementsSource),
        createSub('whyNotAlternatives', 'Why Not Alternatives', 'vs Others', extracted.whyNotAlternatives, extracted.whyNotAlternativesSource),
      ],
    };
    const cpFilled = competitivePosition.subcategories.filter(s => s.confidence >= 70).length;
    competitivePosition.score = cpFilled === 0 ? 0 : cpFilled === 1 ? 35 : cpFilled === 2 ? 70 : 100;
    
    // Category 5: Buyer Psychology (3 subcategories)
    const buyerPsychology: Category = {
      id: 'buyer-psychology',
      name: 'Buyer Psychology',
      weight: CATEGORY_WEIGHTS.buyerPsychology,
      score: 0,
      subcategories: [
        createSub('primaryPainPoint', 'Primary Pain Point', 'Pain', extracted.primaryPainPoint, extracted.primaryPainPointSource),
        createSub('commonObjections', 'Common Objections', 'Objections', extracted.commonObjections, extracted.commonObjectionsSource),
        createSub('decisionDrivers', 'Decision Drivers', 'Drivers', extracted.decisionDrivers, extracted.decisionDriversSource),
      ],
    };
    const bpFilled = buyerPsychology.subcategories.filter(s => s.confidence >= 70).length;
    buyerPsychology.score = bpFilled === 0 ? 0 : bpFilled === 1 ? 35 : bpFilled === 2 ? 70 : 100;
    
    // Category 6: Goals & Conversion (3 subcategories)
    const goalsConversion: Category = {
      id: 'goals-conversion',
      name: 'Goals & Conversion',
      weight: CATEGORY_WEIGHTS.goalsConversion,
      score: 0,
      subcategories: [
        createSub('pageGoal', 'Page Goal', 'Goal', extracted.pageGoal),
        createSub('successMetric', 'Success Metric', 'Metric', extracted.successMetric),
        createSub('investmentRange', 'Investment Range', 'Investment', extracted.investmentRange),
      ],
    };
    const gcFilled = goalsConversion.subcategories.filter(s => s.confidence >= 70).length;
    goalsConversion.score = gcFilled === 0 ? 0 : gcFilled === 1 ? 35 : gcFilled === 2 ? 70 : 100;
    
    const categories = [
      industryMarket,
      targetAudience,
      valueProposition,
      competitivePosition,
      buyerPsychology,
      goalsConversion,
    ];
    
    // Calculate total readiness (weighted)
    const totalReadiness = Math.round(
      categories.reduce((sum, cat) => sum + (cat.score * cat.weight), 0)
    );
    
    // Determine readiness level
    let readinessLevel: 'IDENTIFIED' | 'POSITIONED' | 'ARMED' | 'PROVEN';
    if (totalReadiness >= 71) readinessLevel = 'PROVEN';
    else if (totalReadiness >= 51) readinessLevel = 'ARMED';
    else if (totalReadiness >= 26) readinessLevel = 'POSITIONED';
    else readinessLevel = 'IDENTIFIED';
    
    // Find missing fields and determine next question
    const missingFields: string[] = [];
    const missingRequired: string[] = [];
    
    // Required fields for page generation
    const requiredFields = ['industryVertical', 'buyerRole', 'coreOffer', 'keyDifferentiator', 'pageGoal'];
    
    categories.forEach(cat => {
      cat.subcategories.forEach(sub => {
        if (sub.confidence < 70) {
          missingFields.push(sub.id);
          if (requiredFields.includes(sub.id)) {
            missingRequired.push(sub.id);
          }
        }
      });
    });
    
    // Prioritize by: 1) Required fields, 2) Category weight × gap
    let nextQuestion = '';
    if (missingRequired.length > 0) {
      nextQuestion = QUESTION_MAP[missingRequired[0]] || `Tell me about your ${missingRequired[0]}`;
    } else if (missingFields.length > 0) {
      // Find lowest-scoring high-weight category
      const sortedCats = [...categories]
        .filter(c => c.score < 100)
        .sort((a, b) => ((100 - b.score) * b.weight) - ((100 - a.score) * a.weight));
      
      if (sortedCats.length > 0) {
        const missingSub = sortedCats[0].subcategories.find(s => s.confidence < 70);
        if (missingSub) {
          nextQuestion = QUESTION_MAP[missingSub.id] || `Tell me about your ${missingSub.shortLabel.toLowerCase()}`;
        }
      }
    }
    
    return { 
      categories, 
      totalReadiness, 
      readinessLevel, 
      hasDataFromDemo,
      nextQuestion,
      missingRequired,
    };
  }, [extracted, recentlyFilled]);
}

// Helper function to map demo data to consultation format
export function mapDemoToConsultation(demoIntelligence: any): ExtractedIntelligence {
  return {
    industryVertical: demoIntelligence.industry || undefined,
    industryVerticalSource: demoIntelligence.industry ? 'demo' : undefined,
    industrySegment: demoIntelligence.industrySummary || undefined,
    industrySegmentSource: demoIntelligence.industrySummary ? 'demo' : undefined,
    buyerRole: demoIntelligence.audience || undefined,
    buyerRoleSource: demoIntelligence.audience ? 'demo' : undefined,
    companyStage: demoIntelligence.audienceSummary || undefined,
    companyStageSource: demoIntelligence.audienceSummary ? 'demo' : undefined,
    coreOffer: demoIntelligence.valueProp || undefined,
    coreOfferSource: demoIntelligence.valueProp ? 'demo' : undefined,
    transformation: demoIntelligence.valuePropSummary || undefined,
    transformationSource: demoIntelligence.valuePropSummary ? 'demo' : undefined,
    keyDifferentiator: demoIntelligence.competitorDifferentiator || demoIntelligence.competitive || undefined,
    keyDifferentiatorSource: (demoIntelligence.competitorDifferentiator || demoIntelligence.competitive) ? 'demo' : undefined,
    proofElements: demoIntelligence.proofElements || undefined,
    proofElementsSource: demoIntelligence.proofElements ? 'demo' : undefined,
    whyNotAlternatives: demoIntelligence.edgeSummary || undefined,
    whyNotAlternativesSource: demoIntelligence.edgeSummary ? 'demo' : undefined,
    primaryPainPoint: demoIntelligence.painPoints || undefined,
    primaryPainPointSource: demoIntelligence.painPoints ? 'demo' : undefined,
    commonObjections: demoIntelligence.buyerObjections || undefined,
    commonObjectionsSource: demoIntelligence.buyerObjections ? 'demo' : undefined,
    decisionDrivers: demoIntelligence.painSummary || undefined,
    decisionDriversSource: demoIntelligence.painSummary ? 'demo' : undefined,
    pageGoal: demoIntelligence.goals || undefined,
  };
}

// Helper function to generate initial AI message based on imported data
export function generateInitialMessage(intelligence: ExtractedIntelligence): string {
  if (!intelligence.industryVertical && !intelligence.buyerRole && !intelligence.coreOffer) {
    return "Welcome! Let's build your strategy profile. Tell me about your business — what do you offer and who do you help?";
  }
  
  // Has demo data - acknowledge and continue
  let message = "Welcome back! I've loaded your strategy session from the demo.\n\n";
  
  // Summarize what we know
  message += "Here's what I understand so far: ";
  
  const knowParts: string[] = [];
  if (intelligence.industryVertical) {
    knowParts.push(`you're in the ${intelligence.industryVertical} space`);
  }
  if (intelligence.buyerRole) {
    knowParts.push(`targeting ${intelligence.buyerRole}`);
  }
  if (intelligence.coreOffer) {
    knowParts.push(`offering ${intelligence.coreOffer}`);
  }
  
  message += knowParts.join(', ') + ".\n\n";
  
  // Ask for what's missing
  if (!intelligence.pageGoal) {
    message += "To complete your Strategy Brief, I need a few more details. What's the primary goal for this landing page — are you looking to book discovery calls, drive demo requests, or something else?";
  } else if (!intelligence.keyDifferentiator) {
    message += "What makes you different from alternatives? Why should prospects choose you?";
  } else {
    message += "Let's fill in a few more details to complete your Strategy Brief.";
  }
  
  return message;
}
