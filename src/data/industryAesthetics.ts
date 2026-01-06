// Industry Aesthetic Definitions
// Used for intelligent design mode selection and hybrid blending

export interface IndustryPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
}

export interface IndustryTypography {
  headingStyle: 'bold' | 'elegant' | 'technical' | 'friendly';
  bodyTone: 'formal' | 'conversational' | 'authoritative' | 'warm';
  recommended: string;
}

export interface IndustryImagery {
  style: string;
  subjects: string[];
  avoid: string[];
  stockKeywords: string[];
}

export interface IndustryTone {
  voice: string;
  keywords: string[];
  avoid: string[];
}

export interface IndustryTrustSignals {
  certifications: string[];
  proofTypes: string[];
  socialProof: string;
}

export interface IndustryLayout {
  density: 'spacious' | 'balanced' | 'compact';
  heroStyle: 'bold-statement' | 'problem-solution' | 'outcome-focused' | 'demo-forward';
  ctaStyle: 'urgent' | 'consultative' | 'value-first' | 'low-pressure';
}

export interface IndustryAesthetic {
  id: string;
  label: string;
  palette: IndustryPalette;
  typography: IndustryTypography;
  imagery: IndustryImagery;
  tone: IndustryTone;
  trustSignals: IndustryTrustSignals;
  layout: IndustryLayout;
}

export interface AestheticModeExpanded {
  primary: string;
  secondary: string | null;
  blend: 'pure' | 'hybrid';
  rationale: string;
  aesthetic: IndustryAesthetic | null;
}

// ===========================================
// INDUSTRY DEFINITIONS
// ===========================================

