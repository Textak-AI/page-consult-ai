/**
 * STYLE BLENDING ENGINE
 * 
 * Combines inspiration visual DNA with brand colors.
 * Brand colors take priority, inspiration fills gaps and provides:
 * - Typography
 * - Component styles
 * - Visual effects
 * - Spacing patterns
 */

import type { StyleInspiration, BrandColors, BlendedStyle } from './types';

// Default fallback values
const DEFAULTS = {
  colors: {
    primary: '#7C3AED',
    secondary: '#4F46E5',
    accent: '#06B6D4',
    background: '#0F172A',
    backgroundAlt: '#1E293B',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    headingWeight: '700',
    bodyWeight: '400',
    headingSizes: { h1: '48px', h2: '36px', h3: '24px' },
  },
  components: {
    buttonRadius: '8px',
    buttonStyle: 'solid' as const,
    cardRadius: '12px',
    cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    cardBorder: false,
  },
  effects: {
    hasGradients: true,
    hasGlassmorphism: false,
    hasShadows: true,
    shadowIntensity: 'medium' as const,
  },
  spacing: {
    sectionPadding: '80px',
    cardPadding: '24px',
    gap: '24px',
    density: 'normal' as const,
  },
  mood: {
    primary: 'corporate' as const,
    colorMode: 'dark' as const,
    contrast: 'medium' as const,
  },
};

/**
 * Helper to adjust a color's luminance
 */
function adjustColorLuminance(hex: string, factor: number): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Adjust
  const adjust = (c: number) => Math.min(255, Math.max(0, Math.round(c * factor)));
  
  // Convert back to hex
  return '#' + [adjust(r), adjust(g), adjust(b)]
    .map(c => c.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

/**
 * Generate complementary colors from a primary color
 */
function generateComplementaryColor(hex: string): string {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Rotate hue by approximately 180 degrees in a simple way
  // This is a simplified approach - a full HSL conversion would be more accurate
  return '#' + [255 - r, 255 - g, 255 - b]
    .map(c => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

/**
 * Blend inspiration style with brand colors
 */
export function blendStyleWithBrand(
  inspiration: StyleInspiration | null,
  brandColors: BrandColors,
  options: { prioritizeInspirationColors?: boolean } = {}
): BlendedStyle {
  const { prioritizeInspirationColors = false } = options;
  
  // Start with defaults
  const result: BlendedStyle = {
    colors: { ...DEFAULTS.colors },
    typography: { ...DEFAULTS.typography },
    components: { ...DEFAULTS.components },
    effects: { ...DEFAULTS.effects },
    mood: { ...DEFAULTS.mood },
    spacing: { ...DEFAULTS.spacing },
    sources: {
      colorsFrom: 'brand',
      typographyFrom: 'default',
      componentsFrom: 'default',
    },
  };
  
  // === COLORS ===
  // Brand colors always take priority for primary
  result.colors.primary = brandColors.primary;
  
  if (brandColors.secondary) {
    result.colors.secondary = brandColors.secondary;
  } else if (inspiration?.colors.secondary && prioritizeInspirationColors) {
    result.colors.secondary = inspiration.colors.secondary;
    result.sources.colorsFrom = 'blended';
  } else {
    // Generate from primary
    result.colors.secondary = adjustColorLuminance(brandColors.primary, 0.8);
  }
  
  if (brandColors.accent) {
    result.colors.accent = brandColors.accent;
  } else if (inspiration?.colors.accent && prioritizeInspirationColors) {
    result.colors.accent = inspiration.colors.accent;
    result.sources.colorsFrom = 'blended';
  } else {
    // Generate complementary accent
    result.colors.accent = generateComplementaryColor(brandColors.primary);
  }
  
  // Background colors from inspiration if available
  if (inspiration?.colors.background) {
    result.colors.background = inspiration.colors.background;
    result.sources.colorsFrom = 'blended';
  }
  if (inspiration?.colors.backgroundAlt) {
    result.colors.backgroundAlt = inspiration.colors.backgroundAlt;
  }
  if (inspiration?.colors.text) {
    result.colors.text = inspiration.colors.text;
  }
  if (inspiration?.colors.textMuted) {
    result.colors.textMuted = inspiration.colors.textMuted;
  }
  
  // === TYPOGRAPHY ===
  if (inspiration?.typography) {
    result.typography = { ...inspiration.typography };
    result.sources.typographyFrom = 'inspiration';
  }
  
  // === COMPONENTS ===
  if (inspiration?.components) {
    result.components = { ...inspiration.components };
    result.sources.componentsFrom = 'inspiration';
  }
  
  // === EFFECTS ===
  if (inspiration?.effects) {
    result.effects = { ...inspiration.effects };
  }
  
  // === MOOD ===
  if (inspiration?.mood) {
    result.mood = { ...inspiration.mood };
  }
  
  // === SPACING ===
  if (inspiration?.spacing) {
    result.spacing = { ...inspiration.spacing };
  }
  
  return result;
}

/**
 * Generate CSS variables from blended style
 */
export function generateCSSFromBlendedStyle(style: BlendedStyle): Record<string, string> {
  return {
    // Colors
    '--color-primary': style.colors.primary,
    '--color-secondary': style.colors.secondary,
    '--color-accent': style.colors.accent,
    '--color-background': style.colors.background,
    '--color-background-alt': style.colors.backgroundAlt,
    '--color-text': style.colors.text,
    '--color-text-muted': style.colors.textMuted,
    
    // Typography
    '--font-heading': style.typography.headingFont,
    '--font-body': style.typography.bodyFont,
    '--font-heading-weight': style.typography.headingWeight,
    '--font-body-weight': style.typography.bodyWeight,
    '--font-size-h1': style.typography.headingSizes.h1,
    '--font-size-h2': style.typography.headingSizes.h2,
    '--font-size-h3': style.typography.headingSizes.h3,
    
    // Components
    '--button-radius': style.components.buttonRadius,
    '--card-radius': style.components.cardRadius,
    '--card-shadow': style.components.cardShadow,
    
    // Spacing
    '--section-padding': style.spacing.sectionPadding,
    '--card-padding': style.spacing.cardPadding,
    '--gap': style.spacing.gap,
  };
}

/**
 * Map blended style to style preset name
 */
export function mapBlendedStyleToPreset(style: BlendedStyle): 'premium' | 'minimal' | 'bold' | 'elegant' {
  switch (style.mood.primary) {
    case 'minimal':
      return 'minimal';
    case 'bold':
    case 'playful':
      return 'bold';
    case 'elegant':
      return 'elegant';
    case 'tech':
    case 'creative':
    case 'corporate':
    default:
      return 'premium';
  }
}
