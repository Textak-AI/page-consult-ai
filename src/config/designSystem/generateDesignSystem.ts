// Design System Generator for PageConsult AI
// Combines industry baseline + brand overrides + tone modifiers to produce final design tokens

import { DesignSystem, BrandOverrides, IndustryType, ToneType, ColorPalette } from "./types";
import { getIndustryBaseline } from "./industryBaselines";
import { applyToneModifiers } from "./toneModifiers";

export interface GenerateDesignSystemOptions {
  industry: IndustryType | string;
  tone?: ToneType | string;
  brandOverrides?: BrandOverrides;
}

/**
 * Generate a complete design system from inputs
 *
 * Priority order:
 * 1. Start with industry baseline
 * 2. Apply brand color overrides (if provided)
 * 3. Apply tone modifiers
 *
 * @param options - Industry, tone, and optional brand overrides
 * @returns Complete DesignSystem ready for CSS variable generation
 */
export function generateDesignSystem(options: GenerateDesignSystemOptions): DesignSystem {
  const { industry, tone = "professional", brandOverrides } = options;

  // Step 1: Get industry baseline
  let designSystem = getIndustryBaseline(industry);
  console.log(`[DesignSystem] Starting with ${designSystem.id} baseline`);

  // Step 2: Apply brand color overrides
  if (brandOverrides) {
    designSystem = applyBrandOverrides(designSystem, brandOverrides);
    console.log(`[DesignSystem] Applied brand overrides`);
  }

  // Step 3: Apply tone modifiers
  designSystem = applyToneModifiers(designSystem, tone);
  console.log(`[DesignSystem] Applied ${tone} tone modifiers`);

  return designSystem;
}

/**
 * Apply brand-specific color overrides to a design system
 */
function applyBrandOverrides(baseline: DesignSystem, overrides: BrandOverrides): DesignSystem {
  // Deep clone
  const modified = JSON.parse(JSON.stringify(baseline)) as DesignSystem;

  // Override primary color if provided
  if (overrides.primaryColor) {
    modified.colors.primary = overrides.primaryColor;
    modified.colors.primaryHover = darkenColor(overrides.primaryColor, 10);
    modified.colors.primaryMuted = `${overrides.primaryColor}15`;
  }

  // Override secondary color if provided
  if (overrides.secondaryColor) {
    modified.colors.secondary = overrides.secondaryColor;
    modified.colors.secondaryHover = darkenColor(overrides.secondaryColor, 10);
    modified.colors.secondaryMuted = `${overrides.secondaryColor}15`;
  }

  // If we have extracted colors from logo, use them intelligently
  if (overrides.extractedColors && overrides.extractedColors.length > 0) {
    // Use first extracted color as primary if no explicit primary set
    if (!overrides.primaryColor && overrides.extractedColors[0]) {
      modified.colors.primary = overrides.extractedColors[0];
      modified.colors.primaryHover = darkenColor(overrides.extractedColors[0], 10);
      modified.colors.primaryMuted = `${overrides.extractedColors[0]}15`;
    }

    // Use second extracted color as secondary if available
    if (!overrides.secondaryColor && overrides.extractedColors[1]) {
      modified.colors.secondary = overrides.extractedColors[1];
      modified.colors.secondaryHover = darkenColor(overrides.extractedColors[1], 10);
      modified.colors.secondaryMuted = `${overrides.extractedColors[1]}15`;
    }
  }

  return modified;
}

/**
 * Simple color darkening function
 * For production, use a proper color library like chroma.js
 */
