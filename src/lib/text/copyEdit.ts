import { formatForHeadline } from '@/utils/formatForDisplay';

/**
 * Mechanical copy-edit for the user's own words when they go onto the page
 * verbatim (extractive strategy). Fixes keyboard slips only - capitalization,
 * apostrophes, a few unambiguous misspellings - and never changes meaning,
 * adds claims, or rewrites. 'there dog' -> 'their dog' is limited to common
 * possession nouns so the adverb 'there' is never touched.
 */
const SLIPS: Array<[RegExp, string]> = [
  [/\bi\b/g, 'I'],
  [/\bim\b/gi, "I'm"], [/\bive\b/gi, "I've"], [/\bid\b(?= (?:like|love|be|say|recommend))/gi, "I'd"],
  [/\bdont\b/gi, "don't"], [/\bcant\b/gi, "can't"], [/\bwont\b/gi, "won't"], [/\bdoesnt\b/gi, "doesn't"],
  [/\bisnt\b/gi, "isn't"], [/\bdidnt\b/gi, "didn't"], [/\barent\b/gi, "aren't"], [/\bwasnt\b/gi, "wasn't"],
  [/\bthats\b/gi, "that's"], [/\btheyre\b/gi, "they're"], [/\byoure\b/gi, "you're"], [/\bits\b(?= (?:a|an|the|not|been|going|quiet|done|easy|hard|free|over)\b)/gi, "it's"],
  [/\balot\b/gi, 'a lot'], [/\bu\b/g, 'you'], [/\bur\b/g, 'your'], [/\bcuz\b/gi, 'because'], [/\bthru\b/gi, 'through'],
  [/\bthere(?= (?:dog|dogs|pet|pets|cat|cats|kid|kids|child|children|home|house|car|team|business|family|kitchen|lawn|yard|money|time|own)\b)/gi, 'their'],
  [/\s+lol\b\.?/gi, ''],
];

const fixSlips = (text: string) => SLIPS.reduce((t, [re, to]) => t.replace(re, (m) => (to && m[0] === m[0].toUpperCase() && to[0] !== 'I' ? to[0].toUpperCase() + to.slice(1) : to)), text);

/** Prose: slips fixed, every sentence starts with a capital. */
export function copyEditProse(text: string): string {
  if (typeof text !== 'string' || !text.trim()) return text;
  const fixed = fixSlips(text.replace(/\s+/g, ' ').trim());
  return fixed.replace(/(^|[.!?]\s+)([a-z])/g, (_, lead, ch) => lead + ch.toUpperCase());
}

/** Labels (business names, buttons, short titles): title case when typed all-lowercase. */
export function copyEditLabel(text: string): string {
  if (typeof text !== 'string' || !text.trim()) return text;
  const fixed = fixSlips(text.trim());
  return /[A-Z]/.test(text) ? fixed : formatForHeadline(fixed);
}

const PROSE_FIELDS = ['subheadline', 'problem', 'solution', 'description', 'subtitle', 'subtext'];
const LABEL_FIELDS = ['ctaText', 'secondaryCta', 'secondaryCtaText', 'businessName', 'companyName', 'title'];

/** Final pass over mapped sections: copy-edit the fields that carry stated input verbatim. */
export function copyEditSections<T extends { content?: any }>(sections: T[]): T[] {
  return sections.map((s) => {
    if (!s?.content) return s;
    const content = { ...s.content };
    for (const k of PROSE_FIELDS) if (typeof content[k] === 'string') content[k] = copyEditProse(content[k]);
    for (const k of LABEL_FIELDS) if (typeof content[k] === 'string' && content[k].length <= 80) content[k] = copyEditLabel(content[k]);
    if (Array.isArray(content.features)) {
      content.features = content.features.map((f: any) => (f && typeof f === 'object'
        ? { ...f, ...(typeof f.title === 'string' ? { title: copyEditLabel(f.title) } : {}), ...(typeof f.description === 'string' ? { description: copyEditProse(f.description) } : {}) }
        : f));
    }
    return { ...s, content };
  });
}
