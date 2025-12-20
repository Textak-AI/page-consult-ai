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
 * Sanitize a CSS value to prevent CSS injection attacks.
 * Only allows valid color formats (hex, rgb, rgba, hsl, hsla, named colors),
 * numeric values with units, and safe string values.
 */
function sanitizeCSSValue(value: string | number, type: 'color' | 'size' | 'font' | 'number' | 'shadow' | 'gradient'): string {
  // Convert numbers to strings
  const strValue = typeof value === 'number' ? String(value) : value;
  
  if (typeof strValue !== 'string') {
    console.warn('[DesignSystem] Invalid CSS value type:', typeof strValue);
    return type === 'color' ? '#000000' : '0';
  }

  const trimmed = strValue.trim();

  // Check for dangerous patterns that could break out of CSS context
  const dangerousPatterns = [
    /[{}]/,           // CSS block delimiters
    /;.*:/,           // Multiple property injection
    /url\s*\(/i,      // URL function (can exfiltrate data)
    /expression\s*\(/i, // IE expression
    /javascript:/i,   // JavaScript protocol
    /@import/i,       // CSS import
    /behavior\s*:/i,  // IE behavior
    /-moz-binding/i,  // Firefox XBL
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      console.warn('[DesignSystem] Potentially dangerous CSS value blocked:', trimmed);
      return type === 'color' ? '#000000' : '0';
    }
  }

  switch (type) {
    case 'color': {
      // Valid color formats: hex, rgb, rgba, hsl, hsla, named colors
      const validColorRegex = /^(#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)|[a-zA-Z]+)$/;
      if (!validColorRegex.test(trimmed)) {
        console.warn('[DesignSystem] Invalid color value:', trimmed);
        return '#000000';
      }
      return trimmed;
    }
    case 'size': {
      // Valid size formats: numbers with units (px, rem, em, %, vh, vw, etc.)
      const validSizeRegex = /^-?[\d.]+\s*(px|rem|em|%|vh|vw|vmin|vmax|ch|ex)?$/;
      if (!validSizeRegex.test(trimmed)) {
        console.warn('[DesignSystem] Invalid size value:', trimmed);
        return '0';
      }
      return trimmed;
    }
    case 'font': {
      // Font names: alphanumeric, spaces, quotes, hyphens, commas
      const validFontRegex = /^[\w\s"',-]+$/;
      if (!validFontRegex.test(trimmed)) {
        console.warn('[DesignSystem] Invalid font value:', trimmed);
        return 'sans-serif';
      }
      return trimmed;
    }
    case 'number': {
      // Pure numbers or numbers with simple units
      const validNumberRegex = /^-?[\d.]+\s*(px|rem|em|%|s|ms)?$/;
      if (!validNumberRegex.test(trimmed)) {
        console.warn('[DesignSystem] Invalid number value:', trimmed);
        return '0';
      }
      return trimmed;
    }
    case 'shadow': {
      // Box shadow: numbers, colors, and shadow keywords
      const validShadowRegex = /^(none|[\d.]+\s*(px|rem|em)?\s*)+\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\)|hsl[a]?\([^)]+\)|[a-zA-Z]+)?(\s*(inset))?$/i;
      // For complex shadows, just check for dangerous patterns (already done above)
      return trimmed;
    }
    case 'gradient': {
      // Gradients: linear-gradient, radial-gradient with safe color stops
      const validGradientRegex = /^(linear|radial|conic)-gradient\([^)]+\)$/i;
      if (!validGradientRegex.test(trimmed)) {
        console.warn('[DesignSystem] Invalid gradient value:', trimmed);
        return 'none';
      }
      return trimmed;
    }
    default:
      return trimmed;
  }
}

/**
 * Convert design system to CSS custom properties (variables)
 * These can be injected into a style tag or used with Tailwind
 */
