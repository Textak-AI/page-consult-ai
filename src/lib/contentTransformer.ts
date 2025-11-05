// Intelligent content transformation - turns raw consultation answers into professional copy

export function transformChallenge(challenge: string, industry: string, audience?: string): string {
  if (!challenge) return generateDefaultHeadline(industry, audience);
  
  // Extract pain points and core problems
  const painPoint = extractPainPoint(challenge);
  const solution = frameSolution(painPoint, industry);
  
  return createCompellingHeadline(solution, industry, audience);
}

function extractPainPoint(text: string): string {
  // Remove filler words and extract the core problem
  const cleaned = text
    .toLowerCase()
    .replace(/^(they|customers|clients|users|people)\s+(don't|doesn't|can't|cannot|won't|aren't|are not|have no|lack|struggle|face|need|want)/i, '')
    .replace(/^(have|has)\s+(a|an|the|no)?\s+/i, '')
    .replace(/^way to\s+/i, '')
    .replace(/^(simple|easy|good|better)\s+/i, '')
    .trim();
  
  return cleaned;
}

function frameSolution(painPoint: string, industry: string): string {
  // Return the industry name for simple, professional headlines
  // Don't try to be clever with transformations - AI will handle this
  return industry;
}

function createCompellingHeadline(solution: string, industry: string, audience?: string): string {
  const industryKey = industry?.toLowerCase().replace(/\s+/g, '_');
  
  // Wedding DJ specific
  if (industryKey?.includes('wedding') || industryKey?.includes('dj')) {
    return `Your Perfect Wedding DJ`;
  }
  
  // B2B SaaS headlines (executive-focused)
  if (industryKey?.includes('saas') || industryKey?.includes('software')) {
    return `The Smart Solution for ${audience || 'Your Business'}`;
  }
  
  // Professional services headlines (trust-focused)
  if (industryKey?.includes('professional') || industryKey?.includes('legal') || industryKey?.includes('law')) {
    return `Professional ${industry} You Can Trust`;
  }
  
  // Home services
  if (industryKey?.includes('plumb') || industryKey?.includes('hvac') || industryKey?.includes('electric') || industryKey?.includes('contractor')) {
    return `Trusted ${industry} Services`;
  }
  
  // E-commerce headlines (benefit-focused)
  if (industryKey?.includes('commerce') || industryKey?.includes('retail')) {
    return `Quality Products at Great Prices`;
  }
  
  // Healthcare headlines (care-focused)
  if (industryKey?.includes('health') || industryKey?.includes('medical')) {
    return `Expert Healthcare When You Need It`;
  }
  
  // Consulting
  if (industryKey?.includes('consult')) {
    return `Strategic ${industry} That Drives Growth`;
  }
  
  // Default: Simple and professional
  return `Professional ${industry}`;
}

function generateDefaultHeadline(industry: string, audience?: string): string {
  const industryKey = industry?.toLowerCase().replace(/\s+/g, '_');
  const aud = audience?.split(',')[0]?.trim() || 'businesses';
  
  const defaults: Record<string, string> = {
    'b2b_saas': `The Smart Platform Built for ${capitalize(aud)}`,
    'professional_services': `Professional Services You Can Trust`,
    'ecommerce': `Shop Quality Products at Great Prices`,
    'healthcare': `Expert Healthcare When You Need It`,
    'education': `Learn Skills That Matter`,
    'real_estate': `Find Your Perfect Property`,
  };
  
  return defaults[industryKey] || `${industry} Solutions That Deliver Results`;
}

export function transformUniqueValue(value: string, industry: string): string {
  if (!value) return generateDefaultSubheadline(industry);
  
  // Clean up and enhance the value proposition
  const enhanced = value
    .replace(/^(we|our|the)\s+/i, '')
    .replace(/^(have|has|offer|provide)\s+/i, '')
    .trim();
  
  // Add industry-appropriate context
  const industryContext = getIndustryContext(industry);
  
  return `${capitalize(enhanced)}. ${industryContext}`;
}

function getIndustryContext(industry: string): string {
  const contexts: Record<string, string> = {
    'b2b_saas': 'Start your free trial today - no credit card required',
    'professional_services': 'Licensed, insured, and trusted by your neighbors',
    'ecommerce': 'Free shipping on orders over $50',
    'healthcare': 'Accepting new patients and most insurance plans',
    'education': 'Enroll now and start your journey',
    'real_estate': 'Let our experienced agents guide you home',
  };
  
  const key = industry?.toLowerCase().replace(/\s+/g, '_');
  return contexts[key] || 'Get started today with confidence';
}

function generateDefaultSubheadline(industry: string): string {
  const defaults: Record<string, string> = {
    'b2b_saas': 'Powerful tools that save time and drive results. Start your free trial today.',
    'professional_services': 'Expert service delivered by trusted professionals in your area.',
    'ecommerce': 'Quality products at competitive prices with fast, free shipping.',
    'healthcare': 'Compassionate care from experienced providers who put you first.',
    'education': 'Learn from industry experts with flexible, affordable programs.',
    'real_estate': 'Local expertise and personalized service to find your perfect home.',
  };
  
  const key = industry?.toLowerCase().replace(/\s+/g, '_');
  return defaults[key] || 'Professional solutions tailored to your needs.';
}

export function extractFeaturesFromValue(uniqueValue: string, industry: string): Array<{
  title: string;
  description: string;
  benefit: string;
}> {
  if (!uniqueValue) return [];
  
  const features: Array<{title: string; description: string; benefit: string}> = [];
  
  // Parse unique value for key points
  const sentences = uniqueValue
    .split(/[.!?]+/)
    .filter(s => s.trim() && s.length > 10)
    .slice(0, 3);
  
  sentences.forEach(sentence => {
    const cleaned = sentence.trim();
    
    // Extract the core concept
    if (cleaned.toLowerCase().includes('ai') || cleaned.toLowerCase().includes('automated')) {
      features.push({
        title: 'AI-Powered Automation',
        description: cleaned,
        benefit: 'Save 10+ hours every week',
      });
    } else if (cleaned.toLowerCase().includes('simple') || cleaned.toLowerCase().includes('easy')) {
      features.push({
        title: 'Dead Simple Setup',
        description: cleaned,
        benefit: 'Up and running in 5 minutes',
      });
    } else if (cleaned.toLowerCase().includes('wholistic') || cleaned.toLowerCase().includes('complete') || cleaned.toLowerCase().includes('all-in-one')) {
      features.push({
        title: 'Complete Solution',
        description: cleaned,
        benefit: 'Everything you need in one place',
      });
    } else if (cleaned.toLowerCase().includes('track') || cleaned.toLowerCase().includes('monitor') || cleaned.toLowerCase().includes('analytics')) {
      features.push({
        title: 'Real-Time Intelligence',
        description: cleaned,
        benefit: 'See every opportunity instantly',
      });
    } else {
      // Generic feature extraction
      const words = cleaned.split(' ').slice(0, 4);
      features.push({
        title: capitalize(words.join(' ')),
        description: cleaned,
        benefit: 'Proven results you can measure',
      });
    }
  });
  
  return features;
}

export function generateFeatureTitle(description: string): string {
  // Extract 2-4 key words for title
  const words = description
    .replace(/^(we|our|the|a|an)\s+/i, '')
    .split(' ')
    .slice(0, 4)
    .map(w => capitalize(w))
    .join(' ');
  
  return words;
}

export function generateFeatureDescription(rawDescription: string, benefit: string): string {
  // Clean up and make more compelling
  const cleaned = rawDescription
    .replace(/^(we|our)\s+/i, '')
    .replace(/\.$/, '')
    .trim();
  
  return `${capitalize(cleaned)}. ${benefit}.`;
}

export function transformOffer(offer: string, industry: string): string {
  if (!offer) return getDefaultCTA(industry);
  
  // Clean and enhance the offer
  const cleaned = offer
    .replace(/^(get|try|start|download)\s+/i, '')
    .trim();
  
  // Make it action-oriented
  if (cleaned.toLowerCase().includes('trial')) {
    return 'Start Free Trial';
  } else if (cleaned.toLowerCase().includes('demo')) {
    return 'Get Free Demo';
  } else if (cleaned.toLowerCase().includes('consultation') || cleaned.toLowerCase().includes('quote')) {
    return 'Get Free Quote';
  } else if (cleaned.toLowerCase().includes('download')) {
    return 'Download Free';
  }
  
  return `Get ${capitalize(cleaned)}`;
}

function getDefaultCTA(industry: string): string {
  const defaults: Record<string, string> = {
    'b2b_saas': 'Start Free Trial',
    'professional_services': 'Get Your Free Quote',
    'ecommerce': 'Shop Now',
    'healthcare': 'Book Appointment',
    'education': 'Enroll Now',
    'real_estate': 'Schedule Showing',
  };
  
  const key = industry?.toLowerCase().replace(/\s+/g, '_');
  return defaults[key] || 'Get Started';
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Industry-specific feature generators
export function generateIndustryFeatures(
  industry: string,
  uniqueValue?: string,
  challenge?: string
): Array<{title: string; description: string; icon: string}> {
  
  // First, try to extract features from unique value
  const extractedFeatures = uniqueValue ? extractFeaturesFromValue(uniqueValue, industry) : [];
  
  const industryKey = industry?.toLowerCase().replace(/\s+/g, '_');
  
  // B2B SaaS specific features
  if (industryKey?.includes('saas')) {
    return [
      {
        title: extractedFeatures[0]?.title || 'Set Up in 5 Minutes',
        description: extractedFeatures[0]?.description || 'Get started instantly with our intuitive platform. No technical knowledge required.',
        icon: 'Zap',
      },
      {
        title: extractedFeatures[1]?.title || 'Complete Visibility',
        description: extractedFeatures[1]?.description || 'See every visitor, every action, every opportunity in real-time dashboard.',
        icon: 'Target',
      },
      {
        title: extractedFeatures[2]?.title || 'Save 10+ Hours Weekly',
        description: extractedFeatures[2]?.description || 'Automated workflows handle repetitive tasks while you focus on closing deals.',
        icon: 'TrendingUp',
      },
      {
        title: 'Enterprise Security',
        description: 'Bank-level encryption and SOC 2 compliance. Your data is always safe.',
        icon: 'Shield',
      },
      {
        title: '24/7 Expert Support',
        description: 'Our team responds in under 2 hours. Get help whenever you need it.',
        icon: 'Users',
      },
      {
        title: 'Proven ROI',
        description: 'Companies see average 3x return in first 90 days. Results you can measure.',
        icon: 'Award',
      },
    ];
  }
  
  // Professional Services features
  if (industryKey?.includes('professional')) {
    return [
      {
        title: 'Free Consultation',
        description: 'Get expert advice with no obligation. We assess your needs and provide detailed quotes.',
        icon: 'Zap',
      },
      {
        title: 'Licensed & Insured',
        description: 'Fully licensed and insured for your peace of mind. All work meets local codes.',
        icon: 'Shield',
      },
      {
        title: 'Local Expertise',
        description: 'Years serving your community. We understand local needs and regulations.',
        icon: 'Target',
      },
      {
        title: 'Satisfaction Guarantee',
        description: "We stand behind our work 100%. If you're not satisfied, we make it right.",
        icon: 'Award',
      },
      {
        title: 'Fast Response',
        description: 'Quick scheduling and reliable service. We show up when promised.',
        icon: 'TrendingUp',
      },
      {
        title: 'Transparent Pricing',
        description: "Clear, upfront pricing with no hidden fees. You'll know exactly what you're paying.",
        icon: 'Users',
      },
    ];
  }
  
  // Default features
  return [
    {
      title: extractedFeatures[0]?.title || 'Expert Service',
      description: extractedFeatures[0]?.description || 'Professional service from experienced specialists who care about your success.',
      icon: 'Award',
    },
    {
      title: extractedFeatures[1]?.title || 'Quality Guaranteed',
      description: extractedFeatures[1]?.description || 'We stand behind our work with satisfaction guarantee and commitment to excellence.',
      icon: 'Shield',
    },
    {
      title: extractedFeatures[2]?.title || 'Fast Results',
      description: extractedFeatures[2]?.description || 'Quick turnaround and responsive communication throughout your project.',
      icon: 'Zap',
    },
    {
      title: 'Competitive Pricing',
      description: 'Fair, transparent pricing with no hidden fees. Great value for your investment.',
      icon: 'Target',
    },
    {
      title: 'Proven Track Record',
      description: 'Success helping clients achieve goals and exceed expectations.',
      icon: 'TrendingUp',
    },
    {
      title: 'Ongoing Support',
      description: 'Dedicated support ready to help every step of the way.',
      icon: 'Users',
    },
  ];
}