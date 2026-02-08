/**
 * Layout Selector
 * 
 * Selects the optimal layout template based on industry, buyer awareness,
 * page type, and available proof density.
 */

import type { IndustryVariant } from '@/lib/industryDesignSystem';
import type { DesignIntelligenceOutput } from '@/lib/designIntelligence';
import { 
  layoutTemplates, 
  getLayoutTemplate, 
  type LayoutTemplate,
  type LayoutSectionType,
} from '@/lib/layoutTemplates';

// =============================================================================
// TYPES
// =============================================================================

export interface LayoutSelectionInput {
  industry: IndustryVariant;
  awarenessLevel?: 'unaware' | 'problem-aware' | 'solution-aware' | 'product-aware' | 'most-aware';
  pageType?: 'standard' | 'beta-prelaunch' | 'demo' | 'sales' | null;
  proofDensity?: 'sparse' | 'moderate' | 'rich';
  designIntelligence?: DesignIntelligenceOutput;
  // Available proof for conditional sections
  availableProof?: {
    hasTestimonials?: boolean;
    hasStats?: boolean;
    hasProcess?: boolean;
    hasFAQ?: boolean;
    hasCredentials?: boolean;
    hasCaseStudies?: boolean;
  };
}

export interface LayoutSelectionResult {
  layoutId: string;
  template: LayoutTemplate;
  sections: LayoutSectionType[];
  reasoning: string;
  confidence: 'high' | 'medium' | 'low';
}

// =============================================================================
// LAYOUT SELECTION LOGIC
// =============================================================================

/**
 * Select the optimal layout template for a page
 * 
 * Priority order:
 * 1. Page type (beta-prelaunch always uses beta layout)
 * 2. Industry + awareness level match
 * 3. Industry match only
 * 4. Fallback to default
 */
export function selectLayout(input: LayoutSelectionInput): LayoutSelectionResult {
  const { 
    industry, 
    awarenessLevel = 'solution-aware', 
    pageType = 'standard',
    proofDensity = 'moderate',
    availableProof = {},
  } = input;

  console.log('📐 [LayoutSelector] Selecting layout for:', { industry, awarenessLevel, pageType, proofDensity });

  let selectedTemplate: LayoutTemplate | null = null;
  let matchReason = '';
  let confidence: 'high' | 'medium' | 'low' = 'low';

  // PRIORITY 1: Page type specific templates (e.g., beta-prelaunch)
  if (pageType === 'beta-prelaunch') {
    selectedTemplate = layoutTemplates['beta-prelaunch'];
    matchReason = `Selected beta-prelaunch layout for pre-launch page type`;
    confidence = 'high';
    console.log('📐 [LayoutSelector] Using beta-prelaunch layout');
  }

  // PRIORITY 2: Industry + awareness level exact match
  if (!selectedTemplate) {
    const industryTemplates = Object.values(layoutTemplates)
      .filter(t => 
        t.industries.includes(industry) &&
        t.awarenessLevels.includes(awarenessLevel) &&
        (!t.pageTypes || t.pageTypes.includes(pageType || 'standard'))
      )
      .sort((a, b) => b.priority - a.priority);

    if (industryTemplates.length > 0) {
      selectedTemplate = industryTemplates[0];
      matchReason = `Matched ${industry} industry with ${awarenessLevel} awareness level`;
      confidence = 'high';
      console.log('📐 [LayoutSelector] Found exact industry+awareness match:', selectedTemplate.id);
    }
  }

  // PRIORITY 3: Industry match only (any awareness level)
  if (!selectedTemplate) {
    const industryTemplates = Object.values(layoutTemplates)
      .filter(t => 
        t.industries.includes(industry) &&
        (!t.pageTypes || t.pageTypes.includes(pageType || 'standard'))
      )
      .sort((a, b) => b.priority - a.priority);

    if (industryTemplates.length > 0) {
      selectedTemplate = industryTemplates[0];
      matchReason = `Matched ${industry} industry (awareness level ${awarenessLevel} not specifically supported)`;
      confidence = 'medium';
      console.log('📐 [LayoutSelector] Found industry-only match:', selectedTemplate.id);
    }
  }

  // PRIORITY 4: Fallback to default
  if (!selectedTemplate) {
    selectedTemplate = layoutTemplates['default-balanced'];
    matchReason = `Using default balanced layout (no industry-specific template for ${industry})`;
    confidence = 'low';
    console.log('📐 [LayoutSelector] Falling back to default-balanced');
  }

  // Build final sections list with conditional sections
  const sections = buildSectionsWithConditionals(selectedTemplate, availableProof, proofDensity);

  const result: LayoutSelectionResult = {
    layoutId: selectedTemplate.id,
    template: selectedTemplate,
    sections,
    reasoning: matchReason,
    confidence,
  };

  console.log('📐 [LayoutSelector] Selected layout:', {
    layoutId: result.layoutId,
    sectionCount: sections.length,
    sections: sections,
    reasoning: result.reasoning,
    confidence: result.confidence,
  });

  return result;
}

