/**
 * STYLE INTELLIGENCE TYPES
 * 
 * Defines the structure for website inspiration capture and style blending.
 * Supports Vision AI analysis for enhanced pattern recognition.
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
  
  // Vision AI enrichment (Phase 2)
  visionAnalysis?: {
    temperature?: 'neutral' | 'monochrome' | 'warm' | 'cool';
    fontStyle?: 'bold' | 'light' | 'serif' | 'sans-serif' | 'display';
    texture?: 'high' | 'medium' | 'subtle';
    layout?: 'balanced' | 'information-rich';
    imageStyle?: 'full-bleed' | 'contained' | 'mixed';
    elements?: 'geometric' | 'organic' | 'abstract';
    vibe?: 'luxurious' | 'minimalist' | 'playful' | 'professional' | 'tech' | 'creative';
    patterns?: string[]; // e.g., ["Stripe", "Linear", "Apple"]
  };
  
  // Meta
  sourceUrl: string;
  screenshotUrl?: string;
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
  // If true, use Vision AI for enhanced analysis
  useVisionAI?: boolean;
}

export interface StyleInspirationResult {
  success: boolean;
  error?: string;
  inspiration?: StyleInspiration;
  blendedStyle?: BlendedStyle;
}

// Database model for persisted inspiration sites
export interface InspirationSiteRecord {
  id: string;
  user_id: string;
  brand_id?: string | null;
  url: string;
  screenshot_url?: string | null;
  extracted_style: StyleInspiration | null;
  extraction_confidence?: 'high' | 'medium' | 'low' | null;
  created_at: string;
  updated_at: string;
}
