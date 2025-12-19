// Tone Modifiers for PageConsult AI Design System
// These adjustments are applied on top of industry baselines based on the tone from the strategy brief

import { ToneType, ToneModifiers, DesignSystem } from "./types";

/**
 * Tone modifier definitions
 * Each tone adjusts the baseline design system to better match the messaging tone
 */
export const toneModifiers: Record<ToneType, ToneModifiers> = {
  /**
   * Professional
   * Clean, credible, business-appropriate
   * No dramatic changes - lets industry baseline speak
   */
  professional: {
    headingWeightAdjust: 0,
    contrastLevel: "high",
    spacingMultiplier: 1.0,
    radiusAdjust: "0px",
    colorTemperature: "neutral",
  },

  /**
   * Authoritative
   * Bold, confident, expert positioning
   * Stronger typography, more contrast, generous spacing
   */
  authoritative: {
    headingWeightAdjust: 100, // Make headings bolder
    contrastLevel: "high",
    spacingMultiplier: 1.15, // More whitespace = confidence
    radiusAdjust: "-2px", // Slightly sharper = more serious
    colorTemperature: "neutral",
  },

  /**
   * Friendly
   * Approachable, warm, conversational
   * Softer edges, warmer colors, comfortable spacing
   */
  friendly: {
    headingWeightAdjust: -100, // Slightly lighter headings
    contrastLevel: "medium",
    spacingMultiplier: 1.05,
    radiusAdjust: "+4px", // Rounder = friendlier
    colorTemperature: "warm",
  },

  /**
   * Warm
   * Caring, empathetic, human
   * Like friendly but more personal
   */
  warm: {
    headingWeightAdjust: -100,
    contrastLevel: "medium",
    spacingMultiplier: 1.1,
    radiusAdjust: "+6px",
    colorTemperature: "warm",
  },

  /**
   * Confident
   * Self-assured, direct, no hedging
   * Strong visual presence
   */
  confident: {
    headingWeightAdjust: 100,
    contrastLevel: "high",
    spacingMultiplier: 1.1,
    radiusAdjust: "0px",
    colorTemperature: "neutral",
  },

  /**
   * Innovative
   * Forward-thinking, cutting-edge, modern
   * Bold colors, contemporary typography
   */
  innovative: {
    headingWeightAdjust: 0,
    contrastLevel: "high",
    spacingMultiplier: 0.95, // Tighter = more modern
    radiusAdjust: "+4px", // Rounder = contemporary
    colorTemperature: "cool",
  },

  /**
   * Luxurious
   * Premium, exclusive, high-end
   * Generous spacing, refined typography, subtle elements
   */
  luxurious: {
    headingWeightAdjust: -100, // Lighter = more elegant
    contrastLevel: "medium",
    spacingMultiplier: 1.25, // Lots of whitespace
    radiusAdjust: "-2px", // Subtle rounding
    colorTemperature: "warm",
  },

  /**
   * Playful
   * Fun, energetic, youthful
   * Bold colors, rounded shapes, dynamic
   */
  playful: {
    headingWeightAdjust: 100,
    contrastLevel: "high",
    spacingMultiplier: 0.9,
    radiusAdjust: "+8px", // Very rounded
    colorTemperature: "warm",
  },
};

/**
 * Apply tone modifiers to a design system
 */
export function applyToneModifiers(baseline: DesignSystem, tone: ToneType | string): DesignSystem {
  // Normalize tone string
  const normalizedTone = tone.toLowerCase() as ToneType;
  const modifiers = toneModifiers[normalizedTone] || toneModifiers.professional;

  // Deep clone the baseline
  const modified = JSON.parse(JSON.stringify(baseline)) as DesignSystem;

  // Apply heading weight adjustment
  if (modifiers.headingWeightAdjust) {
    const newWeight = modified.typography.headingWeight + modifiers.headingWeightAdjust;
    // Clamp between 400-800
    modified.typography.headingWeight = Math.max(400, Math.min(800, newWeight)) as 400 | 500 | 600 | 700 | 800;
  }

  // Apply spacing multiplier
  if (modifiers.spacingMultiplier && modifiers.spacingMultiplier !== 1) {
    modified.spacing.sectionPaddingY = multiplyPixelValue(
      modified.spacing.sectionPaddingY,
      modifiers.spacingMultiplier,
    );
    modified.spacing.cardPadding = multiplyPixelValue(modified.spacing.cardPadding, modifiers.spacingMultiplier);
    modified.spacing.cardGap = multiplyPixelValue(modified.spacing.cardGap, modifiers.spacingMultiplier);
  }

  // Apply radius adjustment
  if (modifiers.radiusAdjust && modifiers.radiusAdjust !== "0px") {
    modified.components.radiusSmall = adjustPixelValue(modified.components.radiusSmall, modifiers.radiusAdjust);
    modified.components.radiusMedium = adjustPixelValue(modified.components.radiusMedium, modifiers.radiusAdjust);
    modified.components.radiusLarge = adjustPixelValue(modified.components.radiusLarge, modifiers.radiusAdjust);
  }

  // Apply color temperature shift
  if (modifiers.colorTemperature && modifiers.colorTemperature !== "neutral") {
    modified.colors = adjustColorTemperature(modified.colors, modifiers.colorTemperature);
  }

  return modified;
}

// Helper: Multiply a pixel value (e.g., '24px' * 1.1 = '26px')
function multiplyPixelValue(value: string, multiplier: number): string {
  const numericValue = parseInt(value.replace("px", ""));
  return `${Math.round(numericValue * multiplier)}px`;
}

// Helper: Add/subtract from pixel value (e.g., '12px' + '+4px' = '16px')
function adjustPixelValue(value: string, adjustment: string): string {
  const baseValue = parseInt(value.replace("px", ""));
  const adjustValue = parseInt(adjustment.replace("px", "").replace("+", ""));
  const newValue = Math.max(0, baseValue + adjustValue);
  return `${newValue}px`;
}

// Helper: Shift colors warmer or cooler
function adjustColorTemperature(colors: DesignSystem["colors"], temperature: "warm" | "cool"): DesignSystem["colors"] {
  // For now, return as-is. Full implementation would shift hues.
  // Warm: shift toward orange/yellow
  // Cool: shift toward blue/purple

  // This is a placeholder for more sophisticated color manipulation
  // Could use a library like chroma.js or culori for proper hue shifting

  return colors;
}

// Export helper to get modifier by tone
export function getToneModifier(tone: ToneType | string): ToneModifiers {
  const normalizedTone = tone.toLowerCase() as ToneType;
  return toneModifiers[normalizedTone] || toneModifiers.professional;
}
