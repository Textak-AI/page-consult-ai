/**
 * Owner-chosen page theme overrides (brand colours + fonts), stored with the page in
 * `styles.theme`. Shared by the editor preview and the published renderer so both
 * resolve identically. Overrides win over saved/extracted brand colours and industry defaults.
 */
export interface PageTheme {
  primaryColor?: string;
  secondaryColor?: string;
  headingFont?: string; // a CURATED_FONTS id
  bodyFont?: string; // a CURATED_FONTS id
}

/** Only fonts index.html already loads. */
export const CURATED_FONTS = [
  { id: 'dm-sans', label: 'DM Sans', stack: '"DM Sans", "DM Sans Fallback", system-ui, sans-serif' },
  { id: 'inter', label: 'Inter', stack: '"Inter", system-ui, sans-serif' },
  { id: 'instrument-serif', label: 'Instrument Serif', stack: '"Instrument Serif", "Instrument Serif Fallback", Georgia, serif' },
  { id: 'playfair-display', label: 'Playfair Display', stack: '"Playfair Display", Georgia, serif' },
  { id: 'source-serif-4', label: 'Source Serif 4', stack: '"Source Serif 4", Georgia, serif' },
  { id: 'jetbrains-mono', label: 'JetBrains Mono', stack: '"JetBrains Mono", ui-monospace, monospace' },
] as const;

export const HERO_LAYOUTS = [
  { id: 'standard', label: 'Standard', composition: undefined },
  { id: 'centered-type', label: 'Centered type', composition: 'centered-type' },
  { id: 'split-photo', label: 'Split photo', composition: 'split-photo' },
] as const;

const HEX = /^#[0-9a-fA-F]{6}$/;
const fontById = (id?: string) => CURATED_FONTS.find((f) => f.id === id);

/** Keep only valid values (data comes from a jsonb column). */
export function cleanTheme(t: unknown): PageTheme {
  if (!t || typeof t !== 'object') return {};
  const o = t as Record<string, unknown>;
  const out: PageTheme = {};
  if (typeof o.primaryColor === 'string' && HEX.test(o.primaryColor)) out.primaryColor = o.primaryColor;
  if (typeof o.secondaryColor === 'string' && HEX.test(o.secondaryColor)) out.secondaryColor = o.secondaryColor;
  if (typeof o.headingFont === 'string' && fontById(o.headingFont)) out.headingFont = o.headingFont;
  if (typeof o.bodyFont === 'string' && fontById(o.bodyFont)) out.bodyFont = o.bodyFont;
  return out;
}

/** Override first, then the page's existing resolved value. */
export function resolveColors(theme: PageTheme, existing: { primary?: string | null; secondary?: string | null }) {
  return {
    primary: theme.primaryColor || existing.primary || null,
    secondary: theme.secondaryColor || existing.secondary || null,
  };
}

/** Find a curated font id from a CSS font-family string ("DM Sans", system-ui → dm-sans). */
export function fontIdFromStack(stack?: string | null): string | undefined {
  if (!stack) return undefined;
  const first = stack.split(',')[0].replace(/["']/g, '').trim().toLowerCase();
  return CURATED_FONTS.find((f) => f.label.toLowerCase() === first)?.id;
}

/** CSS that applies chosen fonts inside `scope`, beating per-component inline stacks. Empty when unset. */
export function themeFontCss(scope: string, theme: PageTheme): string {
  const body = fontById(theme.bodyFont);
  const heading = fontById(theme.headingFont);
  let css = '';
  if (body) {
    css += `${scope}{--font-body:${body.stack};}${scope},${scope} :is(p,li,span,a,button,input,textarea,label,blockquote,div){font-family:${body.stack} !important;}`;
  }
  if (heading) {
    css += `${scope}{--font-heading:${heading.stack};}${scope} :is(h1,h2,h3,h4,h5,h6),${scope} :is(h1,h2,h3,h4,h5,h6) *{font-family:${heading.stack} !important;}`;
  }
  return css;
}
