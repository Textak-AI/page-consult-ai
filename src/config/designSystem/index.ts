// Design System Exports
// src/config/designSystem/index.ts

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

// Design System Generator
export {
  generateDesignSystem,
  designSystemToCSSVariables,
  designSystemToTailwindConfig,
  getDesignSystemMetadata,
  type GenerateDesignSystemOptions,
} from "./generateDesignSystem";

// Industry Design Intelligence
export {
  industryDesignIntelligence,
  getDesignIntelligence,
  generateDesignBriefContext,
  type DesignIntelligence,
} from "./industryDesignIntelligence";

// Font Options
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
} from "./fontOptions";

// Color Utilities
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
} from "./colorUtils";
