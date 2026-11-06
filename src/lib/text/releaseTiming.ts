/**
 * Time awareness for a stated date. The owner (or their site) says "Out October 27, 2026" and
 * asks for a "Pre-save" button; once that date has passed, the page must not keep promising a
 * future. The fact stays theirs — only its tense changes — and the ask becomes the plain verb
 * for work that is already out. Applied when the page is built and again when it renders, so a
 * page published before a release turns over on the day without a republish.
 */

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

function monthIndex(name: string): number {
  const n = name.toLowerCase().slice(0, 3);
  return MONTHS.findIndex((m) => m.startsWith(n));
}

export interface StatedDate {
  date: Date;
  /** 'day' when the owner gave a day; 'month' when only a month and year ("Out November 2026"). */
  precision: 'day' | 'month';
}

/** The calendar date inside a stated line, or null when the line carries no full date. */
export function parseStatedDate(line: string | null | undefined): StatedDate | null {
  if (!line) return null;
  const t = line.trim();
  let m = t.match(/\b([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(20\d\d)\b/);
  if (m && monthIndex(m[1]) >= 0) return { date: new Date(Number(m[3]), monthIndex(m[1]), Number(m[2])), precision: 'day' };
  m = t.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\.?,?\s+(20\d\d)\b/);
  if (m && monthIndex(m[2]) >= 0) return { date: new Date(Number(m[3]), monthIndex(m[2]), Number(m[1])), precision: 'day' };
  m = t.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d\d)\b/);
  if (m) return { date: new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2])), precision: 'day' };
  m = t.match(/\b([A-Za-z]{3,9})\.?\s+(20\d\d)\b/);
  if (m && monthIndex(m[1]) >= 0) return { date: new Date(Number(m[2]), monthIndex(m[1]) + 1, 0), precision: 'month' };
  return null;
}

export type ReleasePhase = 'upcoming' | 'today' | 'out';

export interface ReleaseTiming {
  phase: ReleasePhase;
  stated: StatedDate;
  /** The date as the owner wrote it, without the lead-in. */
  dateText: string;
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Where today sits against the stated date. Null when the line has no usable date. */
export function releaseTiming(line: string | null | undefined, now: Date = new Date()): ReleaseTiming | null {
  const stated = parseStatedDate(line);
  if (!stated || !line) return null;
  const today = startOfDay(now);
  const day = startOfDay(stated.date);
  const phase: ReleasePhase = day > today ? 'upcoming' : day === today && stated.precision === 'day' ? 'today' : 'out';
  const dateText = line.replace(/^\s*(?:out|available|releases?|released|launch(?:es|ing)?|coming|opens?|opening|starts?|starting|ships?|shipping|arrives?|drops?|live|on sale|in stores|streaming)\s+(?:on\s+|in\s+)?/i, '').trim();
  return { phase, stated, dateText };
}

/** The stated line in the right tense: verbatim while upcoming, "Released …" once it is out. */
export function timeAwareDateLine(line: string | null | undefined, now: Date = new Date()): string | null {
  if (!line) return null;
  const t = releaseTiming(line, now);
  if (!t) return line;
  if (t.phase === 'today') return `Out today — ${t.dateText}`;
  if (t.phase === 'out') return /^\s*released\b/i.test(line) ? line : `Released ${t.dateText}`;
  return line;
}

/** Asks that only make sense before a date. */
export const PRE_RELEASE_ASK = /\b(pre-?save|pre-?order|pre-?register|reserve|notify me|get notified|coming soon|remind me|sign up for the release)\b/i;

/** The plain verb for work that is out, by what it is. */
export function outNowAsk(industry?: string | null, subcategory?: string | null): string {
  const t = `${industry || ''} ${subcategory || ''}`.toLowerCase();
  if (/music|audio|record|album|podcast/.test(t)) return 'Listen';
  if (/film|video|movie|stream|tv|documentary/.test(t)) return 'Watch';
  if (/book|publish|author|writing|newsletter|comic/.test(t)) return 'Read';
  if (/game|gaming/.test(t)) return 'Play';
  return 'Get it';
}

export interface AskDecision {
  text: string;
  /** Present when the ask was changed, written for the owner's record. */
  note: string | null;
}

/**
 * The ask with the date taken into account: the owner's words while the date is ahead, the
 * out-now verb once it has passed, with the reason recorded.
 */
export function timeAwareAsk(ctaText: string | null | undefined, dateLine: string | null | undefined, industry?: string | null, subcategory?: string | null, now: Date = new Date(), verb?: string | null): AskDecision {
  const text = (ctaText || '').trim();
  const t = releaseTiming(dateLine, now);
  if (!text || !t || t.phase !== 'out' || !PRE_RELEASE_ASK.test(text)) return { text, note: null };
  const replacement = verb || outNowAsk(industry, subcategory);
  return { text: replacement, note: `The date you gave (${t.dateText}) has passed, so the button says “${replacement}”, not “${text}”.` };
}

/**
 * A section's content with the date taken into account at render time: the date line in the
 * right tense, a pre-release ask turned into the out-now verb once the date has passed. The
 * stored content is untouched; this runs wherever sections are drawn.
 */
export function timeAwareContent<T extends Record<string, any>>(content: T, now: Date = new Date()): T {
  if (!content || typeof content.dateLine !== 'string' || !content.dateLine) return content;
  const dateLine = timeAwareDateLine(content.dateLine, now);
  // Sections don't carry the industry; the verb was stored at build time, or the named platforms say what this is.
  const listenRow: string[] = Array.isArray(content.listenRow) ? content.listenRow : [];
  const verb = typeof content.outNowAsk === 'string' && content.outNowAsk
    ? content.outNowAsk
    : listenRow.some((n) => /spotify|apple music|bandcamp|tidal|deezer|soundcloud|youtube music|podcast/i.test(String(n))) ? 'Listen' : null;
  const ask = timeAwareAsk(content.ctaText, content.dateLine, content.industryCategory || content.industry, content.industrySubcategory, now, verb);
  if (dateLine === content.dateLine && !ask.note) return content;
  return { ...content, dateLine, ...(ask.note ? { ctaText: ask.text, askNote: ask.note } : {}) };
}