function darkenColor(hex: string, percent: number): string {
  // Remove # if present
  const color = hex.replace("#", "");

  // Parse RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Darken
  const factor = 1 - percent / 100;
  const newR = Math.round(r * factor);
  const newG = Math.round(g * factor);
  const newB = Math.round(b * factor);

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

/**
 * Convert design system to CSS custom properties (variables)
 * These can be injected into a style tag or used with Tailwind
 */
export function designSystemToCSSVariables(system: DesignSystem): string {
  return `
:root {
  /* Colors - Primary */
  --color-primary: ${system.colors.primary};
  --color-primary-hover: ${system.colors.primaryHover};
  --color-primary-muted: ${system.colors.primaryMuted};
  
  /* Colors - Secondary */
  --color-secondary: ${system.colors.secondary};
  --color-secondary-hover: ${system.colors.secondaryHover};
  --color-secondary-muted: ${system.colors.secondaryMuted};
  
  /* Colors - Background */
  --color-background: ${system.colors.background};
  --color-background-alt: ${system.colors.backgroundAlt};
  --color-surface: ${system.colors.surface};
  --color-surface-hover: ${system.colors.surfaceHover};
  
  /* Colors - Text */
  --color-text-primary: ${system.colors.textPrimary};
  --color-text-secondary: ${system.colors.textSecondary};
  --color-text-muted: ${system.colors.textMuted};
  --color-text-inverse: ${system.colors.textInverse};
  
  /* Colors - Semantic */
  --color-success: ${system.colors.success};
  --color-warning: ${system.colors.warning};
  --color-error: ${system.colors.error};
  --color-info: ${system.colors.info};
  
  /* Colors - Border */
  --color-border: ${system.colors.border};
  --color-border-strong: ${system.colors.borderStrong};
  
  /* Typography */
  --font-heading: ${system.typography.headingFont};
  --font-body: ${system.typography.bodyFont};
  --font-weight-heading: ${system.typography.headingWeight};
  --font-weight-body: ${system.typography.bodyWeight};
  --font-size-base: ${system.typography.baseSize};
  --line-height-heading: ${system.typography.headingLineHeight};
  --line-height-body: ${system.typography.bodyLineHeight};
  --letter-spacing-heading: ${system.typography.headingLetterSpacing};
  --letter-spacing-body: ${system.typography.bodyLetterSpacing};
  
  /* Spacing */
  --spacing-section-y: ${system.spacing.sectionPaddingY};
  --spacing-section-x: ${system.spacing.sectionPaddingX};
  --spacing-container-max: ${system.spacing.containerMaxWidth};
  --spacing-card-padding: ${system.spacing.cardPadding};
  --spacing-card-gap: ${system.spacing.cardGap};
  --spacing-element-gap: ${system.spacing.elementGap};
  --spacing-stack-gap: ${system.spacing.stackGap};
  
  /* Components - Radius */
  --radius-small: ${system.components.radiusSmall};
  --radius-medium: ${system.components.radiusMedium};
  --radius-large: ${system.components.radiusLarge};
  --radius-full: ${system.components.radiusFull};
  
  /* Components - Shadow */
  --shadow-small: ${system.components.shadowSmall};
  --shadow-medium: ${system.components.shadowMedium};
  --shadow-large: ${system.components.shadowLarge};
  
  /* Components - Border */
  --border-width: ${system.components.borderWidth};
  
  /* Components - Icons */
  --icon-stroke-width: ${system.components.iconStrokeWidth};
  
  /* Imagery */
  --image-overlay-opacity: ${system.imagery.overlayOpacity};
  --image-overlay-color: ${system.imagery.overlayColor};
  ${system.imagery.overlayGradient ? `--image-overlay-gradient: ${system.imagery.overlayGradient};` : ""}
}
`.trim();
}

/**
 * Convert design system to a Tailwind-compatible config object
 * Useful if we want to extend Tailwind with our design tokens
 */
export function designSystemToTailwindConfig(system: DesignSystem): object {
  return {
    colors: {
      primary: {
        DEFAULT: system.colors.primary,
        hover: system.colors.primaryHover,
        muted: system.colors.primaryMuted,
      },
      secondary: {
        DEFAULT: system.colors.secondary,
        hover: system.colors.secondaryHover,
        muted: system.colors.secondaryMuted,
      },
      background: {
        DEFAULT: system.colors.background,
        alt: system.colors.backgroundAlt,
      },
      surface: {
        DEFAULT: system.colors.surface,
        hover: system.colors.surfaceHover,
      },
      text: {
        primary: system.colors.textPrimary,
        secondary: system.colors.textSecondary,
        muted: system.colors.textMuted,
        inverse: system.colors.textInverse,
      },
      border: {
        DEFAULT: system.colors.border,
        strong: system.colors.borderStrong,
      },
    },
    fontFamily: {
      heading: [system.typography.headingFont],
      body: [system.typography.bodyFont],
    },
    fontWeight: {
      heading: system.typography.headingWeight,
      body: system.typography.bodyWeight,
    },
    borderRadius: {
      small: system.components.radiusSmall,
      medium: system.components.radiusMedium,
      large: system.components.radiusLarge,
      full: system.components.radiusFull,
    },
    boxShadow: {
      small: system.components.shadowSmall,
      medium: system.components.shadowMedium,
      large: system.components.shadowLarge,
    },
  };
}

/**
 * Get design metadata for debugging/display
 */
export function getDesignSystemMetadata(system: DesignSystem): {
  id: string;
  name: string;
  description: string;
  typographyStyle: string;
  spacingDensity: string;
  iconStyle: string;
  cardStyle: string;
  imageryStyle: string;
} {
  return {
    id: system.id,
    name: system.name,
    description: system.description,
    typographyStyle: system.typography.style,
    spacingDensity: system.spacing.density,
    iconStyle: system.components.iconStyle,
    cardStyle: system.components.cardStyle,
    imageryStyle: system.imagery.style,
  };
}
