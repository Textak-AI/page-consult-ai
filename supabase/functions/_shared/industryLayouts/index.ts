/**
 * Industry Layouts System - Edge Function Barrel Export
 *
 * Provides industry-specific layout intelligence for landing page generation.
 * This is the server-side version for use in Supabase Edge Functions.
 *
 * @module industryLayouts
 */

import { alignIndustryToLayout, extractCharacteristics, buildSectionList } from "./alignment.ts";
import type { ExtractedIntelligence, IndustryLayoutConfig, SectionType } from "./types.ts";

// =============================================================================
// TYPES
// =============================================================================

export type {
  SectionType,
  HeroStyle,
  FeatureLayout,
  SocialProofStyle,
  CtaPlacement,
  ProcessLayout,
  TrustSignal,
  BuyerAwarenessLevel,
  ConditionalSection,
  LayoutRules,
  SectionOrder,
  ContentGuidance,
  IndustryLayoutConfig,
  BusinessCharacteristics,
  ArchetypeConfig,
  AlignmentResult,
  ExtractedIntelligence,
} from "./types.ts";

// =============================================================================
// CONDITIONS
// =============================================================================

export { evaluateCondition, getAvailableConditions } from "./conditions.ts";

// =============================================================================
// ARCHETYPES
// =============================================================================

export {
  archetypes,
  getArchetypeIds,
  getArchetype,
  getDefaultArchetype,
} from "./archetypes.ts";

// =============================================================================
// ALIGNMENT
// =============================================================================

export {
  alignIndustryToLayout,
  extractCharacteristics,
  buildSectionList,
} from "./alignment.ts";

// =============================================================================
// ADAPTER
// =============================================================================

export { consultationToIntelligence } from "./adapter.ts";

// =============================================================================
// INDUSTRY CONFIGS
// =============================================================================

export {
  industryConfigs,
  industryConfigsById,
  getIndustryIds,
  getIndustryOptions,
  getAllAliases,
  saasB2B,
  professionalServices,
  ecommerceDTC,
  healthcare,
  financialServices,
  localServices,
  educationCoaching,
  realEstate,
} from "./industries/index.ts";

// =============================================================================
// CONVENIENCE FUNCTION
// =============================================================================

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
