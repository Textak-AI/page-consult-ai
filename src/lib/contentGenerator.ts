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

export function generateHeadline(data: ConsultationData): string {
  // Use intelligent transformation instead of templates
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
  const template = getIndustryTemplate(data.industry);
  
  // Generate realistic stats based on industry
  const baseStats = [
    { label: template.statsLabels[0], value: '2,847+' },
    { label: template.statsLabels[1], value: '98.5%' },
    { label: template.statsLabels[2], value: '12+' },
  ];
  
  // Generate activity based on industry and service type
  const activityType = template.ctaText.toLowerCase().includes('quote') 
    ? 'requested a quote'
    : template.ctaText.toLowerCase().includes('trial')
    ? 'started a trial'
    : template.ctaText.toLowerCase().includes('shop')
    ? 'made a purchase'
    : 'signed up';
  
  const recentActivity = [
    { name: 'Sarah M.', action: activityType, time: '2 minutes ago', location: 'California' },
    { name: 'James K.', action: 'became a customer', time: '5 minutes ago', location: 'Texas' },
    { name: 'Lisa T.', action: activityType, time: '8 minutes ago', location: 'New York' },
    { name: 'Michael R.', action: 'left a 5-star review', time: '12 minutes ago', location: 'Florida' },
  ];
  
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
    stats: baseStats,
    recentActivity,
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
  const template = getIndustryTemplate(data.industry);
  
  // Industry-specific FOMO badges
  const badges = {
    professional_services: '🔥 127 homeowners requested quotes today',
    b2b_saas: '🔥 89 companies started their free trial today',
    ecommerce: '🔥 234 customers shopping right now',
    healthcare: '🔥 45 appointments booked today',
    education: '🔥 156 students enrolled this week',
    real_estate: '🔥 78 showings scheduled this week',
    default: '🔥 127 people viewed this in the last hour',
  };
  
  const urgencies = {
    professional_services: 'Limited availability - only 8 slots left this month',
    b2b_saas: '14-day free trial - no credit card required',
    ecommerce: 'Sale ends tonight - save up to 40%',
    healthcare: 'Same-day appointments available',
    education: 'Early bird discount ends Friday',
    real_estate: 'New properties added daily',
    default: 'Limited spots available - 23 left this month',
  };
  
  const industryKey = data.industry?.toLowerCase().replace(/\s+/g, '_') as keyof typeof badges || 'default';
  
  return {
    badge: badges[industryKey] || badges.default,
    urgency: urgencies[industryKey] || urgencies.default,
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
