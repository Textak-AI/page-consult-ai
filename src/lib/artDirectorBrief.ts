/**
 * Art Director Compositional Brief
 * 
 * Generates structural layout directives based on buyer archetype.
 * These directives control HOW sections render (layout composition),
 * not WHAT they say (that's messaging architecture) or HOW they're styled (that's archetype CSS).
 */

export interface ArtDirectorBrief {
  designPhilosophy: 'structural' | 'atmospheric' | 'bold' | 'organic' | 'minimal';
  sectionRhythm: 'dark-light-alternating' | 'all-dark' | 'all-light';
  dividerSystem: 'hairlines' | 'whitespace' | 'color-shift';

  hero: {
    composition: 'centered-type' | 'split-photo' | 'minimal-bold' | 'editorial-stack';
    background: 'dark' | 'light';
    hasGridTexture: boolean;
    hasAccentGlow: boolean;
    trustSignals: 'inline-checks' | 'logo-bar' | 'none';
  };

  features: {
    layout: 'bento-grid' | 'numbered-list' | 'icon-cards' | 'spec-rows';
    background: 'dark' | 'light' | 'tinted';
    numbering: 'monospace' | 'accent-large' | 'none';
    iconStyle: 'none' | 'monochrome-bare' | 'accent-circle';
  };

  stats: {
    presentation: 'hairline-separated' | 'card-grid' | 'accent-strip';
    background: 'dark' | 'light';
    numberStyle: 'large-accent' | 'large-mono' | 'medium-bold';
    labelStyle: 'uppercase-small' | 'sentence-description' | 'minimal-muted';
  };

  process: {
    layout: 'numbered-rows' | 'stacked-cards' | 'minimal-list';
    background: 'dark' | 'light';
    numbering: 'monospace' | 'accent-large' | 'none';
  };

  faq: {
    layout: 'accordion-hairline' | 'accordion-card';
    background: 'dark' | 'light' | 'tinted';
  };

  finalCta: {
    layout: 'centered-minimal' | 'bold-statement';
    background: 'dark' | 'light';
    hasAccentGlow: boolean;
  };

  typography: {
    pairing: 'serif-sans' | 'all-sans' | 'sans-mono';
    headingWeight: number;
    trackingStyle: 'tight' | 'normal';
  };
}

