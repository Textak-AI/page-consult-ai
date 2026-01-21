/**
 * Industry Alignment Logic
 *
 * Intelligently matches any industry to the best layout configuration
 * by trying: exact match → alias match → archetype scoring → keyword fallback
 *
 * @module industryLayouts/alignment
 */

import {
  IndustryLayoutConfig,
  BusinessCharacteristics,
  AlignmentResult,
  ArchetypeConfig,
  ExtractedIntelligence,
  SectionType,
  LayoutRules,
  SectionOrder,
  ContentGuidance,
} from "./types";

import { archetypes, getDefaultArchetype } from "./archetypes";
import { industryConfigs, getAllAliases, industryConfigsById } from "./industries";

// =============================================================================
// MAIN ALIGNMENT FUNCTION
// =============================================================================

/**
 * Main entry point: Find the best layout configuration for any industry
 *
 * @param detectedIndustry - The industry string from consultation
 * @param characteristics - Optional business characteristics for better matching
 * @returns AlignmentResult with config, confidence, and reasoning
 */
export function alignIndustryToLayout(
  detectedIndustry: string,
  characteristics?: Partial<BusinessCharacteristics>,
): AlignmentResult {
  const normalizedIndustry = detectedIndustry.toLowerCase().trim();

  // 1. Try exact match by ID
  const exactMatch = industryConfigsById[normalizedIndustry];
  if (exactMatch) {
    return {
      config: exactMatch,
      source: "exact",
      confidence: 1.0,
      reasoning: `Exact match for industry: ${exactMatch.name}`,
    };
  }

  // 2. Try alias match
  const aliasMap = getAllAliases();
  for (const [alias, industryId] of aliasMap.entries()) {
    if (normalizedIndustry.includes(alias) || alias.includes(normalizedIndustry)) {
      const aliasConfig = industryConfigsById[industryId];
      if (aliasConfig) {
        return {
          config: aliasConfig,
          source: "alias",
          confidence: 0.9,
          reasoning: `Matched alias "${alias}" to industry: ${aliasConfig.name}`,
        };
      }
    }
  }

  // 3. If we have characteristics, score against archetypes
  if (characteristics && Object.keys(characteristics).length >= 2) {
    const scored = scoreAgainstArchetypes(characteristics);
    if (scored.length > 0 && scored[0].score >= 0.4) {
      return {
        config: archetypeToIndustryConfig(scored[0].archetype, detectedIndustry),
        source: "archetype",
        confidence: scored[0].score,
        archetype: scored[0].archetype.id,
        reasoning: `Aligned to ${scored[0].archetype.name} archetype (${Math.round(scored[0].score * 100)}% characteristic match)`,
      };
    }
  }

  // 4. Try keyword-based archetype matching
  const keywordMatch = matchByKeywords(normalizedIndustry);
  if (keywordMatch) {
    return {
      config: archetypeToIndustryConfig(keywordMatch.archetype, detectedIndustry),
      source: "archetype",
      confidence: keywordMatch.confidence,
      archetype: keywordMatch.archetype.id,
      reasoning: `Keyword match to ${keywordMatch.archetype.name} archetype`,
    };
  }

  // 5. Ultimate fallback: trusted-advisor (most versatile)
  const fallbackArchetype = getDefaultArchetype();
  return {
    config: archetypeToIndustryConfig(fallbackArchetype, detectedIndustry),
    source: "fallback",
    confidence: 0.3,
    archetype: fallbackArchetype.id,
    reasoning: `Fallback to ${fallbackArchetype.name} archetype (most versatile default)`,
    warnings: ["No specific match found - using default layout. Consider providing more business characteristics."],
  };
}

// =============================================================================
// ARCHETYPE SCORING
// =============================================================================

interface ScoredArchetype {
  archetype: ArchetypeConfig;
  score: number;
}

/**
 * Score business characteristics against all archetypes
 */
