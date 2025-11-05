// Industry-specific intelligence patterns for content generation

export interface IndustryPattern {
  keywords: string[];
  tone: 'formal' | 'friendly' | 'emotional' | 'professional' | 'energetic';
  audienceType: 'B2B' | 'B2C' | 'Both';
  defaultFeatures: string[];
  headlinePatterns: string[];
  ctaPatterns: string[];
  problemFraming: string[];
  credentialTypes: string[];
}

export const INDUSTRY_PATTERNS: Record<string, IndustryPattern> = {
  'wedding_dj': {
    keywords: ['wedding', 'dj', 'reception', 'celebration', 'event'],
    tone: 'emotional',
    audienceType: 'B2C',
    defaultFeatures: [
      'Professional Sound Equipment',
      'Extensive Music Library',
      'MC Services Included',
      'Wireless Microphones',
      'Backup Equipment',
      'Reception Timeline Management'
    ],
    headlinePatterns: [
      'Your Perfect Wedding DJ',
      'Make Your Wedding Unforgettable',
      'The Soundtrack to Your Perfect Day',
      '[X] Years of 5-Star Celebrations'
    ],
    ctaPatterns: [
      'Get Your Free Quote',
      'Check Availability',
      'Book Your Date',
      'Schedule Consultation'
    ],
    problemFraming: [
      "Finding the perfect wedding DJ shouldn't be stressful or expensive.",
      'Your wedding reception deserves flawless entertainment.',
      "Don't risk your special day with an inexperienced DJ."
    ],
    credentialTypes: ['years experience', 'weddings performed', 'star rating', 'reviews']
  },
  
  'b2b_saas': {
    keywords: ['saas', 'software', 'platform', 'tool', 'solution', 'crm', 'analytics'],
    tone: 'professional',
    audienceType: 'B2B',
    defaultFeatures: [
      'Quick Setup (Under 5 Minutes)',
      'Real-Time Analytics Dashboard',
      'Enterprise-Grade Security',
      'Seamless Integrations',
      'Automated Workflows',
      '24/7 Expert Support'
    ],
    headlinePatterns: [
      'Finally, [Solution] That Actually Works',
      'Stop Wasting Time on [Problem]',
      'The [Solution] Built for [Audience]',
      '[Audience] Trust Us to [Benefit]'
    ],
    ctaPatterns: [
      'Start Free Trial',
      'Get Demo',
      'See It in Action',
      'Try It Free'
    ],
    problemFraming: [
      'Your team is wasting hours on [problem] every week.',
      "Traditional [tools] can't keep up with modern [audience] needs.",
      'Manual [process] is killing your productivity.'
    ],
    credentialTypes: ['customers', 'companies using', 'time saved', 'roi improvement']
  },
  
  'legal_services': {
    keywords: ['legal', 'lawyer', 'attorney', 'law', 'firm'],
    tone: 'formal',
    audienceType: 'B2C',
    defaultFeatures: [
      'Free Initial Consultation',
      'Experienced Trial Attorneys',
      'Proven Case Results',
      'No Win, No Fee Options',
      'Responsive Communication',
      'Personalized Strategy'
    ],
    headlinePatterns: [
      'Expert Legal Help When You Need It Most',
      'Protecting Your Rights for [X] Years',
      'Experienced [Type] Attorneys',
      'Get the Legal Help You Deserve'
    ],
    ctaPatterns: [
      'Get Free Consultation',
      'Discuss Your Case',
      'Speak to an Attorney',
      'Get Legal Help Now'
    ],
    problemFraming: [
      'Legal problems are stressful and complicated.',
      'You need an attorney who will fight for your rights.',
      "Don't face the legal system alone."
    ],
    credentialTypes: ['years practice', 'cases won', 'settlements', 'awards']
  },
  
  'home_services': {
    keywords: ['home', 'repair', 'renovation', 'plumbing', 'electrical', 'hvac', 'contractor'],
    tone: 'friendly',
    audienceType: 'B2C',
    defaultFeatures: [
      'Licensed & Insured',
      'Upfront Pricing',
      'Same-Day Service Available',
      'Satisfaction Guarantee',
      'Local & Family-Owned',
      'Quality Workmanship'
    ],
    headlinePatterns: [
      'Trusted [Service] in [Location]',
      'Your Local [Service] Experts',
      '[X] Years Serving [Location]',
      'Professional [Service] You Can Trust'
    ],
    ctaPatterns: [
      'Get Free Quote',
      'Schedule Service',
      'Call Now',
      'Request Estimate'
    ],
    problemFraming: [
      "Finding a reliable [service] professional shouldn't be difficult.",
      'Your home deserves quality work from licensed professionals.',
      "Don't risk your property with inexperienced contractors."
    ],
    credentialTypes: ['years serving', 'jobs completed', 'star rating', 'reviews']
  },
  
  'healthcare': {
    keywords: ['medical', 'health', 'clinic', 'doctor', 'therapy', 'wellness'],
    tone: 'professional',
    audienceType: 'B2C',
    defaultFeatures: [
      'Accepting New Patients',
      'Most Insurance Accepted',
      'Evening & Weekend Hours',
      'Board-Certified Providers',
      'Comprehensive Care',
      'Same-Week Appointments'
    ],
    headlinePatterns: [
      'Compassionate [Service] Care',
      'Your Health, Our Priority',
      'Expert [Service] When You Need It',
      'Quality Healthcare Close to Home'
    ],
    ctaPatterns: [
      'Book Appointment',
      'Schedule Consultation',
      'Become a Patient',
      'Call to Schedule'
    ],
    problemFraming: [
      'You deserve healthcare that puts you first.',
      "Finding quality medical care shouldn't be complicated.",
      'Your health is too important to wait.'
    ],
    credentialTypes: ['years practice', 'patients served', 'certifications', 'specialties']
  },
  
  'consulting': {
    keywords: ['consulting', 'consultant', 'advisory', 'strategy', 'coach'],
    tone: 'professional',
    audienceType: 'B2B',
    defaultFeatures: [
      'Customized Strategy',
      'Proven Methodologies',
      'Industry Expertise',
      'Measurable Results',
      'Flexible Engagement',
      'C-Suite Experience'
    ],
    headlinePatterns: [
      'Strategic [Service] That Drives Growth',
      'Expert [Service] for [Audience]',
      'Transform Your [Area] with Expert Guidance',
      '[X] Years Helping [Audience] Succeed'
    ],
    ctaPatterns: [
      'Schedule Discovery Call',
      'Get Strategic Assessment',
      'Discuss Your Goals',
      'Book Consultation'
    ],
    problemFraming: [
      'Your [audience] deserves expert guidance to reach goals.',
      'Stop struggling with [problem] - get expert help.',
      'Strategic consulting accelerates your success.'
    ],
    credentialTypes: ['clients served', 'industries', 'avg roi', 'years experience']
  },
  
  'ecommerce': {
    keywords: ['shop', 'store', 'retail', 'products', 'buy', 'sell'],
    tone: 'energetic',
    audienceType: 'B2C',
    defaultFeatures: [
      'Free Shipping on Orders $50+',
      'Easy Returns & Exchanges',
      'Secure Checkout',
      'Quality Guarantee',
      'Fast Shipping',
      'Customer Reviews'
    ],
    headlinePatterns: [
      "Shop [Product] You'll Love",
      'Quality [Products] at Great Prices',
      'Your Favorite [Products], Delivered',
      'Shop Smart, Save More'
    ],
    ctaPatterns: [
      'Shop Now',
      'Browse Collection',
      'Start Shopping',
      'View Products'
    ],
    problemFraming: [
      "Finding quality [products] at fair prices shouldn't be hard.",
      'You deserve products that exceed expectations.',
      'Shopping should be easy, fast, and affordable.'
    ],
    credentialTypes: ['customers', 'products sold', 'star rating', 'reviews']
  }
};

