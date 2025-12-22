/**
 * Typography Scale - Consistent typography across all sections
 * 
 * Universal typography system that applies to ALL industry variants.
 * Each variant can override font families but sizing remains consistent.
 */

// Font size scale (rem units)
export const TYPOGRAPHY = {
  // Hero typography
  hero: {
    h1: 'text-4xl md:text-5xl lg:text-6xl',  // 36px → 48px → 60px
    subtitle: 'text-lg md:text-xl lg:text-2xl', // 18px → 20px → 24px
  },
  // Section typography
  section: {
    h2: 'text-3xl md:text-4xl',              // 30px → 36px
    h3: 'text-xl md:text-2xl',               // 20px → 24px
    body: 'text-base md:text-lg',            // 16px → 18px
    small: 'text-sm',                         // 14px
  },
  // Line heights
  lineHeight: {
    heading: 'leading-tight',   // 1.2
    body: 'leading-relaxed',    // 1.6
  },
  // Font weights
  weight: {
    heading: 'font-bold',       // 700
    subheading: 'font-semibold', // 600
    body: 'font-normal',        // 400
  },
} as const;

// Legacy export for backward compatibility
export const typographyScale = {
  // Headlines
  hero: 'text-4xl md:text-5xl lg:text-6xl font-bold leading-tight',
  sectionTitle: 'text-3xl md:text-4xl font-bold leading-tight',
  cardTitle: 'text-xl md:text-2xl font-semibold leading-snug',
  
  // Body text
  sectionSubtitle: 'text-lg md:text-xl text-muted-foreground leading-relaxed',
  bodyLarge: 'text-lg leading-relaxed',
  body: 'text-base leading-relaxed',
  bodySmall: 'text-sm leading-relaxed',
  
  // Labels & accents
  eyebrow: 'text-sm font-semibold uppercase tracking-wider',
  statValue: 'text-3xl md:text-4xl lg:text-5xl font-bold',
  statLabel: 'text-sm md:text-base',
  citation: 'text-xs',
};

// Consulting variant overrides (serif headlines for professional look)
export const consultingTypography = {
  ...typographyScale,
  hero: 'font-serif text-4xl md:text-5xl lg:text-6xl font-medium leading-tight',
  sectionTitle: 'font-serif text-3xl md:text-4xl font-medium leading-tight',
  cardTitle: 'text-xl md:text-2xl font-semibold leading-snug', // Keep sans for cards
};

/**
 * Get the appropriate typography scale based on industry variant
 */
export function getTypography(industryVariant?: string) {
  if (industryVariant === 'consulting') {
    return consultingTypography;
  }
  return typographyScale;
}

/**
 * Format a stat value - cleans up double-plus issues
 * Handles cases where the value already ends with "+" to avoid "500++"
 */
export function formatStatValue(value: string | number): string {
  const strValue = String(value);
  // Clean up any double-plus or triple-plus
  return strValue.replace(/\++$/, '+');
}

/**
 * Get typography classes for a specific element type
 */
export function getTypographyClasses(
  element: 'h1' | 'h2' | 'h3' | 'body' | 'eyebrow' | 'stat',
  variant?: 'consulting' | 'default'
): string {
  const isConsulting = variant === 'consulting';
  
  switch (element) {
    case 'h1':
      return isConsulting 
        ? 'font-serif text-4xl md:text-5xl lg:text-6xl font-medium leading-tight'
        : 'text-4xl md:text-5xl lg:text-6xl font-bold leading-tight';
    case 'h2':
      return isConsulting
        ? 'font-serif text-3xl md:text-4xl font-medium leading-tight'
        : 'text-3xl md:text-4xl font-bold leading-tight';
    case 'h3':
      return 'text-xl md:text-2xl font-semibold leading-snug';
    case 'body':
      return 'text-base md:text-lg leading-relaxed';
    case 'eyebrow':
      return 'text-sm font-semibold uppercase tracking-wider';
    case 'stat':
      return 'text-4xl md:text-5xl font-bold';
    default:
      return 'text-base leading-relaxed';
  }
}
