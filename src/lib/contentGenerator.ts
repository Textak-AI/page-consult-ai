import { getIndustryTemplate } from './contentTemplates';
import { getIndustryInsights, hasWeakCredentials, extractLocation } from './industryInsights';

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
  const template = getIndustryTemplate(data.industry);
  
  // Extract location from target audience if present
  const audience = data.target_audience || 'businesses';
  const locationMatch = audience.match(/in\s+([A-Z][a-zA-Z\s]+)/);
  const location = locationMatch ? locationMatch[1].trim() : undefined;
  
  // Use service_type if available, otherwise use challenge or industry
  const service = data.service_type || data.challenge?.split('.')[0] || data.industry || 'Services';
  
  // Clean up the service name
  const cleanService = service
    .replace(/^(What|How|Why)\s+/i, '')
    .replace(/\?$/, '')
    .trim();
  
  return template.heroPattern(cleanService, audience, location);
}

export function generateSubheadline(data: ConsultationData): string {
  const template = getIndustryTemplate(data.industry);
  const value = data.unique_value || 'Quality service you can trust';
  return template.subheadlinePattern(value);
}

export function generateFeatures(data: ConsultationData) {
  const template = getIndustryTemplate(data.industry);
  
  // Use template features but customize titles based on unique_value if available
  const features = [...template.features];
  
  // If unique_value has specific points, try to incorporate them
  if (data.unique_value) {
    const valuePoints = data.unique_value
      .split(/[.!?]+/)
      .filter(s => s.trim() && s.length > 10)
      .slice(0, 3);
    
    // Replace first few features with custom ones if we have specific value points
    valuePoints.forEach((point, i) => {
      if (i < features.length && point.length < 100) {
        const words = point.trim().split(' ');
        const title = words.slice(0, 4).join(' ');
        features[i] = {
          ...features[i],
          title: title,
          description: point.trim() + '. ' + features[i].description.split('.').slice(1).join('.'),
        };
      }
    });
  }
  
  return features;
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
        title: `${insights.industry} Industry Context`,
        stats: insights.stats.slice(0, 3),
        facts: insights.facts.slice(0, 3),
      };
    }
  }
  
  return {
    stats: baseStats,
    recentActivity,
    industryInsights,
  };
}

export function generateCTA(data: ConsultationData) {
  const template = getIndustryTemplate(data.industry);
  
  return {
    text: data.offer || template.ctaText,
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
  // Ensure headline is complete and not generic
  if (headline.includes('undefined') || headline.includes('[') || headline.length < 10) {
    console.warn('Invalid headline:', headline);
    return false;
  }
  
  // Ensure features are complete
  for (const feature of features) {
    if (!feature.title || !feature.description || feature.description.length < 20) {
      console.warn('Incomplete feature:', feature);
      return false;
    }
    if (feature.title.includes('undefined') || feature.description.includes('undefined')) {
      console.warn('Feature contains undefined:', feature);
      return false;
    }
  }
  
  return true;
}
