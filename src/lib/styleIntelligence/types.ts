/**
 * STYLE INTELLIGENCE TYPES
 * 
 * Defines the structure for website inspiration capture and style blending.
 */

export interface StyleInspiration {
  // Core colors
  colors: {
    primary: string | null;
    secondary: string | null;
    accent: string | null;
    background: string | null;
    backgroundAlt: string | null;
    text: string | null;
    textMuted: string | null;
    all: string[];
  };
  
  // Typography
  typography: {
    headingFont: string;
    bodyFont: string;
    headingWeight: string;
    bodyWeight: string;
    headingSizes: { h1: string; h2: string; h3: string };
  };
  
  // Spacing & Layout
  spacing: {
    sectionPadding: string;
    cardPadding: string;
    gap: string;
    density: 'compact' | 'normal' | 'spacious';
  };
  
  // Component Styles
  components: {
    buttonRadius: string;
    buttonStyle: 'solid' | 'outline' | 'ghost' | 'gradient';
    cardRadius: string;
    cardShadow: string;
    cardBorder: boolean;
  };
  
  // Visual Effects
  effects: {
    hasGradients: boolean;
    hasGlassmorphism: boolean;
    hasShadows: boolean;
    shadowIntensity: 'subtle' | 'medium' | 'dramatic';
  };
  
  // Mood Classification
  mood: {
    primary: 'minimal' | 'bold' | 'elegant' | 'playful' | 'corporate' | 'creative' | 'tech';
    colorMode: 'light' | 'dark';
    contrast: 'low' | 'medium' | 'high';
  };
  
  // Meta
  sourceUrl: string;
  extractionConfidence: 'high' | 'medium' | 'low';
}

export interface BrandColors {
  primary: string;
  secondary?: string;
  accent?: string;
}

export interface BlendedStyle {
  // Final colors (brand takes priority, inspiration fills gaps)
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundAlt: string;
    text: string;
    textMuted: string;
  };
  
  // Typography from inspiration
  typography: StyleInspiration['typography'];
  
  // Component styles from inspiration
  components: StyleInspiration['components'];
  
  // Effects from inspiration
  effects: StyleInspiration['effects'];
  
  // Mood from inspiration
  mood: StyleInspiration['mood'];
  
  // Spacing from inspiration
  spacing: StyleInspiration['spacing'];
  
  // Source tracking
  sources: {
    colorsFrom: 'brand' | 'inspiration' | 'blended';
    typographyFrom: 'inspiration' | 'default';
    componentsFrom: 'inspiration' | 'default';
  };
}

export interface StyleInspirationInput {
  inspirationUrl: string;
  brandColors?: BrandColors;
  // If true, use inspiration colors as primary (not just accents)
  prioritizeInspirationColors?: boolean;
}

export interface StyleInspirationResult {
  success: boolean;
  error?: string;
  inspiration?: StyleInspiration;
  blendedStyle?: BlendedStyle;
}
