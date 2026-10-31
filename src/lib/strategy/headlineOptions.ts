// Voice Resonance (Pillar 4) headline options on the Strategy Document, built
// from the owner's stated answers. The old builder spliced fragments into
// templates ("Built for {audience} who demand {lowercased clause}", "The only
// platform {audience} trust", 8-word cut-offs), which produced garbled text and
// claims nobody made. Here each option is one whole stated sentence, kept
// verbatim apart from first-letter case and their->your re-addressing.

import { truncateAtBoundary } from '../text/truncate';
import { toReader } from '../composition/communicationStrategy';

export interface HeadlineOption { headline: string; reasoning: string }

const ABBREV = /\b(?:e\.g|i\.e|etc|vs|inc|ltd|co|dr|mr|mrs|ms|st|u\.s|no)\.$/i;

/** First whole sentence, without its end punctuation. Decimals ($2.5M) and common abbreviations do not end a sentence. */
export function firstSentence(text: string | null | undefined): string {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (!t) return '';
  const re = /[.!?](?=\s|$)/g;
  let m: RegExpExecArray | null;
  let end = t.length;
  while ((m = re.exec(t))) {
    const upto = t.slice(0, m.index + 1);
    if (m[0] === '.' && ABBREV.test(upto)) continue;
    end = m.index;
    break;
  }
  let s = t.slice(0, end).trim();
  const semi = s.indexOf(';');
  if (semi > 0) s = s.slice(0, semi).trim();
  return s.replace(/[.!?,:;\s]+$/, '');
}

export function capitalizeFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Lowercase only an ordinary leading word: "IT directors" and "B2B teams" stay as typed. */
export function lowerFirstSafe(s: string): string {
  const first = s.split(/\s+/)[0] || '';
  if (/\d/.test(first) || /^[A-Z]{2,}/.test(first) || /^[A-Z][a-z]*[A-Z]/.test(first)) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

const clean = (text: string | null | undefined, max = 90) =>
  truncateAtBoundary(capitalizeFirst(firstSentence(text)), max);

export function buildHeadlineOptions(input: {
  valueProp?: string | null;
  challenge?: string | null;
  edge?: string | null;
}): HeadlineOption[] {
  const out: HeadlineOption[] = [];
  const push = (headline: string, reasoning: string) => {
    if (headline && !out.some((o) => o.headline.toLowerCase() === headline.toLowerCase())) out.push({ headline, reasoning });
  };
  if (input.valueProp) push(clean(input.valueProp), 'Your stated value, as you wrote it');
  if (input.challenge) push(truncateAtBoundary(capitalizeFirst(toReader(firstSentence(input.challenge))), 90), 'The frustration you described, said to the buyer');
  if (input.edge) push(clean(input.edge), 'What you said sets you apart');
  return out;
}

export function buildSubheadline(input: { valueProp?: string | null; audience?: string | null }): string {
  const vp = clean(input.valueProp, 120);
  const aud = input.audience ? lowerFirstSafe(truncateAtBoundary(firstSentence(input.audience), 80)) : '';
  if (vp && aud) return `${vp}. Built for ${aud}.`;
  if (vp) return `${vp}.`;
  return '';
}