export const INDUSTRY_AESTHETICS: Record<string, IndustryAesthetic> = {
  
  healthcare: {
    id: 'healthcare',
    label: 'Healthcare',
    palette: {
      primary: '#0891B2',
      secondary: '#14B8A6',
      accent: '#0D9488',
      background: '#F0FDFA',
      surface: '#FFFFFF',
      text: '#134E4A',
      muted: '#5EEAD4',
    },
    typography: {
      headingStyle: 'friendly',
      bodyTone: 'warm',
      recommended: 'Inter + Source Sans Pro',
    },
    imagery: {
      style: 'Warm, human-centered photography with natural lighting',
      subjects: ['Healthcare professionals', 'Patient interactions', 'Modern facilities', 'Care technology'],
      avoid: ['Stock-feeling poses', 'Outdated equipment', 'Sterile environments', 'Distressed patients'],
      stockKeywords: ['healthcare team', 'medical professional', 'modern hospital', 'telehealth'],
    },
    tone: {
      voice: 'Trustworthy, empathetic, outcome-focused',
      keywords: ['patient outcomes', 'compliance', 'care quality', 'HIPAA', 'secure', 'proven'],
      avoid: ['disruption', 'aggressive growth', 'crush competition'],
    },
    trustSignals: {
      certifications: ['HIPAA Compliant', 'SOC 2 Type II', 'HITRUST'],
      proofTypes: ['Patient outcomes', 'Time savings', 'Compliance results'],
      socialProof: 'Institutional credibility and peer recommendations',
    },
    layout: {
      density: 'spacious',
      heroStyle: 'outcome-focused',
      ctaStyle: 'consultative',
    },
  },

  cybersecurity: {
    id: 'cybersecurity',
    label: 'Cybersecurity',
    palette: {
      primary: '#1E293B',
      secondary: '#3B82F6',
      accent: '#10B981',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F1F5F9',
      muted: '#64748B',
    },
    typography: {
      headingStyle: 'technical',
      bodyTone: 'authoritative',
      recommended: 'JetBrains Mono + Inter',
    },
    imagery: {
      style: 'Dark, sophisticated, abstract tech visualization',
      subjects: ['Network diagrams', 'Shield metaphors', 'SOC environments', 'Data flows'],
      avoid: ['Hooded hackers', 'Matrix code', 'Padlock clip art', 'Fear imagery'],
      stockKeywords: ['cybersecurity dashboard', 'network security', 'data protection'],
    },
    tone: {
      voice: 'Authoritative, precise, vigilant',
      keywords: ['protect', 'detect', 'respond', 'compliance', 'zero-trust', 'resilience'],
      avoid: ['unhackable', '100% secure', 'guaranteed', 'military-grade'],
    },
    trustSignals: {
      certifications: ['SOC 2 Type II', 'ISO 27001', 'FedRAMP'],
      proofTypes: ['Threat detection metrics', 'Response times', 'Compliance rates'],
      socialProof: 'Peer validation from security leaders',
    },
    layout: {
      density: 'balanced',
      heroStyle: 'problem-solution',
      ctaStyle: 'consultative',
    },
  },

  manufacturing: {
    id: 'manufacturing',
    label: 'Manufacturing',
    palette: {
      primary: '#1E3A5F',
      secondary: '#F59E0B',
      accent: '#EA580C',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1E293B',
      muted: '#64748B',
    },
    typography: {
      headingStyle: 'bold',
      bodyTone: 'formal',
      recommended: 'Roboto + Open Sans',
    },
    imagery: {
      style: 'Clean, modern industrial photography',
      subjects: ['Modern facilities', 'Precision equipment', 'Quality control', 'Engineers at work'],
      avoid: ['Dirty factories', 'Empty facilities', 'Generic gears'],
      stockKeywords: ['modern manufacturing', 'factory automation', 'industrial IoT'],
    },
    tone: {
      voice: 'Practical, results-driven, efficiency-focused',
      keywords: ['efficiency', 'uptime', 'yield', 'throughput', 'ROI', 'lean'],
      avoid: ['revolutionary', 'transform', 'synergy'],
    },
    trustSignals: {
      certifications: ['ISO 9001', 'ISO 14001', 'AS9100'],
      proofTypes: ['ROI calculations', 'Efficiency gains', 'Downtime reduction'],
      socialProof: 'Case studies with specific metrics',
    },
    layout: {
      density: 'balanced',
      heroStyle: 'outcome-focused',
      ctaStyle: 'value-first',
    },
  },

  legal: {
    id: 'legal',
    label: 'Legal',
    palette: {
      primary: '#1E3A5F',
      secondary: '#7C3AED',
      accent: '#2563EB',
      background: '#FAFAFA',
      surface: '#FFFFFF',
      text: '#1E293B',
      muted: '#6B7280',
    },
    typography: {
      headingStyle: 'elegant',
      bodyTone: 'formal',
      recommended: 'Playfair Display + Source Serif Pro',
    },
    imagery: {
      style: 'Sophisticated, professional, understated',
      subjects: ['Professional settings', 'Confident attorneys', 'Modern offices'],
      avoid: ['Gavels overused', 'Scales of justice cliché', 'Stuffy libraries'],
      stockKeywords: ['attorney professional', 'law firm modern', 'corporate counsel'],
    },
    tone: {
      voice: 'Authoritative, precise, confident',
      keywords: ['protect', 'advocate', 'strategic', 'results', 'counsel'],
      avoid: ['aggressive', 'destroy', 'crush', 'fighter'],
    },
    trustSignals: {
      certifications: ['Bar admissions', 'Super Lawyers', 'Chambers ranked'],
      proofTypes: ['Case results', 'Years experience', 'Notable matters'],
      socialProof: 'Peer recognition and discreet references',
    },
    layout: {
      density: 'spacious',
      heroStyle: 'bold-statement',
      ctaStyle: 'consultative',
    },
  },

  saas: {
    id: 'saas',
    label: 'SaaS',
    palette: {
      primary: '#7C3AED',
      secondary: '#3B82F6',
      accent: '#06B6D4',
      background: '#FAFAFA',
      surface: '#FFFFFF',
      text: '#1E293B',
      muted: '#64748B',
    },
    typography: {
      headingStyle: 'bold',
      bodyTone: 'conversational',
      recommended: 'Inter + System fonts',
    },
    imagery: {
      style: 'Clean product screenshots, abstract gradients',
      subjects: ['Product UI', 'Happy users', 'Team collaboration'],
      avoid: ['Generic stock business', 'Outdated UI'],
      stockKeywords: ['saas dashboard', 'team collaboration', 'product interface'],
    },
    tone: {
      voice: 'Clear, helpful, approachable',
      keywords: ['simple', 'powerful', 'automate', 'integrate', 'scale'],
      avoid: ['synergy', 'leverage', 'utilize', 'solutions'],
    },
    trustSignals: {
      certifications: ['SOC 2', 'GDPR Compliant', 'G2 Leader'],
      proofTypes: ['Customer count', 'Usage metrics', 'Time saved'],
      socialProof: 'Logo bars, G2 reviews, customer quotes',
    },
    layout: {
      density: 'balanced',
      heroStyle: 'demo-forward',
      ctaStyle: 'low-pressure',
    },
  },

  financial: {
    id: 'financial',
    label: 'Financial Services',
    palette: {
      primary: '#1E3A5F',
      secondary: '#059669',
      accent: '#0D9488',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1E293B',
      muted: '#64748B',
    },
    typography: {
      headingStyle: 'elegant',
      bodyTone: 'authoritative',
      recommended: 'Merriweather + Open Sans',
    },
    imagery: {
      style: 'Sophisticated, trustworthy, growth-oriented',
      subjects: ['Professional advisors', 'Client meetings', 'Life moments'],
      avoid: ['Piles of cash', 'Gold bars', 'Wall Street clichés'],
      stockKeywords: ['financial advisor', 'wealth planning', 'investment professional'],
    },
    tone: {
      voice: 'Trustworthy, knowledgeable, reassuring',
      keywords: ['growth', 'security', 'planning', 'wealth', 'protect', 'legacy'],
      avoid: ['get rich', 'guaranteed returns', 'secrets'],
    },
    trustSignals: {
      certifications: ['CFP', 'CFA', 'Series 65/66', 'Fiduciary'],
      proofTypes: ['AUM', 'Years in business', 'Client retention'],
      socialProof: 'Long-term client relationships',
    },
    layout: {
      density: 'spacious',
      heroStyle: 'outcome-focused',
      ctaStyle: 'consultative',
    },
  },

  consulting: {
    id: 'consulting',
    label: 'Consulting',
    palette: {
      primary: '#1E293B',
      secondary: '#7C3AED',
      accent: '#3B82F6',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#1E293B',
      muted: '#64748B',
    },
    typography: {
      headingStyle: 'elegant',
      bodyTone: 'authoritative',
      recommended: 'DM Sans + Inter',
    },
    imagery: {
      style: 'Confident expertise, strategic thinking',
      subjects: ['Strategy sessions', 'Executive presence', 'Data visualization'],
      avoid: ['Generic handshakes', 'Pointing at screens'],
      stockKeywords: ['management consultant', 'strategy meeting', 'executive advisory'],
    },
    tone: {
      voice: 'Confident, strategic, results-oriented',
      keywords: ['transform', 'optimize', 'strategy', 'insight', 'results'],
      avoid: ['synergy', 'leverage', 'circle back'],
    },
    trustSignals: {
      certifications: ['Big 4 alumni', 'Industry certifications'],
      proofTypes: ['Client results', 'Transformation metrics'],
      socialProof: 'Named client case studies',
    },
    layout: {
      density: 'spacious',
      heroStyle: 'bold-statement',
      ctaStyle: 'consultative',
    },
  },

  realestate: {
    id: 'realestate',
    label: 'Real Estate',
    palette: {
      primary: '#1E3A5F',
      secondary: '#B8860B',
      accent: '#059669',
      background: '#FAFAFA',
      surface: '#FFFFFF',
      text: '#1E293B',
      muted: '#6B7280',
    },
    typography: {
      headingStyle: 'elegant',
      bodyTone: 'warm',
      recommended: 'Cormorant Garamond + Lato',
    },
    imagery: {
      style: 'Aspirational, lifestyle-focused',
      subjects: ['Beautiful properties', 'Happy families', 'Neighborhood life'],
      avoid: ['Empty houses', 'For sale signs only'],
      stockKeywords: ['home buying', 'real estate agent', 'modern home'],
    },
    tone: {
      voice: 'Trustworthy, knowledgeable, invested',
      keywords: ['home', 'investment', 'neighborhood', 'market insight', 'guide'],
      avoid: ['deal', 'steal', 'flip'],
    },
    trustSignals: {
      certifications: ['Realtor®', 'Broker license', 'Zillow Premier'],
      proofTypes: ['Homes sold', 'Days on market', 'Above-asking results'],
      socialProof: 'Recent success stories',
    },
    layout: {
      density: 'spacious',
      heroStyle: 'outcome-focused',
      ctaStyle: 'low-pressure',
    },
  },

  fitness: {
    id: 'fitness',
    label: 'Fitness & Wellness',
    palette: {
      primary: '#059669',
      secondary: '#7C3AED',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F0FDF4',
      text: '#1E293B',
      muted: '#64748B',
    },
    typography: {
      headingStyle: 'bold',
      bodyTone: 'conversational',
      recommended: 'Montserrat + Open Sans',
    },
    imagery: {
      style: 'Authentic, diverse, action-oriented',
      subjects: ['Real people working out', 'Transformation journeys', 'Community'],
      avoid: ['Intimidating physiques', 'Overly posed models'],
      stockKeywords: ['inclusive fitness', 'workout community', 'wellness lifestyle'],
    },
    tone: {
      voice: 'Motivating, supportive, authentic',
      keywords: ['transform', 'strong', 'energy', 'community', 'results'],
      avoid: ['shred', 'beast mode', 'no excuses'],
    },
    trustSignals: {
      certifications: ['NASM', 'ACE', 'ISSA', 'Precision Nutrition'],
      proofTypes: ['Client transformations', 'Community size', 'Retention'],
      socialProof: 'Before/after, video testimonials',
    },
    layout: {
      density: 'balanced',
      heroStyle: 'outcome-focused',
      ctaStyle: 'urgent',
    },
  },

  ecommerce: {
    id: 'ecommerce',
    label: 'E-commerce',
    palette: {
      primary: '#7C3AED',
      secondary: '#EC4899',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#FAFAFA',
      text: '#1E293B',
      muted: '#64748B',
    },
    typography: {
      headingStyle: 'bold',
      bodyTone: 'conversational',
      recommended: 'Poppins + System fonts',
    },
    imagery: {
      style: 'Product-forward, lifestyle context',
      subjects: ['Products in use', 'Lifestyle context', 'Unboxing', 'Happy customers'],
      avoid: ['White background only', 'No context'],
      stockKeywords: ['product lifestyle', 'ecommerce unboxing', 'brand experience'],
    },
    tone: {
      voice: 'Friendly, exciting, value-conscious',
      keywords: ['discover', 'love', 'quality', 'value', 'free shipping'],
      avoid: ['cheap', 'discount bin'],
    },
    trustSignals: {
      certifications: ['Shopify Plus', 'Google Trusted Store'],
      proofTypes: ['Reviews count', 'Star ratings', 'Orders shipped'],
      socialProof: 'User-generated content, review highlights',
    },
    layout: {
      density: 'compact',
      heroStyle: 'demo-forward',
      ctaStyle: 'urgent',
    },
  },

  education: {
    id: 'education',
    label: 'Education & Coaching',
    palette: {
      primary: '#2563EB',
      secondary: '#7C3AED',
      accent: '#059669',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1E293B',
      muted: '#64748B',
    },
    typography: {
      headingStyle: 'friendly',
      bodyTone: 'warm',
      recommended: 'Nunito + Open Sans',
    },
    imagery: {
      style: 'Aspirational outcomes, learning moments',
      subjects: ['Learning in action', 'Aha moments', 'Mentor connection', 'Transformation'],
      avoid: ['Bored classrooms', 'Guru on mountaintop'],
      stockKeywords: ['online learning', 'coaching session', 'skill development'],
    },
    tone: {
      voice: 'Encouraging, expert, transformative',
      keywords: ['learn', 'grow', 'master', 'transform', 'unlock', 'potential'],
      avoid: ['secrets', 'guaranteed', 'overnight success'],
    },
    trustSignals: {
      certifications: ['ICF Certified', 'Course credentials', 'Published author'],
      proofTypes: ['Student outcomes', 'Completion rates', 'Career placements'],
      socialProof: 'Student success stories',
    },
    layout: {
      density: 'balanced',
      heroStyle: 'outcome-focused',
      ctaStyle: 'value-first',
    },
  },

  insurance: {
    id: 'insurance',
    label: 'Insurance',
    palette: {
      primary: '#1E3A5F',
      secondary: '#0891B2',
      accent: '#059669',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1E293B',
      muted: '#64748B',
    },
    typography: {
      headingStyle: 'elegant',
      bodyTone: 'warm',
      recommended: 'Source Sans Pro + Open Sans',
    },
    imagery: {
      style: 'Protective, family-oriented, reassuring',
      subjects: ['Families', 'Life milestones', 'Peace of mind moments'],
      avoid: ['Disaster imagery', 'Fear-based visuals'],
      stockKeywords: ['family protection', 'insurance advisor', 'life insurance'],
    },
    tone: {
      voice: 'Protective, reassuring, knowledgeable',
      keywords: ['protect', 'secure', 'peace of mind', 'coverage', 'partner'],
      avoid: ['cheap', 'risk', 'disaster'],
    },
    trustSignals: {
      certifications: ['Licensed', 'A-rated carriers', 'BBB Accredited'],
      proofTypes: ['Claims paid', 'Years serving', 'Customer retention'],
      socialProof: 'Multi-generational client stories',
    },
    layout: {
      density: 'spacious',
      heroStyle: 'outcome-focused',
      ctaStyle: 'consultative',
    },
  },
};

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Get aesthetic for a single industry
 */