// Detect industry from consultation data
export function detectIndustry(consultation: {
  industry?: string;
  service_type?: string;
  target_audience?: string;
}): { key: string; pattern: IndustryPattern } {
  const searchText = `${consultation.industry} ${consultation.service_type} ${consultation.target_audience}`.toLowerCase();
  
  // Check each pattern for keyword matches
  for (const [key, pattern] of Object.entries(INDUSTRY_PATTERNS)) {
    const matchCount = pattern.keywords.filter(keyword => searchText.includes(keyword)).length;
    if (matchCount > 0) {
      return { key, pattern };
    }
  }
  
  // Default fallback
  return { 
    key: 'general', 
    pattern: {
      keywords: [],
      tone: 'professional',
      audienceType: 'Both',
      defaultFeatures: ['Quality Service', 'Expert Team', 'Proven Results', 'Customer Focus'],
      headlinePatterns: ['Professional [Service] You Can Trust'],
      ctaPatterns: ['Get Started'],
      problemFraming: ["Finding quality service shouldn't be difficult."],
      credentialTypes: ['experience', 'customers', 'results']
    }
  };
}

// Extract credentials from unique_value text
export function extractCredentials(uniqueValue: string): {
  years?: number;
  rating?: number;
  count?: number;
  countType?: string;
  certifications?: string[];
} {
  const creds: any = {};
  
  // Extract years
  const yearsMatch = uniqueValue.match(/(\d+)\+?\s*years?/i);
  if (yearsMatch) creds.years = parseInt(yearsMatch[1]);
  
  // Extract rating
  const ratingMatch = uniqueValue.match(/(\d+(?:\.\d+)?)\s*[-\s]?star/i);
  if (ratingMatch) creds.rating = parseFloat(ratingMatch[1]);
  
  // Extract counts
  const countPatterns = [
    { regex: /(\d+)\+?\s*(customer|client|project|wedding|job|case)/i, type: 'projects' },
    { regex: /(\d+)\s*(review|testimonial)/i, type: 'reviews' }
  ];
  
  for (const { regex, type } of countPatterns) {
    const match = uniqueValue.match(regex);
    if (match) {
      creds.count = parseInt(match[1]);
      creds.countType = type;
      break;
    }
  }
  
  // Extract certifications
  const certPatterns = /(certified|licensed|accredited|award[\w\s-]+)/gi;
  const certMatches = uniqueValue.match(certPatterns);
  if (certMatches) creds.certifications = certMatches;
  
  return creds;
}

