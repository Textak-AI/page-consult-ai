// PageConsult AI Design System
// Main export file

// Types
export type {
  DesignSystem,
  ColorPalette,
  Typography,
  Spacing,
  Components,
  Imagery,
  BrandOverrides,
  ToneModifiers,
  IndustryType,
  ToneType,
} from "./types";

// Industry Baselines
export { industryBaselines, getIndustryBaseline } from "./industryBaselines";

// Tone Modifiers
export { toneModifiers, applyToneModifiers, getToneModifier } from "./toneModifiers";

// Main Generator
export {
  generateDesignSystem,
  designSystemToCSSVariables,
  designSystemToTailwindConfig,
  getDesignSystemMetadata,
  type GenerateDesignSystemOptions,
} from "./generateDesignSystem";

// ============================================================================
// USAGE EXAMPLE
// ============================================================================
/*

import { generateDesignSystem, designSystemToCSSVariables } from './config/designSystem';

// In your page generation flow:

const designSystem = generateDesignSystem({
  industry: 'manufacturing-industrial',
  tone: 'authoritative',
  brandOverrides: {
    primaryColor: '#1E3A5F',  // From website extraction
    extractedColors: ['#1E3A5F', '#E85D04'],  // From logo
  },
});

// Generate CSS variables to inject into the page
const cssVariables = designSystemToCSSVariables(designSystem);

// Inject into page (in React):
// <style dangerouslySetInnerHTML={{ __html: cssVariables }} />

// Components then use CSS variables:
// background-color: var(--color-primary);
// font-family: var(--font-heading);
// border-radius: var(--radius-medium);

*/
