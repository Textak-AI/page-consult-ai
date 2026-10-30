/**
 * Product-page type & spacing tokens — the only place section components get
 * font sizes, line heights, margins and padding from. Values were taken from the
 * dominant usage across src/components/sections (unification, not redesign).
 * Marketing-site components do not use this module.
 */

/** Spacing rhythm in px. */
export const space = {
  xxs: 4,
  xs: 8,
  smx: 12,
  sm: 16,
  row: 20, // list rows (FAQ, process steps)
  card: 24, // card inner padding
  lg: 32,
  header: 56, // section header → content
  sectionY: 96, // section vertical padding (content-dense sections)
  sectionYCompact: 56, // sparse sections: headline + line + button
  gutter: 'clamp(24px, 6vw, 96px)', // section horizontal padding
} as const;

/** Ready-made spacing style fragments. */
export const spacing = {
  section: { padding: `${space.sectionY}px ${space.gutter}` },
  sectionCompact: { padding: `${space.sectionYCompact}px ${space.gutter}` },
  center: { margin: '0 auto' },
  headerBlock: { margin: `0 auto ${space.header}px` },
  titleGap: { margin: `0 0 ${space.xs}px` },
  rowY: { padding: `${space.row}px 0` },
  cardRow: { padding: `${space.row}px ${space.card}px` },
  cardRowBody: { padding: `0 ${space.card}px ${space.row}px` },
  statColumn: { padding: '0 clamp(16px, 3vw, 48px)' },
} as const;

/**
 * Type scale. clamp() values are fluid between breakpoints (375 → 1280+);
 * the *Class variants are the Tailwind per-breakpoint equivalents for class-based heroes.
 */
/** The page's two voices. Every serif heading on a page uses THIS stack —
 * never a second serif (the hero once used bare Georgia while sections used
 * Instrument Serif, splitting the page's voice). */
export const fontStacks = {
  serifDisplay: '"Instrument Serif", "Instrument Serif Fallback", Georgia, serif',
  sans: '"DM Sans", "DM Sans Fallback", system-ui, sans-serif',
} as const;

/**
 * Scoped CSS that unifies heading typography when the art director chose a
 * pairing. Legacy section components hardcode Inter/bold utility classes;
 * this brings them onto the page's single voice (mirrors themeFontCss's
 * !important pattern). Owner theme overrides are applied AFTER this, so the
 * owner still wins.
 */
export function typePairingCss(scope: string, pairing?: string | null): string {
  if (pairing !== 'serif-sans') return '';
  return (
    `${scope} :is(h1,h2),${scope} :is(h1,h2) *{font-family:${fontStacks.serifDisplay} !important;font-weight:400 !important;letter-spacing:-0.01em;}` +
    `${scope} h2{font-size:clamp(1.75rem, 3vw, 2.25rem) !important;}` +
    `${scope} h3{font-size:1.125rem !important;}`
  );
}

/** Industries whose pages earn a faint tactile grain overlay — the cheapest
 * counter to sterile "generated" flatness. Analytical/B2B variants never get
 * texture. Consumed by both renderers via the pc-grain class. */
export const warmTextureVariants = new Set(['creative', 'ecommerce', 'coaching', 'fitness', 'local-services']);

/** Whether a page gets the tactile grain. Sections carry the canonical
 * industry key ('ecommerce'); stored design intelligence may hold the raw
 * wizard label ('E-commerce / Retail'), so the section key wins. */
export function pageWantsGrain(sections: Array<{ content?: any }> | undefined, fallbackVariant?: string | null): boolean {
  const key = sections?.find((s) => typeof s?.content?.industryVariant === 'string')?.content.industryVariant || fallbackVariant || '';
  return warmTextureVariants.has(key);
}

export const typeScale = {
  display: { fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.08 },
  h1: { fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.15 },
  h2: { fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', lineHeight: 1.2 },
  h3: { fontSize: 17, fontWeight: 600 }, // line-height inherits (unchanged)
  lead: { fontSize: 16, lineHeight: 1.7 },
  body: { fontSize: 15, lineHeight: 1.7 },
  small: { fontSize: 13, lineHeight: 1.5 },
  eyebrow: { fontSize: 11 },
  index: { fontSize: 24 },
  indexMono: { fontSize: 14 },
  stat: { fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' },
  statCommand: { fontSize: 'clamp(3rem, 8vw, 6rem)' },
  statArchetype: { fontSize: 'var(--archetype-stat-size, 2.5rem)' },
} as const;

export const typeClass = {
  display: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]',
  leadLarge: 'text-lg md:text-xl leading-[1.75]',
  leadingDisplay: 'leading-[1.08]',
  leadingH1: 'leading-[1.15]',
} as const;

/** Radius & hairline conventions. */
export const shape = {
  radiusImage: 8,
  sampleAspectRatio: '4 / 3',
  radiusCard: 12,
  hairline: 1,
} as const;

/** Every photographic slot shares geometry; chroma lives in global semantic CSS. */
export const imageTreatment = { radius: shape.radiusImage, aspectRatio: shape.sampleAspectRatio, overlay: { restrained: 0, balanced: 0.06, expressive: 0.1 } } as const;

/**
 * Section surface rhythm. Each section type declares its surface; the tier
 * wrapper paints it so transitions are flush. Dark runs alternate deep /
 * elevated tiers so consecutive dark sections never read as one slab.
 * Section components that paint their own background override this.
 */
export type SectionSurface = 'deep' | 'elevated' | 'accent';
export const sectionSurface: Record<string, SectionSurface> = {
  hero: 'deep',
  'final-cta': 'deep',
  'beta-final-cta': 'deep',
  'problem-solution': 'accent',
  'the-real-challenge': 'accent',
  'stakes-amplify': 'accent',
};

/** Sparse section types get the compact padding step. */
export const sparseSectionTypes = new Set(['final-cta', 'beta-final-cta', 'stats-bar', 'credentials-bar']);

/** Visual-interest type steps (fluid, 375 → 1280+). */
export const featureType = {
  timelineNumeral: { fontSize: 'clamp(2.75rem, 6vw, 4.5rem)', lineHeight: 1 },
  pullQuote: { fontSize: 'clamp(1.5rem, 3.4vw, 2.5rem)', lineHeight: 1.3 },
} as const;

/**
 * Accent discipline: the brand accent colour is used ONLY in these slots.
 * Components take the accent from the page's primaryColor and apply it only here.
 */
export const ACCENT_SLOTS = ['eyebrow', 'timelineMarker', 'pullQuoteRule', 'cta', 'payoff', 'kicker', 'ambient'] as const;
export type AccentSlot = (typeof ACCENT_SLOTS)[number];
export const accentFor = (slot: AccentSlot, color: string) => (ACCENT_SLOTS.includes(slot) ? color : undefined);

/** Signature selection is a ceiling, not a quota: sparse input never earns filler. */
export const signatureTokens = {
  limits: { restrained: 3, balanced: 5, expressive: 6 },
  labels: { hero: 'The Opportunity', problem: 'The Challenge', guide: 'The Approach', plan: 'The Plan', outcome: 'The Payoff', proof: 'The Evidence', cta: 'The Next Step' },
  radius: 8,
  maxWidth: 1120,
} as const;