// Transform raw answer to professional copy
export function transformAnswerToProfessionalCopy(
  rawText: string,
  context: 'headline' | 'feature' | 'description',
  industry: IndustryPattern
): string {
  if (!rawText) return '';
  
  // Remove filler words
  let transformed = rawText
    .replace(/^(I|We|Our|The|A|An)\s+/i, '')
    .replace(/^(have|has|offer|provide|do|does|make|create)\s+/i, '')
    .replace(/\s+(and|or|but|also|too|as well)\s+/g, ', ')
    .trim();
  
  // Capitalize first letter
  transformed = transformed.charAt(0).toUpperCase() + transformed.slice(1);
  
  // Add period if missing (for descriptions)
  if (context === 'description' && !transformed.endsWith('.')) {
    transformed += '.';
  }
  
  return transformed;
}

// Generate audience-appropriate language
export function getAudienceLanguage(audienceType: 'B2B' | 'B2C' | 'Both'): {
  pronoun: string;
  examples: string[];
} {
  if (audienceType === 'B2B') {
    return {
      pronoun: 'your team/your company',
      examples: [
        'Help your team save hours every week',
        'Drive measurable ROI for your company',
        'Enterprise-grade solutions for businesses'
      ]
    };
  } else {
    return {
      pronoun: 'you/your',
      examples: [
        'Save time and enjoy peace of mind',
        'You deserve quality service',
        'Make your special day unforgettable'
      ]
    };
  }
}