export const getIndustryAesthetic = (industry: string): IndustryAesthetic | null => {
  const key = industry.toLowerCase().replace(/[^a-z]/g, '');
  return INDUSTRY_AESTHETICS[key] || null;
};

/**
 * Blend two industry aesthetics for hybrid design mode
 * Primary = target market (drives main design)
 * Secondary = provider industry (adds credibility)
 */
export const blendAesthetics = (
  primaryIndustry: string,
  secondaryIndustry: string
): IndustryAesthetic => {
  const p = getIndustryAesthetic(primaryIndustry) || INDUSTRY_AESTHETICS.consulting;
  const s = getIndustryAesthetic(secondaryIndustry) || INDUSTRY_AESTHETICS.consulting;

  return {
    id: `${p.id}-${s.id}-hybrid`,
    label: `${p.label} + ${s.label}`,

    // Primary drives palette, secondary adds accent
    palette: {
      ...p.palette,
      accent: s.palette.secondary,
    },

    // Primary typography, elevate to authoritative if secondary is
    typography: {
      ...p.typography,
      bodyTone: s.typography.bodyTone === 'authoritative' ? 'authoritative' : p.typography.bodyTone,
    },

    // Blend imagery
    imagery: {
      style: `${p.imagery.style} with ${s.label.toLowerCase()} credibility elements`,
      subjects: [...p.imagery.subjects.slice(0, 3), ...s.imagery.subjects.slice(0, 1)],
      avoid: [...new Set([...p.imagery.avoid, ...s.imagery.avoid])],
      stockKeywords: [...p.imagery.stockKeywords.slice(0, 2), ...s.imagery.stockKeywords.slice(0, 2)],
    },

    // Blend tones
    tone: {
      voice: `${p.tone.voice} with ${s.tone.voice.split(',')[0].trim()} credibility`,
      keywords: [...new Set([...p.tone.keywords, ...s.tone.keywords.slice(0, 3)])],
      avoid: [...new Set([...p.tone.avoid, ...s.tone.avoid])],
    },

    // Combine trust signals (secondary first for credibility)
    trustSignals: {
      certifications: [...s.trustSignals.certifications.slice(0, 2), ...p.trustSignals.certifications.slice(0, 2)],
      proofTypes: [...p.trustSignals.proofTypes.slice(0, 2), ...s.trustSignals.proofTypes.slice(0, 2)],
      socialProof: `${p.trustSignals.socialProof} with ${s.trustSignals.socialProof.toLowerCase()}`,
    },

    // Primary layout
    layout: p.layout,
  };
};