/**
 * Build final sections list including conditional sections
 */
function buildSectionsWithConditionals(
  template: LayoutTemplate,
  availableProof: LayoutSelectionInput['availableProof'] = {},
  proofDensity: string = 'moderate'
): LayoutSectionType[] {
  const sections = [...template.sections];

  // Add conditional sections based on available proof
  if (template.conditionalSections) {
    for (const conditional of template.conditionalSections) {
      const conditionMet = checkCondition(conditional.condition, availableProof);
      
      if (conditionMet && !sections.includes(conditional.section)) {
        // Find insert position
        const insertAfterIndex = conditional.insertAfter 
          ? sections.indexOf(conditional.insertAfter)
          : -1;
        
        if (insertAfterIndex >= 0) {
          sections.splice(insertAfterIndex + 1, 0, conditional.section);
          console.log(`📐 [LayoutSelector] Added conditional section ${conditional.section} after ${conditional.insertAfter}`);
        } else {
          // Insert before final-cta if no position specified
          const finalCtaIndex = sections.indexOf('final-cta');
          if (finalCtaIndex >= 0) {
            sections.splice(finalCtaIndex, 0, conditional.section);
          } else {
            sections.push(conditional.section);
          }
        }
      }
    }
  }

  // Filter sections based on proof density for sparse pages
  if (proofDensity === 'sparse') {
    return sections.filter(s => {
      // Always keep hero and final-cta
      if (s === 'hero' || s === 'final-cta' || s === 'beta-hero-teaser' || s === 'beta-final-cta') {
        return true;
      }
      // Skip proof-heavy sections when proof is sparse
      if (s === 'stats-bar' || s === 'social-proof' || s === 'client-results' || s === 'credentials-bar') {
        const hasRealProof = availableProof?.hasStats || availableProof?.hasTestimonials || availableProof?.hasCredentials;
        return hasRealProof;
      }
      return true;
    });
  }

  return sections;
}

/**
 * Check if a condition is met based on available proof
 */
function checkCondition(
  condition: string,
  availableProof: LayoutSelectionInput['availableProof'] = {}
): boolean {
  switch (condition) {
    case 'hasTestimonials':
      return availableProof.hasTestimonials === true;
    case 'hasStats':
      return availableProof.hasStats === true;
    case 'hasProcess':
      return availableProof.hasProcess === true;
    case 'hasFAQ':
      return availableProof.hasFAQ === true;
    case 'hasCredentials':
      return availableProof.hasCredentials === true;
    case 'hasCaseStudies':
      return availableProof.hasCaseStudies === true;
    default:
      return false;
  }
}

/**
 * Get layout selection based on SDI output
 */
export function selectLayoutFromSDI(sdi: DesignIntelligenceOutput, pageType?: string): LayoutSelectionResult {
  // Map SDI awareness level to layout selector format
  const awarenessMapping: Record<string, 'unaware' | 'problem-aware' | 'solution-aware' | 'product-aware' | 'most-aware'> = {
    'unaware': 'unaware',
    'problem-aware': 'problem-aware',
    'solution-aware': 'solution-aware',
    'product-aware': 'product-aware',
    'most-aware': 'most-aware',
  };

  // Extract available proof from SDI
  const availableProof = {
    hasTestimonials: (sdi.proofPoints?.testimonials?.length || 0) > 0,
    hasStats: (sdi.proofPoints?.specificResults?.length || 0) > 0 || 
              (sdi.proofPoints?.percentageStats?.length || 0) > 0 ||
              !!sdi.proofPoints?.clientCount || 
              !!sdi.proofPoints?.yearsInBusiness,
    hasProcess: false, // Process steps not in ProofPoints type
    hasFAQ: true, // Always assume FAQ is possible
    hasCredentials: (sdi.proofPoints?.certifications?.length || 0) > 0,
    hasCaseStudies: (sdi.proofPoints?.caseStudies?.length || 0) > 0,
  };

  return selectLayout({
    industry: sdi.industry as IndustryVariant,
    awarenessLevel: awarenessMapping[sdi.awarenessLevel] || 'solution-aware',
    pageType: (pageType as any) || 'standard',
    proofDensity: sdi.proofDensity,
    designIntelligence: sdi,
    availableProof,
  });
}