function scoreAgainstArchetypes(characteristics: Partial<BusinessCharacteristics>): ScoredArchetype[] {
  return Object.values(archetypes)
    .map((archetype) => ({
      archetype,
      score: calculateArchetypeScore(archetype, characteristics),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Calculate how well characteristics match an archetype
 */
function calculateArchetypeScore(
  archetype: ArchetypeConfig,
  characteristics: Partial<BusinessCharacteristics>,
): number {
  let matchedPoints = 0;
  let totalPoints = 0;

  for (const [key, expectedValue] of Object.entries(archetype.matches)) {
    const actualValue = characteristics[key as keyof BusinessCharacteristics];
    if (actualValue === undefined) continue;

    totalPoints += 10;

    if (Array.isArray(expectedValue)) {
      // Match any value in array
      if ((expectedValue as any[]).includes(actualValue)) {
        matchedPoints += 10;
      } else {
        // Partial credit for close matches
        matchedPoints += 2;
      }
    } else if (typeof expectedValue === "boolean") {
      // Boolean match
      if (expectedValue === actualValue) {
        matchedPoints += 10;
      }
    } else if (expectedValue === actualValue) {
      // Exact match
      matchedPoints += 10;
    }
  }

  return totalPoints > 0 ? matchedPoints / totalPoints : 0;
}

// =============================================================================
// KEYWORD MATCHING
// =============================================================================

interface KeywordMatch {
  archetype: ArchetypeConfig;
  confidence: number;
}

/**
 * Match industry to archetype by keywords (fallback)
 */
function matchByKeywords(industry: string): KeywordMatch | null {
  const keywordMap: Record<string, { archetype: string; confidence: number }> = {
    // Enterprise/B2B keywords
    software: { archetype: "enterprise-sale", confidence: 0.6 },
    saas: { archetype: "enterprise-sale", confidence: 0.7 },
    platform: { archetype: "enterprise-sale", confidence: 0.5 },
    enterprise: { archetype: "enterprise-sale", confidence: 0.7 },
    b2b: { archetype: "enterprise-sale", confidence: 0.7 },
    api: { archetype: "enterprise-sale", confidence: 0.6 },
    cloud: { archetype: "enterprise-sale", confidence: 0.5 },

    // Service keywords
    consulting: { archetype: "trusted-advisor", confidence: 0.8 },
    agency: { archetype: "trusted-advisor", confidence: 0.7 },
    coach: { archetype: "trusted-advisor", confidence: 0.7 },
    advisor: { archetype: "trusted-advisor", confidence: 0.8 },
    firm: { archetype: "trusted-advisor", confidence: 0.6 },
    consultant: { archetype: "trusted-advisor", confidence: 0.8 },
    freelance: { archetype: "trusted-advisor", confidence: 0.6 },

    // Consumer product keywords
    shop: { archetype: "consumer-product", confidence: 0.7 },
    store: { archetype: "consumer-product", confidence: 0.6 },
    brand: { archetype: "consumer-product", confidence: 0.5 },
    product: { archetype: "consumer-product", confidence: 0.5 },
    ecommerce: { archetype: "consumer-product", confidence: 0.8 },
    "e-commerce": { archetype: "consumer-product", confidence: 0.8 },
    dtc: { archetype: "consumer-product", confidence: 0.8 },
    retail: { archetype: "consumer-product", confidence: 0.6 },

    // Local service keywords
    plumber: { archetype: "local-service", confidence: 0.9 },
    plumbing: { archetype: "local-service", confidence: 0.9 },
    electrician: { archetype: "local-service", confidence: 0.9 },
    dentist: { archetype: "local-service", confidence: 0.8 },
    restaurant: { archetype: "local-service", confidence: 0.8 },
    salon: { archetype: "local-service", confidence: 0.8 },
    contractor: { archetype: "local-service", confidence: 0.8 },
    repair: { archetype: "local-service", confidence: 0.7 },
    cleaning: { archetype: "local-service", confidence: 0.8 },
    hvac: { archetype: "local-service", confidence: 0.9 },
    landscaping: { archetype: "local-service", confidence: 0.8 },
    roofing: { archetype: "local-service", confidence: 0.9 },

    // Regulated keywords
    healthcare: { archetype: "regulated-trust", confidence: 0.8 },
    medical: { archetype: "regulated-trust", confidence: 0.8 },
    health: { archetype: "regulated-trust", confidence: 0.6 },
    financial: { archetype: "regulated-trust", confidence: 0.8 },
    insurance: { archetype: "regulated-trust", confidence: 0.8 },
    legal: { archetype: "regulated-trust", confidence: 0.7 },
    law: { archetype: "regulated-trust", confidence: 0.7 },
    accounting: { archetype: "regulated-trust", confidence: 0.7 },
    tax: { archetype: "regulated-trust", confidence: 0.7 },
    compliance: { archetype: "regulated-trust", confidence: 0.7 },

    // Transformation keywords
    fitness: { archetype: "transformation-promise", confidence: 0.8 },
    gym: { archetype: "transformation-promise", confidence: 0.7 },
    training: { archetype: "transformation-promise", confidence: 0.6 },
    education: { archetype: "transformation-promise", confidence: 0.7 },
    course: { archetype: "transformation-promise", confidence: 0.7 },
    bootcamp: { archetype: "transformation-promise", confidence: 0.8 },
    program: { archetype: "transformation-promise", confidence: 0.5 },
    "weight loss": { archetype: "transformation-promise", confidence: 0.9 },
    coaching: { archetype: "transformation-promise", confidence: 0.7 },

    // High-ticket consumer
    luxury: { archetype: "high-ticket-consumer", confidence: 0.7 },
    premium: { archetype: "high-ticket-consumer", confidence: 0.6 },
    travel: { archetype: "high-ticket-consumer", confidence: 0.6 },

    // SaaS prosumer
    app: { archetype: "saas-prosumer", confidence: 0.6 },
    tool: { archetype: "saas-prosumer", confidence: 0.5 },
    productivity: { archetype: "saas-prosumer", confidence: 0.7 },

    // Nonprofit
    nonprofit: { archetype: "nonprofit-cause", confidence: 0.9 },
    "non-profit": { archetype: "nonprofit-cause", confidence: 0.9 },
    charity: { archetype: "nonprofit-cause", confidence: 0.9 },
    foundation: { archetype: "nonprofit-cause", confidence: 0.7 },
    ngo: { archetype: "nonprofit-cause", confidence: 0.8 },
  };

  // Check each keyword
  for (const [keyword, match] of Object.entries(keywordMap)) {
    if (industry.includes(keyword)) {
      const archetype = archetypes[match.archetype];
      if (archetype) {
        return {
          archetype,
          confidence: match.confidence,
        };
      }
    }
  }

  return null;
}

// =============================================================================
// ARCHETYPE TO CONFIG CONVERSION
// =============================================================================

/**
 * Convert an archetype to a full IndustryLayoutConfig
 */
function archetypeToIndustryConfig(archetype: ArchetypeConfig, industryName: string): IndustryLayoutConfig {
  return {
    id: `aligned-${archetype.id}`,
    name: industryName,
    description: `${industryName} (aligned to ${archetype.name} archetype)`,
    aliases: [],

    sections: {
      required: archetype.defaultSections.filter(
        (s): s is SectionType => ["hero", "cta-final"].includes(s) || archetype.defaultSections.indexOf(s) < 3,
      ),
      conditional: archetype.defaultSections
        .filter((s) => !["hero", "cta-final"].includes(s))
        .slice(2) // Skip first 2 (already in required)
        .map((section, i) => ({
          section,
          condition: "true",
          priority: 10 - i,
        })),
      avoid: [],
      maxSections: 9,
    },

    layout: archetype.layout,

    sectionOrder: {
      unaware: archetype.defaultSections as SectionType[],
      problemAware: archetype.defaultSections as SectionType[],
      solutionAware: archetype.defaultSections as SectionType[],
      productAware: ["hero", ...archetype.defaultSections.slice(-3), "cta-final"] as SectionType[],
      mostAware: ["hero", ...archetype.defaultSections.slice(-2), "cta-final"] as SectionType[],
    },

    trustPriorities: archetype.trustPriorities,
    contentGuidance: archetype.contentGuidance,

    _examples: archetype.examples,
    _lastUpdated: new Date().toISOString().split("T")[0],
  };
}

// =============================================================================
// CHARACTERISTICS EXTRACTION
// =============================================================================

/**
 * Extract business characteristics from consultation intelligence
 */
export function extractCharacteristics(intelligence: ExtractedIntelligence): Partial<BusinessCharacteristics> {
  const characteristics: Partial<BusinessCharacteristics> = {};

  // Business model inference
  if (intelligence.audience) {
    const audienceLower = intelligence.audience.toLowerCase();
    if (
      audienceLower.includes("business") ||
      audienceLower.includes("company") ||
      audienceLower.includes("enterprise") ||
      audienceLower.includes("b2b") ||
      audienceLower.includes("organizations")
    ) {
      characteristics.businessModel = "b2b";
    } else if (
      audienceLower.includes("consumer") ||
      audienceLower.includes("individual") ||
      audienceLower.includes("people") ||
      audienceLower.includes("homeowner") ||
      audienceLower.includes("parent")
    ) {
      characteristics.businessModel = "b2c";
    }
  }

  // Revenue model inference
  if (intelligence.pricing) {
    const pricingModel = (intelligence.pricing.model || "").toLowerCase();
    if (pricingModel.includes("subscription") || pricingModel.includes("monthly") || pricingModel.includes("annual")) {
      characteristics.revenueModel = "subscription";
    } else if (pricingModel.includes("retainer")) {
      characteristics.revenueModel = "retainer";
    } else if (pricingModel.includes("project") || pricingModel.includes("fixed") || pricingModel.includes("flat")) {
      characteristics.revenueModel = "project-based";
    } else if (pricingModel.includes("free") || pricingModel.includes("freemium")) {
      characteristics.revenueModel = "freemium";
    } else {
      characteristics.revenueModel = "one-time";
    }
  }

  // Price point categorization
  if (intelligence.pricing?.value) {
    const price = intelligence.pricing.value;
    if (price === 0) characteristics.pricePoint = "free";
    else if (price < 50) characteristics.pricePoint = "low";
    else if (price < 500) characteristics.pricePoint = "medium";
    else if (price < 5000) characteristics.pricePoint = "high";
    else characteristics.pricePoint = "enterprise";
  }

  // Delivery type inference
  if (intelligence.offering) {
    const offeringLower = intelligence.offering.toLowerCase();
    if (
      offeringLower.includes("software") ||
      offeringLower.includes("app") ||
      offeringLower.includes("platform") ||
      offeringLower.includes("saas")
    ) {
      characteristics.deliveryType = "saas";
    } else if (offeringLower.includes("digital") || offeringLower.includes("download")) {
      characteristics.deliveryType = "digital";
    } else if (
      offeringLower.includes("product") ||
      offeringLower.includes("ship") ||
      offeringLower.includes("physical")
    ) {
      characteristics.deliveryType = "physical";
    } else if (
      offeringLower.includes("service") ||
      offeringLower.includes("consult") ||
      offeringLower.includes("agency")
    ) {
      characteristics.deliveryType = "service";
    }
  }

  // Local business detection
  if (intelligence.serviceArea) {
    const areaLower = intelligence.serviceArea.toLowerCase();
    characteristics.isLocal =
      areaLower !== "global" &&
      areaLower !== "worldwide" &&
      areaLower !== "international" &&
      !areaLower.includes("all ");
  }
  characteristics.isLocal = intelligence.isLocal ?? characteristics.isLocal;

  // Trust barrier inference (from objections count)
  if (intelligence.objections) {
    if (intelligence.objections.length > 4) {
      characteristics.trustBarrier = "critical";
    } else if (intelligence.objections.length > 2) {
      characteristics.trustBarrier = "high";
    } else if (intelligence.objections.length > 0) {
      characteristics.trustBarrier = "medium";
    } else {
      characteristics.trustBarrier = "low";
    }
  }

  // Regulatory environment detection
  const regulatedKeywords = [
    "healthcare",
    "medical",
    "health",
    "hipaa",
    "financial",
    "finra",
    "sec",
    "banking",
    "insurance",
    "legal",
    "law",
    "attorney",
    "pharmaceutical",
    "fda",
    "compliance",
  ];
  if (intelligence.industry && regulatedKeywords.some((k) => intelligence.industry.toLowerCase().includes(k))) {
    characteristics.regulatoryEnvironment = true;
    characteristics.requiresCredentials = true;
  }

  // Check compliance array for regulatory hints
  if (intelligence.compliance && intelligence.compliance.length > 0) {
    characteristics.regulatoryEnvironment = true;
  }

  // Onboarding detection
  if (intelligence.process && intelligence.process.length > 2) {
    characteristics.requiresOnboarding = true;
  }
  characteristics.requiresOnboarding = intelligence.requiresOnboarding ?? characteristics.requiresOnboarding;

  // Personal brand detection
  if (intelligence.isPersonalBrand) {
    // Personal brands often have higher trust requirements
    characteristics.trustBarrier = characteristics.trustBarrier || "medium";
  }

  return characteristics;
}

// =============================================================================
// SECTION BUILDING
// =============================================================================

/**
 * Build the optimal section list based on config and intelligence
 */
export function buildSectionList(
  config: IndustryLayoutConfig,
  intelligence: ExtractedIntelligence,
  awarenessLevel: string = "problemAware",
): SectionType[] {
  // Start with awareness-based order
  const orderedSections = config.sectionOrder[awarenessLevel as keyof SectionOrder] || config.sectionOrder.problemAware;

  // Filter by what we have intelligence for
  const availableSections = orderedSections.filter((section) => {
    // Required sections always included
    if (config.sections.required.includes(section)) return true;

    // Check conditional sections
    const conditional = config.sections.conditional.find((c) => c.section === section);
    if (conditional) {
      // Simple condition evaluation (can be enhanced)
      return evaluateCondition(conditional.condition, intelligence);
    }

    // Avoid sections excluded
    if (config.sections.avoid.includes(section)) return false;

    return true;
  });

  // Respect max sections
  return availableSections.slice(0, config.sections.maxSections);
}

/**
 * Simple condition evaluator
 */
function evaluateCondition(condition: string, intelligence: ExtractedIntelligence): boolean {
  if (condition === "true") return true;
  if (condition === "false") return false;

  // Simple property checks
  try {
    // Handle common patterns
    if (condition.includes(".length >")) {
      const match = condition.match(/intelligence\.(\w+)\.length > (\d+)/);
      if (match) {
        const prop = (intelligence as any)[match[1]];
        return Array.isArray(prop) && prop.length > parseInt(match[2]);
      }
    }

    if (condition.includes(" > 0")) {
      const match = condition.match(/intelligence\.(\w+)(?:\.(\w+))?(?:\.length)? > 0/);
      if (match) {
        let value = (intelligence as any)[match[1]];
        if (match[2] && value) value = value[match[2]];
        if (Array.isArray(value)) return value.length > 0;
        return !!value;
      }
    }

    if (condition.includes("=== true")) {
      const match = condition.match(/intelligence\.(\w+) === true/);
      if (match) {
        return (intelligence as any)[match[1]] === true;
      }
    }

    if (condition.includes("!= null")) {
      const match = condition.match(/intelligence\.(\w+) != null/);
      if (match) {
        return (intelligence as any)[match[1]] != null;
      }
    }

    // Default to including the section
    return true;
  } catch {
    return true;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export { scoreAgainstArchetypes, matchByKeywords, archetypeToIndustryConfig, buildSectionList };