export function generateArtDirectorBrief(archetype: string): ArtDirectorBrief {
  console.log('🎨 [ArtDirector] Generating brief for archetype:', archetype);

  switch (archetype) {
    case 'Analytical Validator':
      return {
        designPhilosophy: 'structural',
        sectionRhythm: 'dark-light-alternating',
        dividerSystem: 'hairlines',
        hero: { composition: 'centered-type', background: 'dark', hasGridTexture: true, hasAccentGlow: false, trustSignals: 'inline-checks' },
        features: { layout: 'bento-grid', background: 'dark', numbering: 'monospace', iconStyle: 'none' },
        stats: { presentation: 'hairline-separated', background: 'dark', numberStyle: 'large-accent', labelStyle: 'minimal-muted' },
        process: { layout: 'numbered-rows', background: 'light', numbering: 'monospace' },
        faq: { layout: 'accordion-hairline', background: 'light' },
        finalCta: { layout: 'centered-minimal', background: 'dark', hasAccentGlow: true },
        typography: { pairing: 'serif-sans', headingWeight: 400, trackingStyle: 'tight' },
      };

    case 'Emotional Connector':
      return {
        designPhilosophy: 'organic',
        sectionRhythm: 'all-light',
        dividerSystem: 'whitespace',
        hero: { composition: 'split-photo', background: 'light', hasGridTexture: false, hasAccentGlow: false, trustSignals: 'inline-checks' },
        features: { layout: 'icon-cards', background: 'tinted', numbering: 'none', iconStyle: 'accent-circle' },
        stats: { presentation: 'card-grid', background: 'light', numberStyle: 'medium-bold', labelStyle: 'sentence-description' },
        process: { layout: 'stacked-cards', background: 'tinted', numbering: 'accent-large' },
        faq: { layout: 'accordion-card', background: 'light' },
        finalCta: { layout: 'centered-minimal', background: 'light', hasAccentGlow: false },
        typography: { pairing: 'serif-sans', headingWeight: 500, trackingStyle: 'normal' },
      };

    case 'Decisive Commander':
      return {
        designPhilosophy: 'bold',
        sectionRhythm: 'dark-light-alternating',
        dividerSystem: 'color-shift',
        hero: { composition: 'minimal-bold', background: 'dark', hasGridTexture: false, hasAccentGlow: false, trustSignals: 'logo-bar' },
        features: { layout: 'spec-rows', background: 'dark', numbering: 'none', iconStyle: 'monochrome-bare' },
        stats: { presentation: 'accent-strip', background: 'dark', numberStyle: 'large-mono', labelStyle: 'uppercase-small' },
        process: { layout: 'minimal-list', background: 'light', numbering: 'monospace' },
        faq: { layout: 'accordion-hairline', background: 'light' },
        finalCta: { layout: 'bold-statement', background: 'dark', hasAccentGlow: false },
        typography: { pairing: 'all-sans', headingWeight: 800, trackingStyle: 'tight' },
      };

    case 'Cautious Researcher':
    default:
      return {
        designPhilosophy: 'minimal',
        sectionRhythm: 'all-light',
        dividerSystem: 'hairlines',
        hero: { composition: 'editorial-stack', background: 'light', hasGridTexture: false, hasAccentGlow: false, trustSignals: 'inline-checks' },
        features: { layout: 'numbered-list', background: 'tinted', numbering: 'accent-large', iconStyle: 'accent-circle' },
        stats: { presentation: 'card-grid', background: 'light', numberStyle: 'medium-bold', labelStyle: 'sentence-description' },
        process: { layout: 'numbered-rows', background: 'light', numbering: 'accent-large' },
        faq: { layout: 'accordion-card', background: 'light' },
        finalCta: { layout: 'centered-minimal', background: 'light', hasAccentGlow: false },
        typography: { pairing: 'all-sans', headingWeight: 600, trackingStyle: 'normal' },
      };
  }
}

/** Helper: Read archetype from localStorage messaging architecture cache */
export function archetypeFromStorage(): string | null {
  try {
    const stored = localStorage.getItem('pageconsult_messaging_architecture');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed.timestamp && Date.now() - parsed.timestamp < 2 * 60 * 60 * 1000) {
      return parsed.primary?.archetype || null;
    }
  } catch {
    // Silently fail — storage may be unavailable
  }
  return null;
}

/** 
 * Section background style helper.
 * Returns raw color values for sub-components to apply via inline styles.
 */
export function getSectionBackgroundStyles(
  background: 'dark' | 'light' | 'tinted' | string,
  primaryColor?: string
): {
  bg: string;
  text: string;
  textMuted: string;
  border: string;
} {
  switch (background) {
    case 'dark':
      return {
        bg: '#0A0A0A',
        text: '#F1F5F9',
        textMuted: 'rgba(255,255,255,0.45)',
        border: 'rgba(255,255,255,0.06)',
      };
    case 'light':
      return {
        bg: '#F8F9FA',
        text: '#1A1A2E',
        textMuted: 'rgba(26,26,46,0.55)',
        border: 'rgba(0,0,0,0.06)',
      };
    case 'tinted':
      return {
        bg: primaryColor ? `${primaryColor}06` : '#F5F3FF',
        text: '#1A1A2E',
        textMuted: 'rgba(26,26,46,0.5)',
        border: 'rgba(0,0,0,0.04)',
      };
    default:
      return {
        bg: '#0A0A0A',
        text: '#F1F5F9',
        textMuted: 'rgba(255,255,255,0.45)',
        border: 'rgba(255,255,255,0.06)',
      };
  }
}
