/**
 * Industry Layout Intelligence System
 *
 * A comprehensive library for making intelligent page layout decisions
 * based on industry, business characteristics, and buyer awareness.
 *
 * Usage:
 * ```typescript
 * import { alignIndustryToLayout, extractCharacteristics } from '@/lib/industryLayouts';
 *
 * // In your page generation logic
 * const characteristics = extractCharacteristics(consultationIntelligence);
 * const { config, confidence, reasoning } = alignIndustryToLayout(
 *   consultationIntelligence.industry,
 *   characteristics
 * );
 *
 * console.log(`Using ${config.name} layout (${confidence * 100}% confident)`);
 * console.log(`Reasoning: ${reasoning}`);
 *
 * // Get sections for this buyer's awareness level
 * const sections = buildSectionList(config, consultationIntelligence, 'problemAware');
 *
 * // Use layout rules
 * const featureCount = Math.min(features.length, config.layout.maxFeatureCards);
 * const heroStyle = config.layout.heroStyle;
 * ```
 *
 * @module industryLayouts
 */

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  // Core types
  SectionType,
  HeroStyle,
  FeatureLayout,
  SocialProofStyle,
  CtaPlacement,
  ProcessLayout,
  TrustSignal,
  BuyerAwarenessLevel,

  // Configuration interfaces
  ConditionalSection,
  LayoutRules,
  SectionOrder,
  ContentGuidance,
  IndustryLayoutConfig,

  // Alignment types
  BusinessCharacteristics,
  ArchetypeConfig,
  AlignmentResult,

  // Intelligence types
  ExtractedIntelligence,
} from "./types";

// =============================================================================
// ARCHETYPE EXPORTS
// =============================================================================

export { archetypes, getArchetypeIds, getArchetype, getDefaultArchetype } from "./archetypes";

// =============================================================================
// INDUSTRY CONFIG EXPORTS
// =============================================================================

export {
  industryConfigs,
  industryConfigsById,
  getIndustryIds,
  getIndustryOptions,
  getAllAliases,

  // Individual industry configs
  saasB2B,
  professionalServices,
  ecommerceDTC,
  healthcare,
  financialServices,
  localServices,
  educationCoaching,
  realEstate,
} from "./industries";

// =============================================================================
// ALIGNMENT EXPORTS
// =============================================================================

export { alignIndustryToLayout, extractCharacteristics, buildSectionList } from "./alignment";

// =============================================================================
// CONVENIENCE FUNCTION
// =============================================================================

import { alignIndustryToLayout, extractCharacteristics, buildSectionList } from "./alignment";
import { ExtractedIntelligence, IndustryLayoutConfig, SectionType } from "./types";

/**
 * All-in-one function to get layout recommendation from intelligence
 */
export function getLayoutRecommendation(intelligence: ExtractedIntelligence): {
  config: IndustryLayoutConfig;
  confidence: number;
  sections: SectionType[];
  reasoning: string;
} {
  const characteristics = extractCharacteristics(intelligence);
  const alignment = alignIndustryToLayout(intelligence.industry, characteristics);
  const sections = buildSectionList(alignment.config, intelligence, intelligence.buyerAwareness || "problemAware");

  return {
    config: alignment.config,
    confidence: alignment.confidence,
    sections,
    reasoning: alignment.reasoning,
  };
}

// =============================================================================
// VERSION
// =============================================================================

export const INDUSTRY_LAYOUTS_VERSION = "1.0.0";
