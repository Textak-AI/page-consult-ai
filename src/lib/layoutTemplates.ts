/**
 * Layout Templates System
 * 
 * Defines reusable page layout templates that determine section order and composition.
 * Each template is tailored for specific industries and buyer journeys.
 * 
 * USAGE:
 * - SDI outputs layoutId based on industry + awareness level
 * - Section mapper uses the template to build sections in proper order
 * - New layouts require only configuration changes (no code changes)
 */

import type { IndustryVariant } from '@/lib/industryDesignSystem';

// =============================================================================
// SECTION TYPE DEFINITIONS
// =============================================================================

export type LayoutSectionType = 
  // Core sections
  | 'hero'
  | 'stats-bar'
  | 'problem-solution'
  | 'features'
  | 'how-it-works'
  | 'social-proof'
  | 'faq'
  | 'final-cta'
  // Consulting/Professional sections
  | 'credentials-bar'
  | 'the-real-challenge'
  | 'our-approach'
  | 'expertise-areas'
  | 'engagement-model'
  | 'client-results'
  // Healthcare sections
  | 'patient-journey'
  | 'treatment-options'
  | 'provider-credentials'
  // SaaS sections
  | 'product-demo'
  | 'integrations'
  | 'pricing-tiers'
  // Local services sections
  | 'service-area'
  | 'before-after'
  | 'emergency-cta'
  // E-commerce sections
  | 'product-showcase'
  | 'reviews-carousel'
  | 'trust-badges'
  // Beta/Pre-launch sections
  | 'beta-hero-teaser'
  | 'beta-perks'
  | 'waitlist-proof'
  | 'beta-final-cta';

// =============================================================================
// LAYOUT TEMPLATE INTERFACE
// =============================================================================

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  
  // Industries this template is designed for
  industries: IndustryVariant[];
  
  // Buyer awareness levels this template works best with
  awarenessLevels: ('unaware' | 'problem-aware' | 'solution-aware' | 'product-aware' | 'most-aware')[];
  
  // Section order - defines which sections appear and in what order
  sections: LayoutSectionType[];
  
  // Optional sections that can be added if proof exists
  conditionalSections?: {
    section: LayoutSectionType;
    condition: 'hasTestimonials' | 'hasStats' | 'hasProcess' | 'hasFAQ' | 'hasCredentials' | 'hasCaseStudies';
    insertAfter?: LayoutSectionType;
  }[];
  
  // Visual configuration hints
  visualStyle: {
    heroStyle: 'bold-statement' | 'problem-first' | 'social-proof-lead' | 'split-hero';
    proofDensity: 'minimal' | 'moderate' | 'comprehensive';
    ctaFrequency: 'hero-only' | 'hero-and-final' | 'every-section';
  };
  
  // Metadata
  priority: number; // Higher = more likely to be selected when multiple match
  pageTypes?: ('standard' | 'beta-prelaunch' | 'demo' | 'sales')[];
}

// =============================================================================
// LAYOUT TEMPLATES REGISTRY
// =============================================================================

