// PageConsult AI Design System
// Main export file for design tokens and generators

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

// Add to src/config/designSystem/index.ts

export {
  allFonts,
  sansSerifFonts,
  serifFonts,
  displayFonts,
  getRecommendedFonts,
  getDefaultFontPairing,
  getGoogleFontsUrl,
  industryFontPairings,
  type FontOption,
} from './fontOptions';

export {
  isValidHex,
  normalizeHex,
  hexToRgb,
  rgbToHex,
  getContrastRatio,
  meetsContrastStandard,
  getContrastRating,
  lightenColor,
  darkenColor,
  getHoverColor,
  isLightColor,
  getTextColorForBackground,
  areColorsTooSimilar,
  validatePalette,
} from './colorUtils';
```

---

## Then: Wire It Into the Flow

Once the files are pasted, send this to Lovable:
```
Integrate BrandCustomization into the consultation flow:

1. In the consultation wizard (or demo flow), add BrandCustomization as a step AFTER website intelligence extraction and BEFORE the main consultation questions.

2. Store the brandSettings output in consultation context/state:
   - Pass brandSettings to generateDesignSystem() as brandOverrides
   - Include in the data sent to generate-strategy-brief

3. The flow should be:
   - User enters URL → Extract intelligence
   - Show BrandCustomization screen with extracted colors
   - User approves/modifies → Continue to consultation
   - Brand settings carry through to page generation

4. If user clicks "Use Industry Defaults Instead", skip customization and use the industry baseline colors.
