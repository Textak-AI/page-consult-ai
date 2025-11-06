import { getIndustryTemplate } from './contentTemplates';
import { getIndustryInsights, hasWeakCredentials, extractLocation } from './industryInsights';
import { 
  transformChallenge, 
  transformUniqueValue, 
  transformOffer,
  generateIndustryFeatures 
} from './contentTransformer';
import { 
  validatePageQuality, 
  formatStatistic, 
  ensureProfessionalCopy, 
  logQualityReport 
} from './contentQuality';
import { getAuthHeaders } from './authHelpers';
// Direct Claude API integration (no edge functions)
import { generateIntelligentContent } from './generateIntelligentContent';

export interface ConsultationData {
  industry?: string;
  service_type?: string;
  goal?: string;
  target_audience?: string;
  challenge?: string;
  unique_value?: string;
  offer?: string;
  wants_calculator?: boolean;
  calculator_config?: any;
}

// AI-powered content generation using direct Claude API
export async function generatePageContentWithAI(data: ConsultationData): Promise<{
  headline: string;
  subheadline: string;
  features: Array<{title: string; description: string; icon: string}>;
  ctaText: string;
  problemStatement: string;
  solutionStatement: string;
} | null> {
  try {
    // Use direct Claude API integration (bypasses edge functions)
    const { generateIntelligentContent } = await import('./generateIntelligentContent');
    const result = await generateIntelligentContent(data);
    
    console.log('✅ AI-generated content via Claude API:', {
      headline: result.headline,
      features: result.features.length
    });
    
    return {
      headline: result.headline,
      subheadline: result.subheadline,
      features: result.features.map(f => ({
        title: f.title,
        description: f.description,
        icon: f.icon || '✓'
      })),
      ctaText: result.ctaText,
      problemStatement: result.problemStatement,
      solutionStatement: result.solutionStatement
    };
  } catch (error) {
    console.error('❌ Claude API content generation failed:', error);
    
    // Show user-friendly error message
    if (error instanceof Error) {
      if (error.message.includes('VITE_ANTHROPIC_API_KEY')) {
        console.error('⚠️ Anthropic API key not configured');
      } else {
        console.error('⚠️ AI generation error:', error.message);
      }
    }
    
    // Return null to trigger fallback templates
    return null;
  }
}

export function generateHeadline(data: ConsultationData): string {
  // Fallback template-based generation
  const headline = transformChallenge(
    data.challenge || '', 
    data.industry || 'Professional Services',
    data.target_audience
  );
  
  // Ensure it's professional copy, not raw consultation text
  return ensureProfessionalCopy(headline, 'headline');
}

export function generateSubheadline(data: ConsultationData): string {
  // Transform unique value into compelling subheadline
  const subheadline = transformUniqueValue(
    data.unique_value || '',
    data.industry || 'Professional Services'
  );
  
  // Ensure it's professional copy
  return ensureProfessionalCopy(subheadline, 'description');
}

export function generateFeatures(data: ConsultationData) {
  // Generate industry-specific features with intelligent extraction from unique value
  const features = generateIndustryFeatures(
    data.industry || 'Professional Services',
    data.unique_value,
    data.challenge
  );
  
  // Ensure each feature is professional
  return features.map(feature => ({
    ...feature,
    title: ensureProfessionalCopy(feature.title, 'feature'),
    description: ensureProfessionalCopy(feature.description, 'description'),
  }));
}

export async function generateSocialProof(data: ConsultationData) {
  // REMOVED: No longer generating fake stats or activity
  // Social proof should only be shown if user provides real data
  
  // Check if we should enhance with industry insights
  let industryInsights = null;
  if (hasWeakCredentials(data)) {
    console.log('Weak credentials detected, fetching industry insights...');
    const location = extractLocation(data.target_audience);
    const insights = await getIndustryInsights(
      data.industry || 'Professional Services',
      data.service_type,
      location,
      data.target_audience
    );
    
    if (insights) {
      industryInsights = {
        title: `${insights.industry} Market Intelligence`,
        stats: insights.stats || [],
        facts: insights.facts || [],
        valueProps: insights.valueProps || [],
        credentials: insights.credentials || [],
        extractedStats: insights.extractedStats || null,
      };
    }
  }
  
  return {
    stats: [], // No fake stats
    recentActivity: [], // No fake activity
    industryInsights,
  };
}

// New function to fetch strategic market research with quality assurance
export async function fetchStrategicInsights(data: ConsultationData) {
  try {
    const location = extractLocation(data.target_audience);
    const { supabase } = await import('@/integrations/supabase/client');
    
    const headers = await getAuthHeaders();
    
    const { data: result, error } = await supabase.functions.invoke('perplexity-research', {
      body: {
        service: data.service_type || data.industry,
        location,
        industry: data.industry,
        concerns: data.challenge,
      },
      headers,
    });
    
    if (error || !result?.success) {
      console.log('No cited market data available, using fallback');
      return null;
    }
    
    // Format statistics properly before returning
    if (result.strategicPlacements) {
      const { hero, problem, solution } = result.strategicPlacements;
      
      return {
        hero: hero ? {
          ...hero,
          statistic: formatStatistic(hero.statistic, hero.claim)
        } : null,
        problem: problem ? {
          ...problem,
          statistic: formatStatistic(problem.statistic, problem.claim)
        } : null,
        solution: solution ? {
          ...solution,
          statistic: formatStatistic(solution.statistic, solution.claim)
        } : null,
      };
    }
    
    return result.strategicPlacements;
  } catch (error) {
    console.error('Error fetching strategic insights:', error);
    return null;
  }
}

export function generateCTA(data: ConsultationData) {
  const template = getIndustryTemplate(data.industry);
  
  return {
    text: transformOffer(data.offer || '', data.industry || 'Professional Services'),
    urgency: template.urgencyText,
    link: '#signup',
  };
}

export function generateFOMO(data: ConsultationData) {
  // REMOVED: No longer generating fake urgency badges or viewer counts
  // FOMO should only be shown if user provides real urgency (limited spots, sale dates, etc.)
  
  return {
    badge: '', // No fake badges
    urgency: '', // No fake urgency
  };
}

export function validateContent(headline: string, features: any[], problem?: string, solution?: string): boolean {
  // Use the comprehensive quality validation system
  const qualityCheck = validatePageQuality({
    headline,
    subheadline: '', // Will be checked separately in generateSections
    features,
    problem,
    solution,
  });

  // Log the quality report for debugging
  logQualityReport(qualityCheck, 'Generated Page Content');

  // Only block generation on critical errors, not warnings
  if (!qualityCheck.passed) {
    console.error('❌ Page generation blocked due to quality issues. Fix errors before proceeding.');
  }

  return qualityCheck.passed;
}

/**
 * Comprehensive content validation before finalizing any page
 * This runs after all content is generated
 */
export function validateGeneratedPage(pageContent: {
  headline: string;
  subheadline: string;
  features: any[];
  statistics?: any[];
  problem?: string;
  solution?: string;
}): { valid: boolean; report: any } {
  const qualityCheck = validatePageQuality(pageContent);
  logQualityReport(qualityCheck, 'Final Page Validation');
  
  return {
    valid: qualityCheck.passed,
    report: qualityCheck,
  };
}