export const layoutTemplates: Record<string, LayoutTemplate> = {
  // ---------------------------------------------------------------------------
  // ENTERPRISE / EXECUTIVE AUDIENCE (cross-industry)
  // ---------------------------------------------------------------------------
  'enterprise-executive': {
    id: 'enterprise-executive',
    name: 'Enterprise Executive',
    description: 'Cross-industry layout optimized for executive/C-suite audiences. Leads with social proof and authority, avoids self-serve/PLG elements.',
    industries: ['saas', 'saas-enterprise', 'consulting', 'fintech', 'healthtech', 'manufacturing', 'default'],
    awarenessLevels: ['solution-aware', 'product-aware', 'most-aware'],
    sections: [
      'hero',
      'stats-bar',
      'features',
      'social-proof',
      'how-it-works',
      'client-results',
      'faq',
      'final-cta',
    ],
    conditionalSections: [
      { section: 'credentials-bar', condition: 'hasCredentials', insertAfter: 'stats-bar' },
      { section: 'client-results', condition: 'hasCaseStudies', insertAfter: 'social-proof' },
    ],
    visualStyle: {
      heroStyle: 'bold-statement',
      proofDensity: 'comprehensive',
      ctaFrequency: 'hero-and-final',
    },
    priority: 85, // High priority when executive audience detected
  },

  // ---------------------------------------------------------------------------
  // CONSULTING / PROFESSIONAL SERVICES
  // ---------------------------------------------------------------------------
  'consulting-authority': {
    id: 'consulting-authority',
    name: 'Authority-First Consulting',
    description: 'Leads with credentials and expertise to establish trust before solution',
    industries: ['consulting', 'coaching'],
    awarenessLevels: ['solution-aware', 'product-aware'],
    sections: [
      'hero',
      'credentials-bar',
      'the-real-challenge',
      'our-approach',
      'expertise-areas',
      'client-results',
      'engagement-model',
      'faq',
      'final-cta',
    ],
    conditionalSections: [
      { section: 'social-proof', condition: 'hasTestimonials', insertAfter: 'client-results' },
    ],
    visualStyle: {
      heroStyle: 'bold-statement',
      proofDensity: 'comprehensive',
      ctaFrequency: 'hero-and-final',
    },
    priority: 100,
    pageTypes: ['standard'],
  },

  'consulting-problem-led': {
    id: 'consulting-problem-led',
    name: 'Problem-Led Consulting',
    description: 'Leads with problem agitation for buyers who are problem-aware',
    industries: ['consulting', 'coaching'],
    awarenessLevels: ['problem-aware', 'unaware'],
    sections: [
      'hero',
      'the-real-challenge',
      'our-approach',
      'expertise-areas',
      'credentials-bar',
      'client-results',
      'faq',
      'final-cta',
    ],
    conditionalSections: [
      { section: 'social-proof', condition: 'hasTestimonials', insertAfter: 'credentials-bar' },
      { section: 'engagement-model', condition: 'hasProcess', insertAfter: 'expertise-areas' },
    ],
    visualStyle: {
      heroStyle: 'problem-first',
      proofDensity: 'moderate',
      ctaFrequency: 'hero-and-final',
    },
    priority: 90,
    pageTypes: ['standard'],
  },

  // ---------------------------------------------------------------------------
  // SAAS / TECHNOLOGY
  // ---------------------------------------------------------------------------
  'saas-product-led': {
    id: 'saas-product-led',
    name: 'Product-Led SaaS',
    description: 'Feature-forward layout for product-aware buyers ready to evaluate',
    industries: ['saas', 'saas-enterprise', 'saas-startup', 'devtools', 'default'],
    awarenessLevels: ['product-aware', 'most-aware'],
    sections: [
      'hero',
      'stats-bar',
      'features',
      'product-demo',
      'integrations',
      'social-proof',
      'pricing-tiers',
      'faq',
      'final-cta',
    ],
    conditionalSections: [
      { section: 'how-it-works', condition: 'hasProcess', insertAfter: 'features' },
    ],
    visualStyle: {
      heroStyle: 'bold-statement',
      proofDensity: 'moderate',
      ctaFrequency: 'every-section',
    },
    priority: 100,
    pageTypes: ['standard'],
  },

  'saas-problem-solution': {
    id: 'saas-problem-solution',
    name: 'Problem-Solution SaaS',
    description: 'Educates on the problem before presenting the product solution',
    industries: ['saas', 'saas-enterprise', 'saas-startup', 'devtools', 'default'],
    awarenessLevels: ['problem-aware', 'solution-aware'],
    sections: [
      'hero',
      'problem-solution',
      'features',
      'how-it-works',
      'social-proof',
      'faq',
      'final-cta',
    ],
    conditionalSections: [
      { section: 'stats-bar', condition: 'hasStats', insertAfter: 'hero' },
      { section: 'integrations', condition: 'hasCredentials', insertAfter: 'how-it-works' },
    ],
    visualStyle: {
      heroStyle: 'problem-first',
      proofDensity: 'moderate',
      ctaFrequency: 'hero-and-final',
    },
    priority: 90,
    pageTypes: ['standard'],
  },

  // ---------------------------------------------------------------------------
  // HEALTHCARE
  // ---------------------------------------------------------------------------
  'healthcare-trust-first': {
    id: 'healthcare-trust-first',
    name: 'Healthcare Trust-First',
    description: 'Leads with credentials and compliance for regulated healthcare',
    industries: ['healthcare'],
    awarenessLevels: ['problem-aware', 'solution-aware', 'product-aware'],
    sections: [
      'hero',
      'provider-credentials',
      'patient-journey',
      'treatment-options',
      'social-proof',
      'faq',
      'final-cta',
    ],
    conditionalSections: [
      { section: 'stats-bar', condition: 'hasStats', insertAfter: 'hero' },
    ],
    visualStyle: {
      heroStyle: 'social-proof-lead',
      proofDensity: 'comprehensive',
      ctaFrequency: 'hero-and-final',
    },
    priority: 100,
    pageTypes: ['standard'],
  },

  // ---------------------------------------------------------------------------
  // LOCAL SERVICES
  // ---------------------------------------------------------------------------
  'local-services-trust': {
    id: 'local-services-trust',
    name: 'Local Services Trust',
    description: 'Trust-forward layout for local service businesses',
    industries: ['manufacturing', 'realestate'],
    awarenessLevels: ['problem-aware', 'solution-aware'],
    sections: [
      'hero',
      'stats-bar',
      'service-area',
      'features',
      'before-after',
      'social-proof',
      'how-it-works',
      'faq',
      'final-cta',
    ],
    conditionalSections: [
      { section: 'emergency-cta', condition: 'hasCredentials', insertAfter: 'hero' },
    ],
    visualStyle: {
      heroStyle: 'social-proof-lead',
      proofDensity: 'comprehensive',
      ctaFrequency: 'every-section',
    },
    priority: 100,
    pageTypes: ['standard'],
  },

  // ---------------------------------------------------------------------------
  // E-COMMERCE
  // ---------------------------------------------------------------------------
  'ecommerce-conversion': {
    id: 'ecommerce-conversion',
    name: 'E-commerce Conversion',
    description: 'Product-focused layout optimized for conversions',
    industries: ['ecommerce'],
    awarenessLevels: ['product-aware', 'most-aware'],
    sections: [
      'hero',
      'trust-badges',
      'product-showcase',
      'features',
      'reviews-carousel',
      'faq',
      'final-cta',
    ],
    conditionalSections: [
      { section: 'how-it-works', condition: 'hasProcess', insertAfter: 'product-showcase' },
    ],
    visualStyle: {
      heroStyle: 'split-hero',
      proofDensity: 'comprehensive',
      ctaFrequency: 'every-section',
    },
    priority: 100,
    pageTypes: ['standard'],
  },

  // ---------------------------------------------------------------------------
  // BETA / PRE-LAUNCH
  // ---------------------------------------------------------------------------
  'beta-prelaunch': {
    id: 'beta-prelaunch',
    name: 'Beta Pre-Launch',
    description: 'Waitlist-focused layout for pre-launch products',
    industries: ['saas', 'saas-startup', 'beta', 'default', 'ecommerce'],
    awarenessLevels: ['unaware', 'problem-aware'],
    sections: [
      'beta-hero-teaser',
      'beta-perks',
      'waitlist-proof',
      'faq',
      'beta-final-cta',
    ],
    conditionalSections: [],
    visualStyle: {
      heroStyle: 'bold-statement',
      proofDensity: 'minimal',
      ctaFrequency: 'hero-and-final',
    },
    priority: 200, // Highest priority when pageType is beta
    pageTypes: ['beta-prelaunch'],
  },

  // ---------------------------------------------------------------------------
  // FALLBACK / DEFAULT
  // ---------------------------------------------------------------------------
  'default-balanced': {
    id: 'default-balanced',
    name: 'Balanced Default',
    description: 'Generic balanced layout that works for most industries',
    industries: ['default'],
    awarenessLevels: ['problem-aware', 'solution-aware', 'product-aware'],
    sections: [
      'hero',
      'stats-bar',
      'problem-solution',
      'features',
      'how-it-works',
      'social-proof',
      'faq',
      'final-cta',
    ],
    conditionalSections: [],
    visualStyle: {
      heroStyle: 'bold-statement',
      proofDensity: 'moderate',
      ctaFrequency: 'hero-and-final',
    },
    priority: 10, // Lowest priority - only used as fallback
    pageTypes: ['standard'],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all available layout template IDs
 */
export function getLayoutTemplateIds(): string[] {
  return Object.keys(layoutTemplates);
}

/**
 * Get a layout template by ID
 */
export function getLayoutTemplate(layoutId: string): LayoutTemplate | null {
  return layoutTemplates[layoutId] || null;
}

/**
 * Get all templates for a specific industry
 */
export function getTemplatesForIndustry(industry: IndustryVariant): LayoutTemplate[] {
  return Object.values(layoutTemplates)
    .filter(t => t.industries.includes(industry) || t.industries.includes('default'))
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Check if a section type is a core section (always supported)
 */
export function isCoreSectionType(sectionType: LayoutSectionType): boolean {
  const coreSections: LayoutSectionType[] = [
    'hero', 'stats-bar', 'problem-solution', 'features', 
    'how-it-works', 'social-proof', 'faq', 'final-cta'
  ];
  return coreSections.includes(sectionType);
}

/**
 * Map specialized section types to core fallbacks
 * Used when a specialized section component doesn't exist yet
 */
export function mapToCoreSectionType(sectionType: LayoutSectionType): LayoutSectionType {
  const mappings: Record<string, LayoutSectionType> = {
    // Consulting sections -> core mappings
    'credentials-bar': 'stats-bar',
    'the-real-challenge': 'problem-solution',
    'our-approach': 'features',
    'expertise-areas': 'features',
    'engagement-model': 'how-it-works',
    'client-results': 'social-proof',
    // Healthcare sections -> core mappings
    'patient-journey': 'how-it-works',
    'treatment-options': 'features',
    'provider-credentials': 'stats-bar',
    // SaaS sections -> core mappings
    'product-demo': 'features',
    'integrations': 'features',
    'pricing-tiers': 'features',
    // Local services -> core mappings
    'service-area': 'features',
    'before-after': 'social-proof',
    'emergency-cta': 'final-cta',
    // E-commerce -> core mappings
    'product-showcase': 'features',
    'reviews-carousel': 'social-proof',
    'trust-badges': 'stats-bar',
  };
  
  return mappings[sectionType] || sectionType;
}

console.log('📐 [LayoutTemplates] Loaded', Object.keys(layoutTemplates).length, 'layout templates');
