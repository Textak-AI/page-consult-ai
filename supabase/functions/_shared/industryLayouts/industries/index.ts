/**
 * Industry Configurations Index
 */

import { IndustryLayoutConfig } from "../types.ts";

import { saasB2B } from "./saas-b2b.ts";
import { professionalServices } from "./professional-services.ts";
import { ecommerceDTC } from "./ecommerce-dtc.ts";
import { healthcare } from "./healthcare.ts";
import { financialServices } from "./financial-services.ts";
import { localServices } from "./local-services.ts";
import { educationCoaching } from "./education-coaching.ts";
import { realEstate } from "./real-estate.ts";

export const industryConfigs: IndustryLayoutConfig[] = [
  saasB2B, professionalServices, ecommerceDTC, healthcare,
  financialServices, localServices, educationCoaching, realEstate,
];

export const industryConfigsById: Record<string, IndustryLayoutConfig> = industryConfigs.reduce(
  (acc, config) => { acc[config.id] = config; return acc; },
  {} as Record<string, IndustryLayoutConfig>,
);

export { saasB2B, professionalServices, ecommerceDTC, healthcare, financialServices, localServices, educationCoaching, realEstate };

export function getIndustryIds(): string[] { return industryConfigs.map((c) => c.id); }
export function getIndustryOptions(): Array<{ id: string; name: string }> { return industryConfigs.map((c) => ({ id: c.id, name: c.name })); }
export function getAllAliases(): Map<string, string> {
  const aliasMap = new Map<string, string>();
  for (const config of industryConfigs) {
    aliasMap.set(config.id.toLowerCase(), config.id);
    aliasMap.set(config.name.toLowerCase(), config.id);
    for (const alias of config.aliases) { aliasMap.set(alias.toLowerCase(), config.id); }
  }
  return aliasMap;
}