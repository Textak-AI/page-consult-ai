/**
 * BUYER AWARENESS DETECTION
 * 
 * Based on Eugene Schwartz's 5 levels of awareness.
 * Determines page structure and CTA strategy.
 */

export type AwarenessLevel = 'unaware' | 'problemAware' | 'solutionAware' | 'productAware' | 'mostAware';

export type PageStructure = {
  sections: string[];
  heroStyle: 'story' | 'problem' | 'mechanism' | 'product' | 'offer';
  ctaStrategy: 'content-first' | 'discovery' | 'demo' | 'trial' | 'transaction';
  proofPlacement: 'late' | 'mid' | 'early' | 'prominent';
  reasoning: string;
};

// Awareness detection patterns
const AWARENESS_SIGNALS: Record<AwarenessLevel, string[]> = {
  unaware: [
    'not sure if we need',
    'exploring options',
    'what does .* mean',
    'never heard of',
    'just curious',
    'learning about'
  ],
  problemAware: [
    'struggling with',
    'pain point',
    'biggest challenge',
    'keeps us up',
    'frustrated by',
    'problem is',
    'issue with',
    'can\'t seem to',
    'failing to'
  ],
  solutionAware: [
    'looking for a solution',
    'comparing options',
    'what makes you different',
    'vs competitors',
    'alternatives',
    'which solution',
    'evaluating'
  ],
  productAware: [
    'heard about you',
    'saw your demo',
    'colleague recommended',
    'read your case study',
    'found you on',
    'been following'
  ],
  mostAware: [
    'ready to start',
    'what\'s the pricing',
    'when can we begin',
    'sign up',
    'get started',
    'pricing page',
    'how much'
  ]
};

// Page structures by awareness level
const PAGE_STRUCTURES: Record<AwarenessLevel, PageStructure> = {
  unaware: {
    sections: [
      'hero-story',
      'problem-agitation',
      'social-proof-soft',
      'solution-intro',
      'features-light',
      'cta-content',
      'cta-demo-secondary'
    ],
    heroStyle: 'story',
    ctaStrategy: 'content-first',
    proofPlacement: 'late',
    reasoning: 'Unaware visitors need education before selling. Lead with story, defer product.'
  },
  problemAware: {
    sections: [
      'hero-problem',
      'credibility-bar',
      'stakes-amplify',
      'solution-bridge',
      'proof-before-after',
      'features-benefits',
      'testimonial',
      'faq-objections',
      'cta-discovery',
      'cta-demo-primary'
    ],
    heroStyle: 'problem',
    ctaStrategy: 'discovery',
    proofPlacement: 'mid',
    reasoning: 'Problem-aware visitors need validation of their pain, then a bridge to solution.'
  },
  solutionAware: {
    sections: [
      'hero-mechanism',
      'credibility-bar',
      'old-vs-new',
      'differentiators',
      'proof-quantified',
      'features-comparison',
      'case-study',
      'faq-criteria',
      'cta-demo-primary'
    ],
    heroStyle: 'mechanism',
    ctaStrategy: 'demo',
    proofPlacement: 'mid',
    reasoning: 'Solution-aware visitors are comparing. Show your unique mechanism and proof.'
  },
  productAware: {
    sections: [
      'hero-product',
      'proof-heavy',
      'features-deep',
      'case-studies',
      'testimonials-detailed',
      'pricing-preview',
      'faq-objections',
      'cta-trial-primary',
      'cta-demo-secondary'
    ],
    heroStyle: 'product',
    ctaStrategy: 'trial',
    proofPlacement: 'early',
    reasoning: 'Product-aware visitors know you. Heavy proof and clear path to trial.'
  },
  mostAware: {
    sections: [
      'hero-offer',
      'risk-reversal',
      'proof-minimal',
      'trust-badges',
      'cta-transaction'
    ],
    heroStyle: 'offer',
    ctaStrategy: 'transaction',
    proofPlacement: 'prominent',
    reasoning: 'Most-aware visitors are ready. Remove friction, present offer clearly.'
  }
};

export function detectAwarenessLevel(conversationText: string): AwarenessLevel {
  const text = conversationText.toLowerCase();
  const scores: Record<AwarenessLevel, number> = {
    unaware: 0,
    problemAware: 0,
    solutionAware: 0,
    productAware: 0,
    mostAware: 0
  };

  for (const [level, patterns] of Object.entries(AWARENESS_SIGNALS)) {
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const matches = text.match(regex);
      if (matches) {
        scores[level as AwarenessLevel] += matches.length;
      }
    }
  }

  // Default heuristic: if they're doing a demo consultation, they're at least problem-aware
  // Most PageConsult users are problem-aware or solution-aware
  if (Object.values(scores).every(s => s === 0)) {
    console.log('🎨 [SDI] Awareness: defaulting to problemAware (demo context)');
    return 'problemAware';
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const detected = sorted[0][0] as AwarenessLevel;
  
  console.log('🎨 [SDI] Awareness level detected:', detected, scores);
  return detected;
}

export function getPageStructure(awareness: AwarenessLevel): PageStructure {
  return PAGE_STRUCTURES[awareness];
}
