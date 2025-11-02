import { supabase } from '@/integrations/supabase/client';

export interface IndustryInsights {
  industry: string;
  stats: string[];
  facts: string[];
  valueProps?: string[];
  credentials?: string[];
  trustSignals?: string[];
  extractedStats?: {
    marketSize: string | null;
    growthRate: string | null;
    customerCount: string | null;
  };
  rawText: string;
}

export async function getIndustryInsights(
  industry: string,
  serviceType?: string,
  location?: string,
  audience?: string
): Promise<IndustryInsights | null> {
  try {
    console.log('Fetching industry insights:', { industry, serviceType, location, audience });
    
    const { data, error } = await supabase.functions.invoke('industry-insights', {
      body: {
        industry,
        serviceType,
        location,
        audience,
      },
    });

    if (error) {
      console.error('Error fetching industry insights:', error);
      return null;
    }

    if (!data?.insights) {
      console.error('No insights in response:', data);
      return null;
    }

    console.log('Received industry insights:', data.insights);
    return data.insights;
  } catch (error) {
    console.error('Exception fetching industry insights:', error);
    return null;
  }
}

export function hasWeakCredentials(consultation: any): boolean {
  // Check if the business has strong credentials
  const yearsInBusiness = extractYears(consultation.unique_value);
  const hasCustomerCount = /\d+\s*(customer|client|project|home)/i.test(consultation.unique_value || '');
  const hasCertifications = /(certified|licensed|accredited|award|member)/i.test(consultation.unique_value || '');
  
  // Weak credentials = less than 3 years AND no customer count AND no certifications
  const isWeak = (!yearsInBusiness || yearsInBusiness < 3) && !hasCustomerCount && !hasCertifications;
  
  console.log('Credential strength check:', {
    yearsInBusiness,
    hasCustomerCount,
    hasCertifications,
    isWeak,
  });
  
  return isWeak;
}

function extractYears(text?: string): number | null {
  if (!text) return null;
  
  const match = text.match(/(\d+)\+?\s*years?/i);
  return match ? parseInt(match[1]) : null;
}

export function enhanceSocialProofWithInsights(
  baseStats: any[],
  insights: IndustryInsights | null
): any {
  if (!insights || insights.stats.length === 0) {
    return {
      stats: baseStats,
      industryInsights: null,
    };
  }

  // Create industry context section from insights
  const industryContext = {
    title: `${insights.industry} Industry Insights`,
    items: [
      ...insights.stats.slice(0, 3).map(stat => ({
        icon: '📊',
        text: stat,
      })),
    ],
  };

  // Add trust signals if available
  const trustSection = insights.trustSignals && insights.trustSignals.length > 0 ? {
    title: 'Why Professional Service Matters',
    items: insights.trustSignals.slice(0, 3).map(signal => ({
      icon: '✓',
      text: signal,
    })),
  } : null;

  return {
    stats: baseStats,
    industryInsights: industryContext,
    trustSignals: trustSection,
  };
}

export function generateEnhancedFeatures(
  baseFeatures: any[],
  insights: IndustryInsights | null
): any[] {
  if (!insights) return baseFeatures;

  // Enhance feature descriptions with industry facts where relevant
  const enhanced = [...baseFeatures];

  // If we have relevant facts, incorporate them into feature descriptions
  insights.facts.slice(0, 3).forEach((fact, index) => {
    if (enhanced[index]) {
      // Add industry context to the feature description
      const currentDesc = enhanced[index].description;
      if (!currentDesc.includes(fact.substring(0, 20))) {
        enhanced[index] = {
          ...enhanced[index],
          description: `${currentDesc} ${fact}`,
        };
      }
    }
  });

  return enhanced;
}

export function extractLocation(targetAudience?: string): string | undefined {
  if (!targetAudience) return undefined;
  
  // Try to extract location from patterns like "in Lakewood" or "Lakewood homeowners"
  const patterns = [
    /in\s+([A-Z][a-zA-Z\s]+?)(?:\s+(?:area|region|county|state|homeowners|residents|businesses))/i,
    /([A-Z][a-zA-Z]+)\s+(?:homeowners|residents|businesses|area)/i,
  ];
  
  for (const pattern of patterns) {
    const match = targetAudience.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return undefined;
}
