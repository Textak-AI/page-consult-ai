/**
 * Typography Scale - Consistent typography across all sections
 * 
 * This ensures visual hierarchy is maintained throughout the page.
 */

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