export function designSystemToCSSVariables(system: DesignSystem): string {
  // Sanitize all values before interpolation
  const c = system.colors;
  const t = system.typography;
  const s = system.spacing;
  const comp = system.components;
  const img = system.imagery;

  return `
:root {
  /* Colors - Primary */
  --color-primary: ${sanitizeCSSValue(c.primary, 'color')};
  --color-primary-hover: ${sanitizeCSSValue(c.primaryHover, 'color')};
  --color-primary-muted: ${sanitizeCSSValue(c.primaryMuted, 'color')};
  
  /* Colors - Secondary */
  --color-secondary: ${sanitizeCSSValue(c.secondary, 'color')};
  --color-secondary-hover: ${sanitizeCSSValue(c.secondaryHover, 'color')};
  --color-secondary-muted: ${sanitizeCSSValue(c.secondaryMuted, 'color')};
  
  /* Colors - Background */
  --color-background: ${sanitizeCSSValue(c.background, 'color')};
  --color-background-alt: ${sanitizeCSSValue(c.backgroundAlt, 'color')};
  --color-surface: ${sanitizeCSSValue(c.surface, 'color')};
  --color-surface-hover: ${sanitizeCSSValue(c.surfaceHover, 'color')};
  
  /* Colors - Text */
  --color-text-primary: ${sanitizeCSSValue(c.textPrimary, 'color')};
  --color-text-secondary: ${sanitizeCSSValue(c.textSecondary, 'color')};
  --color-text-muted: ${sanitizeCSSValue(c.textMuted, 'color')};
  --color-text-inverse: ${sanitizeCSSValue(c.textInverse, 'color')};
  
  /* Colors - Semantic */
  --color-success: ${sanitizeCSSValue(c.success, 'color')};
  --color-warning: ${sanitizeCSSValue(c.warning, 'color')};
  --color-error: ${sanitizeCSSValue(c.error, 'color')};
  --color-info: ${sanitizeCSSValue(c.info, 'color')};
  
  /* Colors - Border */
  --color-border: ${sanitizeCSSValue(c.border, 'color')};
  --color-border-strong: ${sanitizeCSSValue(c.borderStrong, 'color')};
  
  /* Typography */
  --font-heading: ${sanitizeCSSValue(t.headingFont, 'font')};
  --font-body: ${sanitizeCSSValue(t.bodyFont, 'font')};
  --font-weight-heading: ${sanitizeCSSValue(t.headingWeight, 'number')};
  --font-weight-body: ${sanitizeCSSValue(t.bodyWeight, 'number')};
  --font-size-base: ${sanitizeCSSValue(t.baseSize, 'size')};
  --line-height-heading: ${sanitizeCSSValue(t.headingLineHeight, 'number')};
  --line-height-body: ${sanitizeCSSValue(t.bodyLineHeight, 'number')};
  --letter-spacing-heading: ${sanitizeCSSValue(t.headingLetterSpacing, 'size')};
  --letter-spacing-body: ${sanitizeCSSValue(t.bodyLetterSpacing, 'size')};
  
  /* Spacing */
  --spacing-section-y: ${sanitizeCSSValue(s.sectionPaddingY, 'size')};
  --spacing-section-x: ${sanitizeCSSValue(s.sectionPaddingX, 'size')};
  --spacing-container-max: ${sanitizeCSSValue(s.containerMaxWidth, 'size')};
  --spacing-card-padding: ${sanitizeCSSValue(s.cardPadding, 'size')};
  --spacing-card-gap: ${sanitizeCSSValue(s.cardGap, 'size')};
  --spacing-element-gap: ${sanitizeCSSValue(s.elementGap, 'size')};
  --spacing-stack-gap: ${sanitizeCSSValue(s.stackGap, 'size')};
  
  /* Components - Radius */
  --radius-small: ${sanitizeCSSValue(comp.radiusSmall, 'size')};
  --radius-medium: ${sanitizeCSSValue(comp.radiusMedium, 'size')};
  --radius-large: ${sanitizeCSSValue(comp.radiusLarge, 'size')};
  --radius-full: ${sanitizeCSSValue(comp.radiusFull, 'size')};
  
  /* Components - Shadow */
  --shadow-small: ${sanitizeCSSValue(comp.shadowSmall, 'shadow')};
  --shadow-medium: ${sanitizeCSSValue(comp.shadowMedium, 'shadow')};
  --shadow-large: ${sanitizeCSSValue(comp.shadowLarge, 'shadow')};
  
  /* Components - Border */
  --border-width: ${sanitizeCSSValue(comp.borderWidth, 'size')};
  
  /* Components - Icons */
  --icon-stroke-width: ${sanitizeCSSValue(comp.iconStrokeWidth, 'number')};
  
  /* Imagery */
  --image-overlay-opacity: ${sanitizeCSSValue(img.overlayOpacity, 'number')};
  --image-overlay-color: ${sanitizeCSSValue(img.overlayColor, 'color')};
  ${img.overlayGradient ? `--image-overlay-gradient: ${sanitizeCSSValue(img.overlayGradient, 'gradient')};` : ""}
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
