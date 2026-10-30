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
    imageStyle?: 'ambient-texture' | 'split-right' | 'none';
    imagePrompt?: string;
  };

  features: {
    layout: 'bento-grid' | 'numbered-list' | 'icon-cards' | 'spec-rows';
    background: 'dark' | 'light' | 'tinted';
    numbering: 'monospace' | 'accent-large' | 'none';
    iconStyle: 'none' | 'monochrome-bare' | 'accent-circle';
  };

  stats: {
    presentation: 'hairline-separated' | 'card-grid' | 'accent-strip';
    background: 'dark' | 'light' | 'brand';
    numberStyle: 'large-accent' | 'large-mono' | 'medium-bold';
    labelStyle: 'uppercase-small' | 'sentence-description' | 'minimal-muted';
  };

  process: {
    layout: 'numbered-rows' | 'stacked-cards' | 'minimal-list';
    background: 'dark' | 'light' | 'tinted';
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
        hero: { composition: 'centered-type', background: 'dark', hasGridTexture: true, hasAccentGlow: false, trustSignals: 'inline-checks', imageStyle: 'ambient-texture', imagePrompt: 'abstract dark geometric pattern, minimal lines, professional technology texture, deep shadows' },
        features: { layout: 'bento-grid', background: 'dark', numbering: 'monospace', iconStyle: 'none' },
        stats: { presentation: 'hairline-separated', background: 'dark', numberStyle: 'large-accent', labelStyle: 'minimal-muted' },
        process: { layout: 'numbered-rows', background: 'light', numbering: 'monospace' },
        faq: { layout: 'accordion-hairline', background: 'light' },
        finalCta: { layout: 'centered-minimal', background: 'dark', hasAccentGlow: true },
        typography: { pairing: 'sans-mono', headingWeight: 700, trackingStyle: 'tight' },
      };

    case 'Emotional Connector':
      return {
        designPhilosophy: 'organic',
        sectionRhythm: 'all-light',
        dividerSystem: 'whitespace',
        hero: { composition: 'split-photo', background: 'light', hasGridTexture: false, hasAccentGlow: false, trustSignals: 'inline-checks', imageStyle: 'split-right', imagePrompt: 'soft natural light, warm tones, inviting and human in scale' },
        features: { layout: 'icon-cards', background: 'tinted', numbering: 'none', iconStyle: 'accent-circle' },
        stats: { presentation: 'card-grid', background: 'brand', numberStyle: 'medium-bold', labelStyle: 'sentence-description' },
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
        typography: { pairing: 'sans-mono', headingWeight: 800, trackingStyle: 'tight' },
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
        typography: { pairing: 'serif-sans', headingWeight: 300, trackingStyle: 'normal' },
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
 * Apply Art Director compositional directives to a Section[] array.
 * Call this at the end of ANY mapping path to inject composition props.
 */
/**
 * Apply Brand DNA overrides to an Art Director brief.
 * DNA signals from actual CSS analysis override archetype defaults.
 */
export function applyBrandDNAOverrides(
  brief: ArtDirectorBrief,
  designDNA: any | null
): ArtDirectorBrief {
  if (!designDNA) return brief;

  const updated = { ...brief };
  const dna = designDNA;

  // ── Border System → accent bars vs hairlines vs none ──
  if (dna.borderSystem?.confidence > 0.4) {
    if (dna.borderSystem.style === 'accent') {
      (updated as any).dividerSystem = 'accent-border';
    }
    if (dna.borderSystem.style === 'structural') {
      updated.dividerSystem = 'hairlines';
    }
    if (dna.borderSystem.style === 'none') {
      updated.dividerSystem = 'whitespace';
    }
  }

  // ── Shadow System → flat vs elevated ──
  if (dna.shadowSystem?.confidence > 0.4) {
    if (dna.shadowSystem.style === 'none') {
      if (updated.designPhilosophy !== 'organic') updated.designPhilosophy = 'structural';
    }
    if (dna.shadowSystem.style === 'deep') {
      (updated as any).designPhilosophy = 'atmospheric';
    }
  }

  // ── Color Usage → brand-color section backgrounds ──
  if (dna.colorUsage?.confidence > 0.4) {
    if (dna.colorUsage.usesBrandBg) {
      updated.stats = { ...updated.stats, background: 'brand' };
    }
  }

  // ── Typography → serif/mono detection ──
  if (dna.typography?.confidence > 0.4) {
    if (dna.typography.usesSerif) {
      updated.typography = { ...updated.typography, pairing: 'serif-sans' };
    }
    if (dna.typography.usesMono) {
      updated.typography = { ...updated.typography, pairing: 'sans-mono' as any };
      updated.features = { ...updated.features, numbering: 'monospace' };
    }
  }

  // ── Aesthetic → overall feel ──
  if (dna.aesthetic?.confidence > 0.5) {
    if (dna.aesthetic.primary === 'warm') {
      updated.designPhilosophy = 'organic';
    }
    if (dna.aesthetic.primary === 'technical') {
      updated.designPhilosophy = 'structural';
    }
    if (dna.aesthetic.primary === 'editorial') {
      updated.typography = { ...updated.typography, pairing: 'serif-sans' };
    }
  }

  console.log('🎨 [ArtDirector] Brand DNA overrides applied:', {
    corners: dna.cornerRadius?.style,
    borders: dna.borderSystem?.style,
    shadows: dna.shadowSystem?.style,
    aesthetic: dna.aesthetic?.primary,
    usesBrandBg: dna.colorUsage?.usesBrandBg,
  });

  return updated;
}

export function applyArtDirectorDirectives(
  sections: any[],
  messagingArchitecture?: { archetype?: string } | null
): any[] {
  const archetype = messagingArchitecture?.archetype || archetypeFromStorage() || 'Analytical Validator';
  let artBrief = generateArtDirectorBrief(archetype);

  // Apply Brand DNA overrides if available
  try {
    const intel = localStorage.getItem('pageconsult_extracted_intelligence');
    if (intel) {
      const parsed = JSON.parse(intel);
      if (parsed.designDNA) {
        artBrief = applyBrandDNAOverrides(artBrief, parsed.designDNA);
        console.log('🎨 [ArtDirector] Brand DNA found and applied');
      }
    }
  } catch (e) {
    // Silently fail — storage may be unavailable
  }

  console.log('🎨🎨🎨 [ArtDirector] EXECUTING — sections count:', sections.length, '| archetype:', archetype);
  console.log('🎨 [ArtDirector] Brief generated:', artBrief.designPhilosophy, '| Hero:', artBrief.hero.composition, '| Features:', artBrief.features.layout);

  const planned = sections.map(section => {
    const type = section.type;
    let directives: Record<string, any> = {};

    if (type === 'hero') {
      directives = {
        composition: artBrief.hero.composition,
        sectionBackground: artBrief.hero.background,
        hasGridTexture: artBrief.hero.hasGridTexture,
        hasAccentGlow: artBrief.hero.hasAccentGlow,
        trustSignals: artBrief.hero.trustSignals,
        imageStyle: artBrief.hero.imageStyle || 'none',
        imagePrompt: artBrief.hero.imagePrompt || '',
        typographyPairing: artBrief.typography.pairing,
        headingWeight: artBrief.typography.headingWeight,
        trackingStyle: artBrief.typography.trackingStyle,
        dividerSystem: artBrief.dividerSystem,
      };
    } else if (type === 'features') {
      directives = {
        featureLayout: artBrief.features.layout,
        sectionBackground: artBrief.features.background,
        numbering: artBrief.features.numbering,
        iconStyle: artBrief.features.iconStyle,
        borderSystem: artBrief.dividerSystem,
        typographyPairing: artBrief.typography.pairing,
        headingWeight: artBrief.typography.headingWeight,
        trackingStyle: artBrief.typography.trackingStyle,
      };
    } else if (type === 'stats-bar') {
      directives = {
        statsPresentation: artBrief.stats.presentation,
        sectionBackground: artBrief.stats.background,
        numberStyle: artBrief.stats.numberStyle,
        labelStyle: artBrief.stats.labelStyle,
      };
    } else if (type === 'how-it-works') {
      directives = {
        processLayout: artBrief.process.layout,
        sectionBackground: artBrief.process.background,
        numbering: artBrief.process.numbering,
        typographyPairing: artBrief.typography.pairing,
        headingWeight: artBrief.typography.headingWeight,
        trackingStyle: artBrief.typography.trackingStyle,
      };
    } else if (type === 'faq') {
      directives = {
        faqLayout: artBrief.faq.layout,
        sectionBackground: artBrief.faq.background,
        typographyPairing: artBrief.typography.pairing,
        headingWeight: artBrief.typography.headingWeight,
        trackingStyle: artBrief.typography.trackingStyle,
      };
    } else if (type === 'final-cta') {
      directives = {
        ctaLayout: artBrief.finalCta.layout,
        sectionBackground: artBrief.finalCta.background,
        hasAccentGlow: artBrief.finalCta.hasAccentGlow,
        typographyPairing: artBrief.typography.pairing,
        headingWeight: artBrief.typography.headingWeight,
      };
    } else if (type === 'problem-solution') {
      directives = {
        composition: 'two-column',
        sectionBackground: artBrief.process.background,
      };
    }

    return {
      ...section,
      content: {
        ...section.content,
        ...directives,
      },
    };
  }).map((section, _i, mapped) => {
    // ── Single visual director ───────────────────────────────────────────
    // The brief above only covers the section types it names; anything else
    // (social-proof, credentials-bar, ...) previously fell back to SDI's
    // separate mode opinion — the "two directors" bug. Here the plan is made
    // complete: the page mode comes from the brief's declared backgrounds,
    // uncovered sections inherit the page flavor, and every section's `mode`
    // is DERIVED from its resolved background so surface and ink always
    // agree. Downstream (renderers, components) must obey, never re-decide.
    const declared = mapped
      .map(sec => sec?.content?.sectionBackground)
      .filter((b: any): b is string => typeof b === 'string' && b.length > 0);
    const darkCount = declared.filter(b => b === 'dark' || b === 'brand').length;
    const pageMode: 'light' | 'dark' = declared.length > 0 && darkCount > declared.length / 2 ? 'dark' : 'light';
    const bg = section.content.sectionBackground || (pageMode === 'dark' ? 'dark' : 'light');
    const mode = bg === 'dark' || bg === 'brand' ? 'dark' : 'light';
    return {
      ...section,
      content: { ...section.content, sectionBackground: bg, mode, pageMode },
    };
  });
  return applySurfaceRhythm(planned);
}

/** 
 * Section background style helper.
 * Returns raw color values for sub-components to apply via inline styles.
 */
/**
 * When the art director assigned per-section backgrounds, those decide the
 * page's base mode: a light/tinted-led palette means a light page, whatever
 * the SDI default said. Returns null when no section carries a declared
 * background (legacy pages), letting callers fall back to SDI.
 */
export function artDirectedMode(sections: Array<{ content?: any }>): 'light' | 'dark' | null {
  // Pages stamped by the completed art-director plan carry pageMode directly.
  const stamped = sections.find(s => s?.content?.pageMode === 'light' || s?.content?.pageMode === 'dark');
  if (stamped) return stamped.content.pageMode;
  // Legacy pages: majority of whatever backgrounds were declared.
  const declared = sections
    .map(s => s?.content?.sectionBackground)
    .filter((b): b is string => typeof b === 'string' && b.length > 0);
  if (declared.length === 0) return null;
  const dark = declared.filter(b => b === 'dark' || b === 'brand').length;
  return dark > declared.length / 2 ? 'dark' : 'light';
}

/**
 * Surface rhythm (part of the art director's plan, deterministic):
 * - adjacent light sections alternate light / tinted, so section edges read;
 * - on light-led pages the close becomes the one deep, brand-colored moment.
 * Mode is re-derived from the resulting background so surface and ink agree.
 * Renderers apply this at display time so saved pages benefit without
 * regeneration; the director applies it to new plans.
 */
export function applySurfaceRhythm<T extends { type: string; content?: any }>(sections: T[]): T[] {
  const pageMode = artDirectedMode(sections);
  let prev: string | null = null;
  return sections.map((section) => {
    const planned = section.content?.sectionBackground;
    if (!planned) { prev = null; return section; }
    let bg: string = planned;
    const isClose = section.type === 'final-cta' || section.type === 'beta-final-cta';
    if (isClose && pageMode === 'light' && bg === 'light') bg = 'dark';
    else if (bg === 'light' && prev === 'light') bg = 'tinted';
    prev = bg;
    if (bg === planned) return section;
    const mode = bg === 'dark' || bg === 'brand' ? 'dark' : 'light';
    return { ...section, content: { ...section.content, sectionBackground: bg, mode } };
  });
}

/** applySurfaceRhythm over render order, returned in the ORIGINAL array order
 * (editor update handlers address sections by array index). Idempotent. */
export function withSurfaceRhythm<T extends { type: string; order: number; visible?: boolean; content?: any }>(sections: T[]): T[] {
  const ordered = sections.map((s, i) => ({ s, i })).filter((x) => x.s.visible !== false).sort((a, b) => a.s.order - b.s.order);
  const rhythmic = applySurfaceRhythm(ordered.map((x) => x.s));
  const out = [...sections];
  ordered.forEach((x, k) => { out[x.i] = rhythmic[k]; });
  return out;
}

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
        // Brand-deep, not neutral black: the client's color sunk into near-black
        bg: primaryColor ? `color-mix(in srgb, ${primaryColor} 22%, #0B0D14)` : '#0A0A0A',
        text: '#F1F5F9',
        textMuted: 'rgba(255,255,255,0.70)',
        border: 'rgba(255,255,255,0.06)',
      };
    case 'light':
      return {
        bg: '#F8F9FA',
        text: '#1A1A2E',
        textMuted: 'rgba(26,26,46,0.72)',
        border: 'rgba(0,0,0,0.06)',
      };
    case 'tinted':
      return {
        // A visible brand wash (the old 2% alpha was indistinguishable from white)
        bg: primaryColor ? `color-mix(in srgb, ${primaryColor} 6%, #FFFFFF)` : '#F5F3FF',
        text: '#1A1A2E',
        textMuted: 'rgba(26,26,46,0.72)',
        border: 'rgba(0,0,0,0.04)',
      };
    case 'brand':
      return {
        bg: primaryColor || '#56276B',
        text: '#FFFFFF',
        textMuted: 'rgba(255,255,255,0.75)',
        border: 'rgba(255,255,255,0.15)',
      };
    default:
      return {
        bg: '#0A0A0A',
        text: '#F1F5F9',
        textMuted: 'rgba(255,255,255,0.70)',
        border: 'rgba(255,255,255,0.06)',
      };
  }
}
