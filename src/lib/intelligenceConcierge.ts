import { supabase } from '@/integrations/supabase/client';

// TypeScript Interfaces
export interface ConsultationData {
  industry: string;
  industryVertical?: string;
  businessName?: string;
  audience: string;
  audienceRole?: string;
  companySize?: string;
  valueProp: string;
  edge: string;
  methodology?: string;
  painPoints: string[];
  objections: string[];
  buyerJourney?: string;
  results: string[];
  caseStudies?: CaseStudy[];
  socialProof?: string[];
  primaryCTA?: string;
  pageGoal?: string;
}

export interface CaseStudy {
  clientName: string;
  problem?: string;
  solution?: string;
  results: string[];
  quote?: string;
  quotePerson?: string;
  timeframe?: string;
}

export interface BrandData {
  companyName: string;
  website?: string;
  logo?: string;
  colors: {
    primary: string;
    secondary?: string;
    accent?: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  extractionSource: 'website' | 'manual' | 'upload';
}

export interface MarketData {
  industryInsights: string[];
  competitorWeaknesses: string[];
  commonObjections: Array<{
    objection: string;
    frequency: string;
    response: string;
  }>;
  buyerPersona?: any;
  designConventions: {
    colorMode: 'dark' | 'light';
    cardStyle: 'glass' | 'bordered' | 'flat';
    proofTiming: 'early' | 'late';
    trustSignalPriority: string[];
  };
}

export interface StrategyData {
  headlineApproach: 'problem' | 'outcome' | 'direct';
  pageStructure: string[];
  sectionHeaders: Record<string, { title: string; subtitle: string }>;
  visualWeight: 'proof-heavy' | 'feature-heavy' | 'balanced';
  ctaStrategy: string;
}

export interface IntelligenceAccumulator {
  id?: string;
  sessionId: string;
  userId?: string;
  consultationData: ConsultationData;
  brandData?: BrandData;
  marketData: MarketData;
  strategyData?: StrategyData;
  completionStage: 'consultation' | 'brand' | 'ready-to-generate' | 'generated';
  readinessScore: number;
  createdAt?: string;
  updatedAt?: string;
}

// Intelligence Concierge Class
export class IntelligenceConcierge {
  
  // Create accumulator from consultation
  async createFromConsultation(
    sessionId: string,
    consultationData: ConsultationData,
    readinessScore: number,
    userId?: string
  ): Promise<IntelligenceAccumulator> {
    console.log('🧠 [Concierge] Creating accumulator from consultation');
    
    // Fetch market intelligence based on industry
    const marketData = await this.fetchMarketIntelligence(
      consultationData.industry,
      consultationData.audience
    );
    
    const { data, error } = await supabase
      .from('intelligence_accumulator' as any)
      .insert({
        session_id: sessionId,
        user_id: userId,
        consultation_data: consultationData,
        market_data: marketData,
        completion_stage: 'brand',
        readiness_score: readinessScore,
      } as any)
      .select()
      .single();
    
    if (error) {
      console.error('🧠 [Concierge] Error creating accumulator:', error);
      throw error;
    }
    
    console.log('🧠 [Concierge] Accumulator created, stage: brand');
    return this.mapToAccumulator(data);
  }
  
  // Add brand data layer
  async addBrandData(
    sessionId: string,
    brandData: BrandData
  ): Promise<IntelligenceAccumulator> {
    console.log('🧠 [Concierge] Adding brand data to accumulator');
    
    const { data, error } = await supabase
      .from('intelligence_accumulator' as any)
      .update({
        brand_data: brandData,
        completion_stage: 'ready-to-generate',
      } as any)
      .eq('session_id', sessionId)
      .select()
      .single();
    
    if (error) {
      console.error('🧠 [Concierge] Error adding brand data:', error);
      throw error;
    }
    
    console.log('🧠 [Concierge] Brand data merged, stage: ready-to-generate');
    return this.mapToAccumulator(data);
  }
  
  // Update consultation data
  async updateConsultationData(
    sessionId: string,
    consultationData: Partial<ConsultationData>
  ): Promise<IntelligenceAccumulator | null> {
    console.log('🧠 [Concierge] Updating consultation data');
    
    // Get existing first
    const existing = await this.getBySessionId(sessionId);
    if (!existing) {
      console.log('🧠 [Concierge] No existing accumulator to update');
      return null;
    }
    
    const mergedConsultationData = {
      ...existing.consultationData,
      ...consultationData,
    };
    
    const { data, error } = await supabase
      .from('intelligence_accumulator' as any)
      .update({
        consultation_data: mergedConsultationData,
      } as any)
      .eq('session_id', sessionId)
      .select()
      .single();
    
    if (error) {
      console.error('🧠 [Concierge] Error updating consultation data:', error);
      throw error;
    }
    
    return this.mapToAccumulator(data);
  }
  
