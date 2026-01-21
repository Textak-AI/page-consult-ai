/**
 * Safe conditional evaluation for section inclusion rules
 * No eval() - uses predefined evaluator functions
 */

import { ExtractedIntelligence } from "./types";

type ConditionEvaluator = (intelligence: ExtractedIntelligence) => boolean;

const conditionEvaluators: Record<string, ConditionEvaluator> = {
  hasCompetitors: (intel) => (intel.competitors?.length || 0) > 0,
  manyCompetitors: (intel) => (intel.competitors?.length || 0) >= 3,
  showPricing: (intel) => intel.pricing?.showOnPage === true,
  hasPricing: (intel) => !!intel.pricing?.value,
  hasTestimonials: (intel) => (intel.testimonials?.length || 0) > 0,
  hasCaseStudies: (intel) => (intel.caseStudies?.length || 0) > 0,
  hasMetrics: (intel) => (intel.metrics?.length || 0) > 0,
  hasLogos: (intel) => (intel.logos?.length || 0) > 0,
  hasObjections: (intel) => (intel.objections?.length || 0) > 2,
  manyObjections: (intel) => (intel.objections?.length || 0) >= 5,
  mentionsIntegrations: (intel) => intel.features.some((f) => /integrat/i.test(f)),
  mentionsSecurity: (intel) => intel.features.some((f) => /security|secure|encryption/i.test(f)),
  mentionsCompliance: (intel) => !!intel.compliance?.length || intel.features.some((f) => /complian|regulat/i.test(f)),
  requiresOnboarding: (intel) => intel.requiresOnboarding === true,
  hasProcess: (intel) => (intel.process?.length || 0) > 0,
  isLocal: (intel) => intel.isLocal === true,
  hasServiceArea: (intel) => !!intel.serviceArea,
  isPersonalBrand: (intel) => intel.isPersonalBrand === true,
  hasFounderStory: (intel) => !!intel.founderStory,
  always: () => true,
  never: () => false,
};

export function evaluateCondition(condition: string, intelligence: ExtractedIntelligence): boolean {
  const evaluator = conditionEvaluators[condition];

  if (!evaluator) {
    console.warn(`[industryLayouts] Unknown condition: "${condition}"`);
    return false;
  }

  try {
    return evaluator(intelligence);
  } catch (error) {
    console.error(`[industryLayouts] Error evaluating condition "${condition}":`, error);
    return false;
  }
}

export function getAvailableConditions(): string[] {
  return Object.keys(conditionEvaluators).sort();
}
