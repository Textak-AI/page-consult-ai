// Design System Type Definitions for PageConsult AI
// These types define the structure of our design token system

export interface ColorPalette {
  // Core brand colors
  primary: string; // Main brand color, CTAs, key actions
  primaryHover: string; // Primary hover state
  primaryMuted: string; // Subtle primary backgrounds

  secondary: string; // Supporting brand color, accents
  secondaryHover: string;
  secondaryMuted: string;

  // Backgrounds
  background: string; // Page background
  backgroundAlt: string; // Alternating section background
  surface: string; // Card/component background
  surfaceHover: string; // Card hover state

  // Text colors
  textPrimary: string; // Main body text
  textSecondary: string; // Muted/supporting text
  textMuted: string; // Very subtle text (captions, etc.)
  textInverse: string; // Text on dark backgrounds

  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Borders
  border: string; // Default border color
  borderStrong: string; // Emphasized borders
}

export interface Typography {
  // Font families
  headingFont: string; // Font for h1-h6
  bodyFont: string; // Font for body text

  // Font weights
  headingWeight: 400 | 500 | 600 | 700 | 800;
  bodyWeight: 400 | 500;

  // Base sizes (will be used with scale)
  baseSize: string; // Usually '16px' or '18px'

  // Line heights
  headingLineHeight: number; // e.g., 1.2
  bodyLineHeight: number; // e.g., 1.6

  // Letter spacing
  headingLetterSpacing: string; // e.g., '-0.02em' or 'normal'
  bodyLetterSpacing: string;

  // Style identifier for component logic
  style: "technical" | "refined" | "bold" | "friendly" | "elegant";
}

export interface Spacing {
  // Section padding
  sectionPaddingY: string; // Vertical padding for sections (e.g., '96px')
  sectionPaddingX: string; // Horizontal padding

  // Container
  containerMaxWidth: string; // e.g., '1200px'

  // Component spacing
  cardPadding: string; // Internal card padding
  cardGap: string; // Gap between cards in grid

  // Element spacing
  elementGap: string; // Gap between elements (e.g., icon to text)
  stackGap: string; // Vertical stack spacing

  // Density identifier
  density: "spacious" | "comfortable" | "compact";
}

export interface Components {
  // Border radius
  radiusSmall: string; // Buttons, inputs (e.g., '6px')
  radiusMedium: string; // Cards (e.g., '12px')
  radiusLarge: string; // Modals, hero elements (e.g., '24px')
  radiusFull: string; // Pills, avatars ('9999px')

  // Shadows
  shadowSmall: string; // Subtle elevation
  shadowMedium: string; // Cards
  shadowLarge: string; // Modals, dropdowns

  // Borders
  borderWidth: string; // Default border width

  // Icons
  iconStyle: "outline" | "solid" | "duotone";
  iconStrokeWidth: number; // For outline icons (1.5 or 2)

  // Buttons
  buttonStyle: "solid" | "gradient" | "outline";

  // Cards
  cardStyle: "flat" | "elevated" | "bordered" | "glass";
}

export interface Imagery {
  // Image treatment
  style: "photography" | "abstract" | "geometric" | "illustrations" | "minimal";

  // Overlay settings for hero/background images
  overlayOpacity: number; // 0 to 1
  overlayColor: string; // Usually matches background
  overlayGradient?: string; // Optional gradient overlay

  // Image filters
  treatment: "none" | "professional" | "vibrant" | "muted" | "duotone";
}

export interface DesignSystem {
  // Metadata
  id: string; // e.g., 'manufacturing-industrial'
  name: string; // e.g., 'Manufacturing & Industrial'
  description: string; // Brief description of the visual language

  // Core design tokens
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  components: Components;
  imagery: Imagery;
}

export interface BrandOverrides {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  extractedColors?: string[]; // Colors extracted from logo/website
}

export interface ToneModifiers {
  // Adjustments to apply based on tone
  headingWeightAdjust?: number; // e.g., +100 to make bolder
  contrastLevel?: "low" | "medium" | "high";
  spacingMultiplier?: number; // e.g., 1.1 for more spacious
  radiusAdjust?: string; // e.g., '+4px' for softer
  colorTemperature?: "cool" | "neutral" | "warm";
}

export type IndustryType =
  | "manufacturing-industrial"
  | "professional-services"
  | "healthcare-medical"
  | "saas-software"
  | "real-estate"
  | "legal-services"
  | "financial-services"
  | "ecommerce-retail"
  | "food-beverage"
  | "fitness-wellness"
  | "education-coaching"
  | "agency-creative"
  | "events-entertainment"
  | "default";

export type ToneType =
  | "professional"
  | "authoritative"
  | "friendly"
  | "warm"
  | "confident"
  | "innovative"
  | "luxurious"
  | "playful";
