/**
 * Market Research Service
 * Uses Perplexity API to gather real market intelligence
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  ResearchInputs, 
  MarketResearch, 
  MarketResearchResponse,
  MarketClaim 
} from './types';

/**
 * Fetch market research for a target audience
 */
export async function fetchMarketResearch(
  inputs: ResearchInputs
): Promise<MarketResearchResponse> {
  console.log('🔍 Starting market research for:', inputs);
  
  try {
    const { data, error } = await supabase.functions.invoke('market-intelligence', {
      body: {
        industry: inputs.industry,
        targetAudience: inputs.targetAudience,
        serviceType: inputs.serviceType,
        location: inputs.location,
        challenge: inputs.challenge
      }
    });

    if (error) {
      console.error('❌ Market research failed:', error);
      return { success: false, error: error.message };
    }

    if (!data?.success || !data?.research) {
      console.error('❌ Invalid research response:', data);
      return { success: false, error: data?.error || 'Invalid response from research service' };
    }

    console.log('✅ Market research complete:', {
      claimsFound: data.research.claims?.length || 0,
      painPoints: data.research.painPoints?.length || 0,
      sources: data.research.sources?.length || 0
    });

    return {
      success: true,
      research: data.research as MarketResearch
    };

  } catch (err) {
    console.error('❌ Market research error:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

/**
 * Store research results in database
 */
export async function storeMarketResearch(
  consultationId: string,
  userId: string,
  inputs: ResearchInputs,
  research: MarketResearch
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('persona_intelligence')
      .insert({
        consultation_id: consultationId,
        user_id: userId,
        industry: inputs.industry,
        target_audience: inputs.targetAudience,
        location: inputs.location,
        service_type: inputs.serviceType,
        market_research: research as any,
        research_sources: research.sources,
        research_status: 'researching'
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Failed to store research:', error);
      return null;
    }

    console.log('✅ Research stored with ID:', data.id);
    return data.id;
  } catch (err) {
    console.error('❌ Error storing research:', err);
    return null;
  }
}

/**
 * Update research status
 */
export async function updateResearchStatus(
  intelligenceId: string,
  status: 'pending' | 'researching' | 'synthesizing' | 'complete' | 'failed',
  additionalData?: Partial<{
    synthesized_persona: any;
    confidence_score: number;
    completed_at: string;
  }>
): Promise<boolean> {
  try {
    const updateData: any = {
      research_status: status,
      ...additionalData
    };

    const { error } = await supabase
      .from('persona_intelligence')
      .update(updateData)
      .eq('id', intelligenceId);

    if (error) {
      console.error('❌ Failed to update status:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('❌ Error updating status:', err);
    return false;
  }
}

/**
 * Get existing research for a consultation
 */
export async function getExistingResearch(
  consultationId: string
): Promise<{
  id: string;
  marketResearch: MarketResearch;
  synthesizedPersona: any;
  status: string;
} | null> {
  try {
    const { data, error } = await supabase
      .from('persona_intelligence')
      .select('id, market_research, synthesized_persona, research_status')
      .eq('consultation_id', consultationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      marketResearch: data.market_research as unknown as MarketResearch,
      synthesizedPersona: data.synthesized_persona,
      status: data.research_status || 'pending'
    };
  } catch (err) {
    console.error('❌ Error fetching research:', err);
    return null;
  }
}

/**
 * Extract high-confidence claims for content generation
 */
export function extractKeyInsights(research: MarketResearch): {
  topPainPoints: string[];
  keyStatistics: MarketClaim[];
  competitorGaps: string[];
  audienceLanguage: string[];
} {
  // Get top pain points
  const topPainPoints = research.painPoints.slice(0, 5);
  
  // Get high-confidence statistics
  const keyStatistics = research.claims
    .filter(c => c.confidence === 'high' && c.category === 'statistic')
    .slice(0, 3);
  
  // Get market gaps from competitors
  const competitorGaps = research.competitors
    .flatMap(c => c.marketGaps || [])
    .slice(0, 3);
  
  // Extract buying behavior language
  const audienceLanguage = research.demographics.buyingBehavior || [];

  return {
    topPainPoints,
    keyStatistics,
    competitorGaps,
    audienceLanguage
  };
}
