/**
 * Intelligence Services - Public API
 * Orchestrates the intelligence-first content generation pipeline
 */

// Re-export types
export * from './types';

// Re-export services
export { 
  fetchMarketResearch, 
  storeMarketResearch, 
  getExistingResearch,
  extractKeyInsights 
} from './marketResearch';

export { 
  synthesizePersona, 
  getPersonaInsights,
  generateCopyVariations 
} from './personaSynthesis';

export { 
  generateIntelligentContent, 
  logGeneration,
  getGenerationHistory,
  regenerateContent 
} from './contentGeneration';

import type { 
  ConsultationData, 
  PersonaIntelligence,
  GeneratedContent,
  ResearchInputs 
} from './types';
import { fetchMarketResearch, storeMarketResearch, getExistingResearch } from './marketResearch';
import { synthesizePersona } from './personaSynthesis';
import { generateIntelligentContent, logGeneration } from './contentGeneration';

/**
 * Full intelligence pipeline:
 * 1. Fetch market research (Perplexity)
 * 2. Synthesize persona (Claude)
 * 3. Generate content (Claude with persona context)
 */
export async function runIntelligencePipeline(
  consultationId: string,
  userId: string,
  consultationData: ConsultationData
): Promise<{
  success: boolean;
  intelligence?: PersonaIntelligence;
  content?: GeneratedContent;
  error?: string;
}> {
  console.log('🚀 Starting full intelligence pipeline');
  
  // Check for existing research
  const existing = await getExistingResearch(consultationId);
  
  if (existing?.status === 'complete' && existing.synthesizedPersona) {
    console.log('♻️ Using existing intelligence');
    
    // Generate content with existing intelligence
    const contentResult = await generateIntelligentContent(consultationData, {
      id: existing.id,
      consultationId,
      userId,
      industry: consultationData.industry || '',
      targetAudience: consultationData.targetAudience || '',
      marketResearch: existing.marketResearch,
      synthesizedPersona: existing.synthesizedPersona,
      researchSources: existing.marketResearch?.sources || [],
      confidenceScore: 0.8,
      researchStatus: 'complete',
      createdAt: '',
      updatedAt: ''
    } as PersonaIntelligence);
    
    if (!contentResult.success) {
      return { success: false, error: contentResult.error };
    }
    
    return {
      success: true,
      content: contentResult.content
    };
  }

  // Step 1: Market Research
  console.log('📊 Step 1: Market Research');
  const researchInputs: ResearchInputs = {
    industry: consultationData.industry || '',
    targetAudience: consultationData.targetAudience || '',
    serviceType: consultationData.serviceType,
    challenge: consultationData.challenge
  };
  
  const researchResult = await fetchMarketResearch(researchInputs);
  
  if (!researchResult.success || !researchResult.research) {
    console.warn('⚠️ Market research failed, proceeding without intelligence');
    // Fall back to content generation without intelligence
    const fallbackResult = await generateIntelligentContent(consultationData, null);
    return {
      success: fallbackResult.success,
      content: fallbackResult.content,
      error: fallbackResult.error
    };
  }

  // Store research
  const intelligenceId = await storeMarketResearch(
    consultationId,
    userId,
    researchInputs,
    researchResult.research
  );
  
  if (!intelligenceId) {
    console.warn('⚠️ Failed to store research, proceeding anyway');
  }

  // Step 2: Persona Synthesis
  console.log('🧠 Step 2: Persona Synthesis');
  let synthesizedPersona = null;
  
  if (intelligenceId) {
    const personaResult = await synthesizePersona(
      intelligenceId,
      researchInputs,
      researchResult.research
    );
    
    if (personaResult.success && personaResult.persona) {
      synthesizedPersona = personaResult.persona;
    }
  }

  // Step 3: Content Generation
  console.log('✍️ Step 3: Content Generation');
  const intelligence: PersonaIntelligence | null = intelligenceId && synthesizedPersona ? {
    id: intelligenceId,
    consultationId,
    userId,
    industry: researchInputs.industry,
    targetAudience: researchInputs.targetAudience,
    location: researchInputs.location,
    serviceType: researchInputs.serviceType,
    marketResearch: researchResult.research,
    synthesizedPersona,
    researchSources: researchResult.research.sources,
    confidenceScore: 0.8,
    researchStatus: 'complete',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } : null;
  
  const contentResult = await generateIntelligentContent(consultationData, intelligence);
  
  if (!contentResult.success) {
    return { success: false, error: contentResult.error };
  }

  // Log the generation
  if (contentResult.content) {
    await logGeneration(
      consultationId,
      userId,
      intelligenceId,
      'full_page',
      consultationData,
      contentResult.content.intelligenceUsed,
      contentResult.content,
      contentResult.content.intelligenceUsed.confidenceScore
    );
  }

  console.log('✅ Intelligence pipeline complete');
  
  return {
    success: true,
    intelligence: intelligence || undefined,
    content: contentResult.content
  };
}
