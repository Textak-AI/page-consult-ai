/**
 * Persona Synthesis Service
 * Uses Claude to synthesize market research into actionable persona insights
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  MarketResearch, 
  SynthesizedPersona,
  PersonaSynthesisResponse,
  ResearchInputs
} from './types';
import { updateResearchStatus } from './marketResearch';

/**
 * Synthesize market research into a detailed persona
 */
export async function synthesizePersona(
  intelligenceId: string,
  inputs: ResearchInputs,
  marketResearch: MarketResearch
): Promise<PersonaSynthesisResponse> {
  console.log('🧠 Starting persona synthesis for:', inputs.targetAudience);
  
  try {
    // Update status to synthesizing
    await updateResearchStatus(intelligenceId, 'synthesizing');
    
    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: {
        action: 'synthesize_persona',
        inputs,
        marketResearch
      }
    });

    if (error) {
      console.error('❌ Persona synthesis failed:', error);
      await updateResearchStatus(intelligenceId, 'failed');
      return { success: false, error: error.message };
    }

    if (!data?.success || !data?.persona) {
      console.error('❌ Invalid synthesis response:', data);
      await updateResearchStatus(intelligenceId, 'failed');
      return { success: false, error: data?.error || 'Invalid response from synthesis service' };
    }

    console.log('✅ Persona synthesis complete:', {
      name: data.persona.name,
      painPoints: data.persona.painPoints?.length || 0,
      objections: data.persona.objections?.length || 0
    });

    // Store synthesized persona
    await updateResearchStatus(intelligenceId, 'complete', {
      synthesized_persona: data.persona,
      confidence_score: calculateConfidence(marketResearch, data.persona),
      completed_at: new Date().toISOString()
    });

    return {
      success: true,
      persona: data.persona as SynthesizedPersona
    };

  } catch (err) {
    console.error('❌ Persona synthesis error:', err);
    await updateResearchStatus(intelligenceId, 'failed');
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

/**
 * Calculate confidence score based on data quality
 */
function calculateConfidence(
  research: MarketResearch,
  persona: SynthesizedPersona
): number {
  let score = 0;
  
  // Claims quality (max 0.3)
  const highConfidenceClaims = research.claims.filter(c => c.confidence === 'high').length;
  score += Math.min(highConfidenceClaims * 0.05, 0.3);
  
  // Source diversity (max 0.2)
  const uniqueSources = new Set(research.sources).size;
  score += Math.min(uniqueSources * 0.04, 0.2);
  
  // Pain point depth (max 0.2)
  score += Math.min(persona.painPoints.length * 0.04, 0.2);
  
  // Objection coverage (max 0.15)
  score += Math.min(persona.objections.length * 0.05, 0.15);
  
  // Demographics completeness (max 0.15)
  const demoFields = ['primaryAge', 'income', 'location', 'occupation'];
  const filledDemos = demoFields.filter(f => persona.demographics[f as keyof typeof persona.demographics]);
  score += (filledDemos.length / demoFields.length) * 0.15;
  
  return Math.round(score * 100) / 100;
}

/**
 * Get persona insights for content generation
 */
export function getPersonaInsights(persona: SynthesizedPersona): {
  primaryPain: string;
  primaryDesire: string;
  keyObjections: string[];
  languageToUse: string[];
  emotionalTriggers: string[];
} {
  // Get highest intensity pain point
  const criticalPains = persona.painPoints.filter(p => p.intensity === 'critical');
  const primaryPain = criticalPains[0]?.pain || persona.painPoints[0]?.pain || '';
  
  // Get must-have desire
  const mustHaves = persona.desires.filter(d => d.priority === 'must_have');
  const primaryDesire = mustHaves[0]?.desire || persona.desires[0]?.desire || '';
  
  // Get common objections
  const keyObjections = persona.objections
    .filter(o => o.likelihood === 'common')
    .map(o => o.objection)
    .slice(0, 3);
  
  // Get language patterns
  const languageToUse = persona.languagePatterns.slice(0, 5);
  
  // Get emotional triggers
  const emotionalTriggers = [
    ...persona.psychographics.fears.slice(0, 2),
    ...persona.psychographics.aspirations.slice(0, 2)
  ];

  return {
    primaryPain,
    primaryDesire,
    keyObjections,
    languageToUse,
    emotionalTriggers
  };
}

/**
 * Generate copy variations based on persona
 */
export function generateCopyVariations(
  persona: SynthesizedPersona,
  copyType: 'headline' | 'subheadline' | 'cta'
): string[] {
  const insights = getPersonaInsights(persona);
  const variations: string[] = [];
  
  switch (copyType) {
    case 'headline':
      // Pain-focused
      if (insights.primaryPain) {
        variations.push(`Stop ${insights.primaryPain.toLowerCase()}`);
      }
      // Desire-focused
      if (insights.primaryDesire) {
        variations.push(`Finally, ${insights.primaryDesire.toLowerCase()}`);
      }
      break;
      
    case 'subheadline':
      // Address objection
      if (insights.keyObjections[0]) {
        variations.push(`No ${insights.keyObjections[0].toLowerCase()} — guaranteed.`);
      }
      break;
      
    case 'cta':
      // Use their language
      if (insights.languageToUse[0]) {
        variations.push(`Get ${insights.languageToUse[0]}`);
      }
      break;
  }
  
  return variations;
}
