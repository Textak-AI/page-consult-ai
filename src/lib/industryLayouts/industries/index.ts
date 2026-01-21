/**
 * Industry Configurations Index
 *
 * Export all industry-specific layout configurations
 */

import { IndustryLayoutConfig } from "../types";

// Import all industry configs
import { saasB2B } from "./saas-b2b";
import { professionalServices } from "./professional-services";
import { ecommerceDTC } from "./ecommerce-dtc";
import { healthcare } from "./healthcare";
import { financialServices } from "./financial-services";
import { localServices } from "./local-services";
import { educationCoaching } from "./education-coaching";
import { realEstate } from "./real-estate";

// =============================================================================
// INDUSTRY CONFIGS ARRAY
// =============================================================================

export const industryConfigs: IndustryLayoutConfig[] = [
  saasB2B,
  professionalServices,
  ecommerceDTC,
  healthcare,
  financialServices,
  localServices,
  educationCoaching,
  realEstate,
];

// =============================================================================
// LOOKUP BY ID
// =============================================================================

export const industryConfigsById: Record<string, IndustryLayoutConfig> = industryConfigs.reduce(
  (acc, config) => {
    acc[config.id] = config;
    return acc;
  },
  {} as Record<string, IndustryLayoutConfig>,
);

// =============================================================================
// INDIVIDUAL EXPORTS
// =============================================================================

export {
  saasB2B,
  professionalServices,
  ecommerceDTC,
  healthcare,
  financialServices,
  localServices,
  educationCoaching,
  realEstate,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all industry IDs
 */
export function getIndustryIds(): string[] {
  return industryConfigs.map((c) => c.id);
}

/**
 * Get all industry names and IDs for dropdowns
 */
export function getIndustryOptions(): Array<{ id: string; name: string }> {
  return industryConfigs.map((c) => ({ id: c.id, name: c.name }));
}

/**
 * Get all aliases across all industries (for matching)
 */
export function getAllAliases(): Map<string, string> {
  const aliasMap = new Map<string, string>();

  for (const config of industryConfigs) {
    // Add the ID itself
    aliasMap.set(config.id.toLowerCase(), config.id);
    aliasMap.set(config.name.toLowerCase(), config.id);

    // Add all aliases
    for (const alias of config.aliases) {
      aliasMap.set(alias.toLowerCase(), config.id);
    }
  }

  return aliasMap;
}