/**
 * Calculate the aesthetic mode based on provider and target
 */
export const calculateExpandedAestheticMode = (
  providerIndustry: string | null,
  targetMarket: string | null
): AestheticModeExpanded => {
  // No industries detected
  if (!providerIndustry && !targetMarket) {
    return {
      primary: 'general',
      secondary: null,
      blend: 'pure',
      rationale: 'Design mode will be determined as we learn more',
      aesthetic: null,
    };
  }

  // Only provider, no different target
  if (!targetMarket || targetMarket.toLowerCase() === providerIndustry?.toLowerCase()) {
    const aesthetic = getIndustryAesthetic(providerIndustry || '');
    return {
      primary: providerIndustry || 'general',
      secondary: null,
      blend: 'pure',
      rationale: `Designed for ${providerIndustry || 'your'} industry`,
      aesthetic,
    };
  }

  // Hybrid: different target market
  const aesthetic = blendAesthetics(targetMarket, providerIndustry || 'consulting');
  return {
    primary: targetMarket,
    secondary: providerIndustry,
    blend: 'hybrid',
    rationale: `Designed for ${targetMarket} buyers with ${providerIndustry} credibility`,
    aesthetic,
  };
};

/**
 * Get list of all supported industries
 */
export const getSupportedIndustries = (): string[] => {
  return Object.values(INDUSTRY_AESTHETICS).map(a => a.label);
};

/**
 * Get all industry IDs
 */
export const getSupportedIndustryIds = (): string[] => {
  return Object.keys(INDUSTRY_AESTHETICS);
};
