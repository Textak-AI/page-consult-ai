/**
 * SDI DYNAMIC DESIGN SYSTEM TYPES
 * 
 * Defines the structure for brand-driven visual systems that create
 * cohesive, premium experiences across all generated pages.
 */

/**
 * SDI Color Palette - Brand-driven colors for visual hierarchy
 */
export type ColorMode = 'light' | 'dark';

export interface SDIPalette {
  primary: string;           // Brand color or industry default
  primaryTint: string;       // primary @ 5-8% opacity for tinted backgrounds
  darkSection: string;       // For dark accent sections
  lightSection: string;      // White or warm white
  iconBg: string;            // Icon container background (primary @ 15%)
  iconColor: string;         // Icon color
  colorMode: ColorMode;      // Light or dark page mode
  altSectionBg: string;      // Alternating section bg (#f5f5f5 light, dark tint dark)
  cardStyle: 'light-shadow' | 'dark-border' | 'glass'; // Card treatment
  text: {
    onLight: string;         // Text on light backgrounds (#1e293b)
    onDark: string;          // Text on dark backgrounds (#ffffff)
    muted: string;           // Secondary/muted text (#64748b)
  };
}

/**
 * Section Theme Types - Visual treatment for each section
 */
export type SectionTheme = 'light' | 'tinted' | 'dark' | 'image';

/**
 * SDI Section Themes - Maps each section to its visual theme
 */
export interface SDISectionThemes {
  'hero': SectionTheme;
  'credentials-bar': SectionTheme;
  'the-real-challenge': SectionTheme;
  'our-approach': SectionTheme;
  'expertise-areas': SectionTheme;
  'client-results': SectionTheme;
  'engagement-model': SectionTheme;
  'faq': SectionTheme;
  'final-cta': SectionTheme;
  [key: string]: SectionTheme;
}

/**
 * SDI Typography - Tailwind class strings for consistent typography
 */
export interface SDITypography {
  heroHeadline: string;      // Tailwind classes for hero headlines
  sectionTitle: string;      // Tailwind classes for section titles
  sectionSubtitle: string;   // Tailwind classes for section subtitles
  cardTitle: string;         // Tailwind classes for card titles
  body: string;              // Tailwind classes for body text
}

/**
 * Complete SDI Design Configuration
 */
export interface SDIDesignConfig {
  palette: SDIPalette;
  sectionThemes: SDISectionThemes;
  typography: SDITypography;
}