  // Get accumulator by session ID
  async getBySessionId(sessionId: string): Promise<IntelligenceAccumulator | null> {
    const { data, error } = await supabase
      .from('intelligence_accumulator' as any)
      .select('*')
      .eq('session_id', sessionId)
      .single();
    
    if (error || !data) {
      console.log('🧠 [Concierge] No accumulator found for session:', sessionId);
      return null;
    }
    
    return this.mapToAccumulator(data);
  }
  
  // Get accumulator by user ID (most recent)
  async getByUserId(userId: string): Promise<IntelligenceAccumulator | null> {
    const { data, error } = await supabase
      .from('intelligence_accumulator' as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      console.log('🧠 [Concierge] No accumulator found for user:', userId);
      return null;
    }
    
    return this.mapToAccumulator(data);
  }
  
  // Synthesize strategy for generation
  async synthesizeStrategy(sessionId: string): Promise<IntelligenceAccumulator> {
    console.log('🧠 [Concierge] Synthesizing strategy');
    
    const accumulator = await this.getBySessionId(sessionId);
    if (!accumulator) throw new Error('Accumulator not found');
    
    // Strategic synthesis logic
    const strategy: StrategyData = {
      headlineApproach: this.determineHeadlineApproach(accumulator),
      pageStructure: this.determinePageStructure(accumulator),
      sectionHeaders: this.determineSectionHeaders(accumulator),
      visualWeight: this.determineVisualWeight(accumulator),
      ctaStrategy: this.determineCTAStrategy(accumulator),
    };
    
    const { data, error } = await supabase
      .from('intelligence_accumulator' as any)
      .update({
        strategy_data: strategy,
        completion_stage: 'generated',
      } as any)
      .eq('session_id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('🧠 [Concierge] Strategy synthesized, ready for generation');
    return this.mapToAccumulator(data);
  }
  
  // Fetch market intelligence (placeholder - integrate with existing research)
  private async fetchMarketIntelligence(
    industry: string,
    audience: string
  ): Promise<MarketData> {
    // TODO: Integrate with existing Perplexity research
    // For now, return basic structure with industry design conventions
    
    const designConventions = this.getIndustryDesignConventions(industry);
    
    return {
      industryInsights: [],
      competitorWeaknesses: [],
      commonObjections: [],
      designConventions,
    };
  }
  
  // Get industry design conventions
  private getIndustryDesignConventions(industry: string): MarketData['designConventions'] {
    const normalized = industry.toLowerCase();
    
    // Developer Tools / SaaS
    if (normalized.includes('developer') || normalized.includes('devops') || normalized.includes('saas')) {
      return {
        colorMode: 'dark',
        cardStyle: 'glass',
        proofTiming: 'early',
        trustSignalPriority: ['metrics', 'case-studies', 'client-logos', 'security-badges'],
      };
    }
    
    // Consulting / Professional Services
    if (normalized.includes('consulting') || normalized.includes('professional')) {
      return {
        colorMode: 'light',
        cardStyle: 'bordered',
        proofTiming: 'early',
        trustSignalPriority: ['case-studies', 'testimonials', 'credentials', 'methodology'],
      };
    }
    
    // Finance / Fintech
    if (normalized.includes('finance') || normalized.includes('fintech') || normalized.includes('banking')) {
      return {
        colorMode: 'light',
        cardStyle: 'bordered',
        proofTiming: 'early',
        trustSignalPriority: ['security-badges', 'credentials', 'client-logos', 'testimonials'],
      };
    }
    
    // Healthcare / Medical
    if (normalized.includes('health') || normalized.includes('medical') || normalized.includes('pharma')) {
      return {
        colorMode: 'light',
        cardStyle: 'flat',
        proofTiming: 'early',
        trustSignalPriority: ['credentials', 'certifications', 'case-studies', 'testimonials'],
      };
    }
    
    // E-commerce / Retail
    if (normalized.includes('ecommerce') || normalized.includes('retail') || normalized.includes('shop')) {
      return {
        colorMode: 'light',
        cardStyle: 'flat',
        proofTiming: 'late',
        trustSignalPriority: ['testimonials', 'reviews', 'client-logos', 'metrics'],
      };
    }
    
    // Agency / Marketing
    if (normalized.includes('agency') || normalized.includes('marketing') || normalized.includes('creative')) {
      return {
        colorMode: 'dark',
        cardStyle: 'glass',
        proofTiming: 'late',
        trustSignalPriority: ['case-studies', 'client-logos', 'testimonials', 'awards'],
      };
    }
    
    // Default
    return {
      colorMode: 'light',
      cardStyle: 'flat',
      proofTiming: 'late',
      trustSignalPriority: ['testimonials', 'client-logos', 'case-studies'],
    };
  }
  
  // Strategic decision methods
  private determineHeadlineApproach(acc: IntelligenceAccumulator): StrategyData['headlineApproach'] {
    const goal = acc.consultationData.pageGoal?.toLowerCase();
    if (goal?.includes('meeting') || goal?.includes('consultation') || goal?.includes('call')) return 'problem';
    if (goal?.includes('sale') || goal?.includes('purchase') || goal?.includes('buy')) return 'outcome';
    return 'direct';
  }
  
  private determinePageStructure(acc: IntelligenceAccumulator): string[] {
    // Industry-specific section ordering
    const industry = acc.consultationData.industry.toLowerCase();
    
    if (industry.includes('developer') || industry.includes('saas') || industry.includes('software')) {
      return ['hero', 'stats-bar', 'problem-solution', 'features', 'how-it-works', 'social-proof', 'faq', 'final-cta'];
    }
    
    if (industry.includes('consulting') || industry.includes('agency')) {
      return ['hero', 'problem-solution', 'social-proof', 'features', 'how-it-works', 'case-studies', 'faq', 'final-cta'];
    }
    
    return ['hero', 'problem-solution', 'features', 'social-proof', 'how-it-works', 'faq', 'final-cta'];
  }
  
  private determineSectionHeaders(acc: IntelligenceAccumulator): Record<string, { title: string; subtitle: string }> {
    const industry = acc.consultationData.industry.toLowerCase();
    
    // SaaS/Tech-specific headers
    if (industry.includes('developer') || industry.includes('saas') || industry.includes('software')) {
      return {
        features: { title: 'Platform Features', subtitle: 'Everything you need to ship faster' },
        process: { title: 'How It Works', subtitle: 'Get started in minutes' },
        proof: { title: 'Trusted By', subtitle: 'Teams who ship with confidence' },
        faq: { title: 'FAQ', subtitle: '' },
        cta: { title: 'Ready to Get Started?', subtitle: '' },
      };
    }
    
    // Consulting/Agency headers
    if (industry.includes('consulting') || industry.includes('agency')) {
      return {
        features: { title: 'Our Approach', subtitle: 'What makes us different' },
        process: { title: 'How We Work', subtitle: 'A proven process' },
        proof: { title: 'Client Results', subtitle: 'Stories of transformation' },
        faq: { title: 'Common Questions', subtitle: '' },
        cta: { title: 'Ready to Talk?', subtitle: '' },
      };
    }
    
    // Default headers
    return {
      features: { title: 'Features', subtitle: 'What you get' },
      process: { title: 'How It Works', subtitle: 'Simple steps to success' },
      proof: { title: 'What Our Clients Say', subtitle: '' },
      faq: { title: 'FAQ', subtitle: '' },
      cta: { title: 'Get Started Today', subtitle: '' },
    };
  }
  
  private determineVisualWeight(acc: IntelligenceAccumulator): StrategyData['visualWeight'] {
    if (acc.consultationData.results && acc.consultationData.results.length >= 3) return 'proof-heavy';
    if (acc.consultationData.edge) return 'feature-heavy';
    return 'balanced';
  }
  
  private determineCTAStrategy(acc: IntelligenceAccumulator): string {
    const goal = acc.consultationData.pageGoal || acc.consultationData.primaryCTA || '';
    const normalized = goal.toLowerCase();
    
    if (normalized.includes('meeting') || normalized.includes('call') || normalized.includes('consultation')) {
      return 'book-consultation';
    }
    if (normalized.includes('demo') || normalized.includes('trial')) {
      return 'start-trial';
    }
    if (normalized.includes('quote') || normalized.includes('estimate')) {
      return 'get-quote';
    }
    return 'get-started';
  }
  
  // Map database row to typed interface
  private mapToAccumulator(data: any): IntelligenceAccumulator {
    return {
      id: data.id,
      sessionId: data.session_id,
      userId: data.user_id,
      consultationData: data.consultation_data || {},
      brandData: data.brand_data,
      marketData: data.market_data || {},
      strategyData: data.strategy_data,
      completionStage: data.completion_stage,
      readinessScore: data.readiness_score,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

// Export singleton instance
export const intelligenceConcierge = new IntelligenceConcierge();
