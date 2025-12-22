/**
 * Universal Spacing System
 * 
 * These values apply to ALL industry variants.
 * Provides consistent vertical rhythm and spatial relationships.
 */

export const SPACING = {
  // Section vertical padding
  sectionY: {
    sm: '64px',   // Compact sections (stats bar, logo bar)
    md: '96px',   // Standard sections
    lg: '128px',  // Hero, final CTA (breathing room)
  },
  
  // Internal spacing
  contentGap: {
    xs: '16px',   // Tight (icon + label)
    sm: '24px',   // Related elements
    md: '32px',   // Content blocks
    lg: '48px',   // Section subdivisions
    xl: '64px',   // Major content islands
  },
  
  // Max content width
  maxWidth: {
    prose: '720px',      // Text-heavy content
    content: '1024px',   // Standard sections
    wide: '1280px',      // Full-width sections
  },
} as const;

// Tailwind-compatible classes for spacing
export const spacingClasses = {
  // Section padding classes
  sectionSm: 'py-16',        // 64px
  sectionMd: 'py-24',        // 96px
  sectionLg: 'py-32',        // 128px
  
  // Content gap classes
  gapXs: 'gap-4',           // 16px
  gapSm: 'gap-6',           // 24px
  gapMd: 'gap-8',           // 32px
  gapLg: 'gap-12',          // 48px
  gapXl: 'gap-16',          // 64px
  
  // Max width classes
  maxProse: 'max-w-[720px]',
  maxContent: 'max-w-5xl',   // ~1024px
  maxWide: 'max-w-7xl',      // ~1280px
} as const;

/**
 * Get section padding based on section type
 */
export function getSectionPadding(sectionType: string): string {
  switch (sectionType) {
    case 'hero':
    case 'final-cta':
      return SPACING.sectionY.lg;
    case 'stats-bar':
    case 'credibility-strip':
      return SPACING.sectionY.sm;
    default:
      return SPACING.sectionY.md;
  }
}

/**
 * Get Tailwind padding class for section
 */
export function getSectionPaddingClass(sectionType: string): string {
  switch (sectionType) {
    case 'hero':
    case 'final-cta':
      return spacingClasses.sectionLg;
    case 'stats-bar':
    case 'credibility-strip':
      return spacingClasses.sectionSm;
    default:
      return spacingClasses.sectionMd;
  }
}

/**
 * Get max width based on content type
 */
export function getMaxWidthClass(contentType: 'prose' | 'content' | 'wide' = 'content'): string {
  return spacingClasses[`max${contentType.charAt(0).toUpperCase() + contentType.slice(1)}` as keyof typeof spacingClasses] as string;
}
