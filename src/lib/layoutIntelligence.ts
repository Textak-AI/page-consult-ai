// Page structure item type
export interface PageStructureItem {
  section: string;
  guidance: string;
}

// Layout intelligence type
export interface LayoutIntelligence {
  archetype?: string;
  archetypeName?: string;
  confidence?: number;
  reasoning?: string;
  heroStyle?: string;
  ctaStyle?: string;
  trustPriorities?: string[];
  ctaText?: {
    primary?: string[];
    secondary?: string[];
  };
}

// Client-side layout intelligence generator (fallback when API not called)
export function getClientLayoutIntelligence(industry: string | null, audience: string | null): { pageStructure: PageStructureItem[]; layoutIntelligence: LayoutIntelligence } {
  const industryLower = (industry || '').toLowerCase();
  const audienceLower = (audience || '').toLowerCase();
  
  // Comprehensive local service keywords (matches industryDetection.ts)
  const localKeywords = [
    // Home services
    'plumb', 'plumber', 'plumbing',
    'hvac', 'heating', 'cooling', 'air conditioning',
    'electric', 'electrician', 'electrical',
    'roof', 'roofing', 'roofer',
    'landscap', 'lawn', 'yard',
    'clean', 'cleaning', 'maid', 'janitorial',
    'repair', 'handyman', 'maintenance',
    'pest', 'exterminator',
    'moving', 'mover',
    'auto', 'mechanic', 'garage',
    'tow', 'towing',
    'locksmith',
    // Construction trades
    'contractor', 'construction',
    'carpet', 'flooring', 'tile',
    'paint', 'painter', 'painting',
    'window', 'glass',
    'garage door',
    'appliance',
    'pool', 'spa',
    'tree', 'arborist',
    'gutter',
    'pressure wash', 'power wash',
    'junk removal', 'hauling',
    'drywall',
    'concrete', 'mason', 'masonry',
    'fencing', 'fence',
    'siding',
    'insulation',
    'solar',
    'septic',
    'well', 'water treatment',
    // Personal services
    'salon', 'barber', 'barbershop',
    'spa', 'massage', 'wellness',
    'restaurant', 'catering',
    'dentist', 'dental',
  ];
  const localAudienceKeywords = ['homeowner', 'local', 'resident', 'neighborhood', 'community', 'metro', 'county', 'city of', 'greater'];
  
  // Check for local match
  const matchedLocalKeyword = localKeywords.find(k => industryLower.includes(k));
  const matchedAudienceKeyword = localAudienceKeywords.find(k => audienceLower.includes(k));
  const isLocal = !!matchedLocalKeyword || !!matchedAudienceKeyword;
  
  // Debug logging
  if (matchedLocalKeyword || matchedAudienceKeyword) {
    console.log(`🎯 [LayoutIntelligence] Local match found:`, { 
      industry: matchedLocalKeyword, 
      audience: matchedAudienceKeyword,
      originalIndustry: industry 
    });
  } else if (industry) {
    console.log(`🎯 [LayoutIntelligence] No local match for: "${industry}"`);
  }
  
  // Detect SaaS/B2B
  const saasKeywords = ['saas', 'software', 'platform', 'app', 'tool', 'solution', 'cloud', 'api', 'automation', 'analytics'];
  const isSaaS = saasKeywords.some(k => industryLower.includes(k));
  
  // Detect consulting/professional services
  const consultingKeywords = ['consult', 'coach', 'advisor', 'strategy', 'agency', 'firm'];
  const isConsulting = consultingKeywords.some(k => industryLower.includes(k));
  
  if (isLocal) {
    return {
      pageStructure: [
        { section: 'Hero', guidance: 'Lead with local trust and availability' },
        { section: 'Benefits', guidance: 'Focus on outcomes for homeowners' },
        { section: 'Testimonials', guidance: 'Local customer stories with names' },
        { section: 'Gallery', guidance: 'Show real work examples' },
        { section: 'Service Area', guidance: 'Highlight your local presence' },
        { section: 'CTA', guidance: 'Phone number prominently displayed' },
      ],
      layoutIntelligence: {
        archetypeName: 'Local Service',
        confidence: 0.85,
        heroStyle: 'problem-first',
        ctaStyle: 'phone',
        trustPriorities: ['review-count', 'star-rating', 'years-experience', 'local-presence'],
        ctaText: { primary: ['Call Now', 'Get Free Quote'], secondary: ['Schedule Service'] },
        reasoning: 'Detected local service business based on industry keywords',
      },
    };
  }
  
  if (isSaaS) {
    return {
      pageStructure: [
        { section: 'Hero', guidance: 'Lead with transformation, not features' },
        { section: 'Social Proof', guidance: 'Logo bar of recognizable customers' },
        { section: 'Features', guidance: 'Highlight key capabilities' },
        { section: 'Case Studies', guidance: 'Detailed transformation stories' },
        { section: 'Pricing', guidance: 'Clear tier comparison' },
        { section: 'FAQ', guidance: 'Address remaining objections' },
        { section: 'CTA', guidance: 'Start free trial or request demo' },
      ],
      layoutIntelligence: {
        archetypeName: 'SaaS B2B',
        confidence: 0.85,
        heroStyle: 'bold-statement',
        ctaStyle: 'button',
        trustPriorities: ['customer-logos', 'case-studies', 'security-badges', 'integrations'],
        ctaText: { primary: ['Start Free Trial', 'Get a Demo'], secondary: ['See Pricing'] },
        reasoning: 'Detected SaaS/software business based on industry keywords',
      },
    };
  }
  
  if (isConsulting) {
    return {
      pageStructure: [
        { section: 'Hero', guidance: 'Lead with client outcomes' },
        { section: 'Problem', guidance: 'Articulate the pain they\'re experiencing' },
        { section: 'Solution', guidance: 'Your approach and methodology' },
        { section: 'Proof', guidance: 'Results, testimonials, credentials' },
        { section: 'Process', guidance: 'How you work together' },
        { section: 'CTA', guidance: 'Book a strategy call' },
      ],
      layoutIntelligence: {
        archetypeName: 'Professional Services',
        confidence: 0.80,
        heroStyle: 'problem-first',
        ctaStyle: 'calendar',
        trustPriorities: ['credentials', 'client-results', 'testimonials', 'methodology'],
        ctaText: { primary: ['Book Strategy Call', 'Schedule Consultation'], secondary: ['Download Guide'] },
        reasoning: 'Detected consulting/professional services business',
      },
    };
  }
  
  // Default
  return {
    pageStructure: [
      { section: 'Hero', guidance: 'Lead with transformation, not features' },
      { section: 'Problem', guidance: 'Articulate the pain they\'re experiencing' },
      { section: 'Solution', guidance: 'Your approach and methodology' },
      { section: 'Proof', guidance: 'Credentials, results, testimonials' },
      { section: 'CTA', guidance: 'Clear next step with urgency' },
    ],
    layoutIntelligence: {
      archetypeName: 'Default',
      confidence: 0.50,
      heroStyle: 'bold-statement',
      ctaStyle: 'button',
      reasoning: 'Using default layout - no specific industry detected',
    },
  };
}
