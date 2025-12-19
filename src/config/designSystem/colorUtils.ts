// Color Utilities for PageConsult AI Brand Customization
// Handles validation, contrast checking, and color manipulation

/**
 * Validate hex color format
 */
export function isValidHex(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Normalize hex to 6-digit format
 */
export function normalizeHex(color: string): string {
  if (!isValidHex(color)) return color;

  // Expand 3-digit hex to 6-digit
  if (color.length === 4) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }

  return color.toUpperCase();
}

/**
 * Convert hex to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex(hex);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase()
  );
}

/**
 * Calculate relative luminance (for contrast calculations)
 * Based on WCAG 2.0 formula
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Returns value between 1 and 21
 * WCAG AA requires 4.5:1 for normal text, 3:1 for large text
 * WCAG AAA requires 7:1 for normal text, 4.5:1 for large text
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG standards
 */
export function meetsContrastStandard(
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA",
  largeText: boolean = false,
): boolean {
  const ratio = getContrastRatio(foreground, background);

  if (level === "AAA") {
    return largeText ? ratio >= 4.5 : ratio >= 7;
  }

  return largeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Get contrast rating description
 */
export function getContrastRating(
  foreground: string,
  background: string,
): {
  ratio: number;
  rating: "poor" | "fair" | "good" | "excellent";
  passesAA: boolean;
  passesAAA: boolean;
} {
  const ratio = getContrastRatio(foreground, background);

  let rating: "poor" | "fair" | "good" | "excellent";
  if (ratio < 3) rating = "poor";
  else if (ratio < 4.5) rating = "fair";
  else if (ratio < 7) rating = "good";
  else rating = "excellent";

  return {
    ratio: Math.round(ratio * 100) / 100,
    rating,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
  };
}

/**
 * Lighten a color by a percentage
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = percent / 100;
  const r = rgb.r + (255 - rgb.r) * factor;
  const g = rgb.g + (255 - rgb.g) * factor;
  const b = rgb.b + (255 - rgb.b) * factor;

  return rgbToHex(r, g, b);
}

/**
 * Darken a color by a percentage
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 - percent / 100;
  const r = rgb.r * factor;
  const g = rgb.g * factor;
  const b = rgb.b * factor;

  return rgbToHex(r, g, b);
}

/**
 * Generate a muted version of a color (for backgrounds)
 * Adds transparency via hex alpha
 */
export function getMutedColor(hex: string, opacity: number = 0.15): string {
  // Return as hex + alpha for CSS
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
  return `${normalizeHex(hex)}${alpha}`;
}

/**
 * Generate hover state color
 * Darkens light colors, lightens dark colors
 */
export function getHoverColor(hex: string): string {
  const luminance = getLuminance(hex);

  // If color is light, darken for hover
  // If color is dark, darken slightly (not lighten, as that often looks odd)
  return darkenColor(hex, luminance > 0.5 ? 15 : 10);
}

/**
 * Check if a color is "light" (for determining text color)
 */
export function isLightColor(hex: string): boolean {
  return getLuminance(hex) > 0.5;
}

/**
 * Get appropriate text color for a background
 */
export function getTextColorForBackground(background: string): string {
  return isLightColor(background) ? "#1E293B" : "#F1F5F9";
}

/**
 * Check if two colors are too similar
 */
export function areColorsTooSimilar(color1: string, color2: string): boolean {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return false;

  // Calculate Euclidean distance in RGB space
  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) + Math.pow(rgb1.g - rgb2.g, 2) + Math.pow(rgb1.b - rgb2.b, 2),
  );

  // If distance is less than ~50, colors are very similar
  return distance < 50;
}

/**
 * Suggest a complementary color
 * Simple hue shift approach
 */
export function getComplementaryColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  // Invert each channel
  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
}

/**
 * Generate a color palette from a primary color
 */
export function generatePaletteFromPrimary(primary: string): {
  primary: string;
  primaryHover: string;
  primaryMuted: string;
  suggestedSecondary: string;
  suggestedAccent: string;
} {
  return {
    primary: normalizeHex(primary),
    primaryHover: getHoverColor(primary),
    primaryMuted: getMutedColor(primary, 0.15),
    suggestedSecondary: getComplementaryColor(primary),
    suggestedAccent: lightenColor(primary, 30),
  };
}

/**
 * Validate a color palette for usability
 */
export function validatePalette(
  primary: string,
  secondary: string,
  background: string,
): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check primary on background
  const primaryContrast = getContrastRating(primary, background);
  if (!primaryContrast.passesAA) {
    issues.push(`Primary color has poor contrast on background (${primaryContrast.ratio}:1)`);
  }

  // Check if primary and secondary are too similar
  if (areColorsTooSimilar(primary, secondary)) {
    issues.push("Primary and secondary colors are too similar");
  }

  // Check text colors work
  const textOnBackground = getTextColorForBackground(background);
  const textContrast = getContrastRating(textOnBackground, background);
  if (!textContrast.passesAA) {
    issues.push("Text color contrast is insufficient for background");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
} // Color utilities will be added here
