/**
 * Content Generation Service
 * Generates persona-aware content using intelligence data
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  ConsultationData,
  GeneratedContent,
  ContentGenerationResponse,
  PersonaIntelligence,
  IntelligenceReference,
  GenerationLog
} from './types';
import { extractKeyInsights } from './marketResearch';
import { getPersonaInsights } from './personaSynthesis';

/**
 * Generate content using persona intelligence
 */
export async function generateIntelligentContent(
  consultationData: ConsultationData,
  intelligence: PersonaIntelligence | null
): Promise<ContentGenerationResponse> {
  console.log('🚀 Starting intelligent content generation');
  console.log('📊 Consultation data:', consultationData);
  console.log('🧠 Intelligence available:', !!intelligence);

  try {
    // If we have intelligence, extract key insights
    let intelligenceContext = null;
    if (intelligence?.marketResearch && intelligence?.synthesizedPersona) {
      const marketInsights = extractKeyInsights(intelligence.marketResearch);
      const personaInsights = getPersonaInsights(intelligence.synthesizedPersona);
      
      intelligenceContext = {
        persona: {
          name: intelligence.synthesizedPersona.name,
          primaryPain: personaInsights.primaryPain,
          primaryDesire: personaInsights.primaryDesire,
          keyObjections: personaInsights.keyObjections,
          languagePatterns: personaInsights.languageToUse,
          emotionalTriggers: personaInsights.emotionalTriggers,
          demographics: intelligence.synthesizedPersona.demographics,
          psychographics: intelligence.synthesizedPersona.psychographics
        },
        market: {
          topPainPoints: marketInsights.topPainPoints,
          keyStatistics: marketInsights.keyStatistics.map(s => s.claim),
          competitorGaps: marketInsights.competitorGaps,
          audienceLanguage: marketInsights.audienceLanguage
        }
      };
      
      console.log('✅ Intelligence context prepared:', {
        personaName: intelligenceContext.persona.name,
        painPoints: intelligenceContext.market.topPainPoints.length,
        statistics: intelligenceContext.market.keyStatistics.length
      });
    }

    // Call edge function with intelligence context
    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: {
        action: 'generate_content',
        consultationData,
        intelligenceContext
      }
    });

    if (error) {
      console.error('❌ Content generation failed:', error);
      return { success: false, error: error.message };
    }

    if (!data?.success || !data?.content) {
      console.error('❌ Invalid generation response:', data);
      return { success: false, error: data?.error || 'Invalid response from generation service' };
    }

    console.log('✅ Content generated:', {
      headline: data.content.headline?.substring(0, 50),
      features: data.content.features?.length,
      hasIntelligence: !!intelligenceContext
    });

    // Build intelligence reference
    const intelligenceUsed: IntelligenceReference = {
      marketClaimsUsed: intelligenceContext?.market.keyStatistics || [],
      personaInsightsUsed: intelligenceContext ? [
        intelligenceContext.persona.primaryPain,
        intelligenceContext.persona.primaryDesire
      ].filter(Boolean) : [],
      painPointsReferenced: intelligenceContext?.market.topPainPoints || [],
      confidenceScore: intelligence?.confidenceScore || 0
    };

    const content: GeneratedContent = {
      ...data.content,
      intelligenceUsed
    };

    return {
      success: true,
      content
    };

  } catch (err) {
    console.error('❌ Content generation error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * Log content generation for traceability
 */
export async function logGeneration(
  consultationId: string,
  userId: string,
  intelligenceId: string | null,
  generationType: GenerationLog['generationType'],
  inputData: ConsultationData,
  intelligenceUsed: IntelligenceReference,
  generatedContent: Partial<GeneratedContent>,
  confidenceScore: number
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('generation_logs')
      .insert({
        consultation_id: consultationId,
        persona_intelligence_id: intelligenceId,
        user_id: userId,
        generation_type: generationType,
        input_data: inputData as any,
        intelligence_used: intelligenceUsed as any,
        generated_content: generatedContent as any,
        confidence_score: confidenceScore
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Failed to log generation:', error);
      return null;
    }

    console.log('✅ Generation logged with ID:', data.id);
    return data.id;
  } catch (err) {
    console.error('❌ Error logging generation:', err);
    return null;
  }
}

/**
 * Get generation history for a consultation
 */
export async function getGenerationHistory(
  consultationId: string
): Promise<GenerationLog[]> {
  try {
    const { data, error } = await supabase
      .from('generation_logs')
      .select('*')
      .eq('consultation_id', consultationId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(log => ({
      id: log.id,
      consultationId: log.consultation_id,
      personaIntelligenceId: log.persona_intelligence_id,
      userId: log.user_id,
      generationType: log.generation_type as GenerationLog['generationType'],
      inputData: log.input_data as unknown as ConsultationData,
      intelligenceUsed: log.intelligence_used as unknown as IntelligenceReference,
      generatedContent: log.generated_content as unknown as Partial<GeneratedContent>,
      confidenceScore: log.confidence_score || 0,
      regenerationCount: log.regeneration_count || 0,
      createdAt: log.created_at
    }));
  } catch (err) {
    console.error('❌ Error fetching generation history:', err);
    return [];
  }
}

/**
 * Regenerate specific content piece
 */
export async function regenerateContent(
  consultationId: string,
  userId: string,
  generationType: GenerationLog['generationType'],
  consultationData: ConsultationData,
  intelligence: PersonaIntelligence | null
): Promise<ContentGenerationResponse> {
  // Get previous generation count
  const history = await getGenerationHistory(consultationId);
  const previousGenerations = history.filter(h => h.generationType === generationType);
  const regenerationCount = previousGenerations.length;
  
  console.log(`🔄 Regenerating ${generationType} (attempt ${regenerationCount + 1})`);
  
  // Generate new content
  const result = await generateIntelligentContent(consultationData, intelligence);
  
  if (result.success && result.content) {
    // Log the regeneration
    await logGeneration(
      consultationId,
      userId,
      intelligence?.id || null,
      generationType,
      consultationData,
      result.content.intelligenceUsed,
      result.content,
      result.content.intelligenceUsed.confidenceScore
    );
  }
  
  return result;
}
