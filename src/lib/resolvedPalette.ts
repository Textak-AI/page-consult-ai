/**
 * RESOLVED PALETTE — Color Cascade Step 3
 * 
 * Bridges the gap between SDI color decisions and rendered components.
 * Built ONCE after SDI completes, then injected into every section's content.
 * 
 * Priority chain: brand extraction > SDI brand > industry default
 */

import type { SDIPalette } from '@/lib/designIntelligence/types';

export interface ResolvedPalette {
  // Mode
  colorMode: 'light' | 'dark';
  isLightMode: boolean;

  // Brand colors
  primaryColor: string;
  secondaryColor: string | null;
  accentColor: string | null;

  // Surface classes (derived from colorMode)
  cardBg: string;
  cardBgSolid: string;
  cardBgTinted: string;
  sectionBgAlt: string;

  // Text classes (derived from colorMode — ALWAYS opposite of surface)
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;

  // CTA colors (hex values for inline styles)
  ctaBg: string;
  ctaText: string;
  ctaHover: string;
  ctaSecondaryBorder: string;
  ctaSecondaryText: string;

  // Accent usage (hex values for inline styles)
  iconColor: string;
  borderAccent: string;
  glowColor: string;
  iconBgTint: string;

  // Brand assets
  logoUrl: string | null;
  companyName: string;
}

/**
 * Industry default primary colors — fallback when no brand color is detected
 */
const INDUSTRY_DEFAULT_COLORS: Record<string, string> = {
  consulting: '#1e3a5f',
  saas: '#6366f1',
  technology: '#6366f1',
  healthcare: '#0d9488',
  medical: '#0d9488',
  finance: '#1e40af',
  fintech: '#1e40af',
  manufacturing: '#374151',
  industrial: '#374151',
  ecommerce: '#7c3aed',
  retail: '#7c3aed',
  coaching: '#b45309',
  creative: '#db2777',
  realestate: '#0369a1',
  'real-estate': '#0369a1',
  legal: '#1e3a5f',
  education: '#0891b2',
  nonprofit: '#059669',
  hospitality: '#be185d',
  default: '#475569',
};

function getIndustryDefaultColor(industry: string): string {
  const key = industry?.toLowerCase() || 'default';
  return INDUSTRY_DEFAULT_COLORS[key] || INDUSTRY_DEFAULT_COLORS.default;
}

/**
 * Build the resolved palette from all available sources.
 * 
 * @param sdiPalette - SDI-generated palette (from designIntelligence)
 * @param brandPrimaryColor - Explicit brand color from extraction/settings
 * @param brandSecondaryColor - Secondary brand color if available
 * @param industry - Industry string for fallback defaults
 * @param logoUrl - Brand logo URL
 * @param companyName - Company name
 */
export function buildResolvedPalette(opts: {
  sdiPalette?: SDIPalette | null;
  brandPrimaryColor?: string | null;
  brandSecondaryColor?: string | null;
  brandAccentColor?: string | null;
  industry?: string;
  logoUrl?: string | null;
  companyName?: string;
}): ResolvedPalette {
  const {
    sdiPalette,
    brandPrimaryColor,
    brandSecondaryColor,
    brandAccentColor,
    industry = 'default',
    logoUrl = null,
    companyName = '',
  } = opts;

  // Priority: explicit brand color > SDI palette primary > industry default
  const primaryColor = brandPrimaryColor
    || sdiPalette?.primary
    || getIndustryDefaultColor(industry);

  const colorMode = sdiPalette?.colorMode || 'dark';
  const isLight = colorMode === 'light';

  const palette: ResolvedPalette = {
    colorMode,
    isLightMode: isLight,

    primaryColor,
    secondaryColor: brandSecondaryColor || null,
    accentColor: brandAccentColor || primaryColor,

    // Surfaces
    cardBg: isLight ? 'bg-white/90' : 'bg-slate-900/90',
    cardBgSolid: isLight ? 'bg-white' : 'bg-slate-900',
    cardBgTinted: isLight ? 'bg-gray-50' : 'bg-slate-800',
    sectionBgAlt: isLight ? 'bg-gray-50' : 'bg-slate-800/50',

    // Text — ALWAYS opposite of surface
    textPrimary: isLight ? 'text-gray-900' : 'text-white',
    textSecondary: isLight ? 'text-gray-600' : 'text-gray-300',
    textMuted: isLight ? 'text-gray-500' : 'text-gray-400',
    textOnPrimary: 'text-white',

    // CTAs — use brand primary
    ctaBg: primaryColor,
    ctaText: 'text-white',
    ctaHover: 'hover:opacity-90',
    ctaSecondaryBorder: primaryColor,
    ctaSecondaryText: primaryColor,

    // Accents
    iconColor: primaryColor,
    borderAccent: `${primaryColor}33`, // 20% opacity
    glowColor: `${primaryColor}4D`,   // 30% opacity
    iconBgTint: `${primaryColor}15`,  // ~8% opacity

    // Assets
    logoUrl,
    companyName,
  };

  console.log('🎨 [ResolvedPalette] Built:', {
    primaryColor: palette.primaryColor,
    colorMode: palette.colorMode,
    source: brandPrimaryColor ? 'brand-extraction' : sdiPalette?.primary ? 'sdi-palette' : 'industry-default',
    industry,
  });

  return palette;
}

/**
 * Inject resolved palette colors into a section content object.
 * This ensures every section gets primaryColor, secondaryColor, and colorMode
 * regardless of the mapping path (brief-first or legacy).
 */
export function injectPaletteIntoContent(
  content: Record<string, any>,
  palette: ResolvedPalette
): Record<string, any> {
  return {
    ...content,
    // Core colors — these override null values from the mapping pipeline
    primaryColor: content.primaryColor || palette.primaryColor,
    secondaryColor: content.secondaryColor || palette.secondaryColor,
    accentColor: content.accentColor || palette.accentColor,
    // Mode
    colorMode: content.colorMode || palette.colorMode,
    // Logo
    logoUrl: content.logoUrl || palette.logoUrl,
    // Resolved palette reference for components that want the full object
    resolvedPalette: palette,
  };
}
