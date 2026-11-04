import { getOfferKind } from '@/lib/wizard/industryWording';

/**
 * The visual register: the look the page wears, chosen from the reader's world, not the
 * owner's category alone. The owner's own words about their audience are the evidence,
 * and the page's record quotes them, so the explainer can say why the page looks this way.
 *
 * Today one register exists beyond the archetype defaults: 'immersive' for creative work
 * (records, films, books, games) whose readers listen, watch or read for the feeling.
 */
export type VisualRegister = 'immersive';

export interface VisualRegisterDecision {
  register: VisualRegister;
  /** Fixed label for the look. */
  label: string;
  /** The owner's own words that argued for it (verbatim fragments, up to three). */
  cues: string[];
}

export const REGISTER_LABEL: Record<VisualRegister, string> = {
  immersive: 'Dark, immersive, type-led',
};

/** Words an owner uses when their audience comes for an experience rather than a result. */
const IMMERSIVE_CUES = /\b(headphones?|lights? (?:low|off|down)|late at night|at night|after dark|in the dark|dark(?:ness)?|strange|drones?|ambient|atmosphere|atmospheric|immersive|cinematic|mood|moody|quiet|slow|loud|warm|cold|hypnotic|trance|dream|listen(?:ing|ers?)?|watch(?:ing)?|read(?:ing|ers)?|album|record|film|novel|score|tape|vinyl|textures?|noise|drift|haze|glow|neon|club|dancefloor|basement|room|building)\b/i;

const AUDIENCE_FIELDS = ['audienceWorld', 'idealClient', 'clientFrustration', 'desiredOutcome'] as const;

/** A short verbatim fragment around a matched cue: the clause it sits in, trimmed to ~80 chars. */
function fragmentAround(text: string, index: number): string {
  const start = Math.max(0, Math.max(text.lastIndexOf('.', index), text.lastIndexOf(',', index), text.lastIndexOf(';', index)) + 1);
  const endCandidates = [text.indexOf('.', index), text.indexOf(',', index), text.indexOf(';', index)].filter((i) => i >= 0);
  const end = endCandidates.length ? Math.min(...endCandidates) : text.length;
  let frag = text.slice(start, end).trim();
  if (frag.length > 80) {
    const at = Math.max(0, index - start - 30);
    frag = frag.slice(at, at + 80).trim();
    if (at > 0) frag = '…' + frag;
    if (at + 80 < text.slice(start, end).trim().length) frag = frag + '…';
  }
  return frag;
}

export function inferVisualRegister(consultation: Record<string, any> | null | undefined): VisualRegisterDecision | null {
  if (!consultation) return null;
  const kind = getOfferKind(consultation.industryCategory || consultation.industry, consultation.industrySubcategory);
  if (kind !== 'creative') return null;
  const cues: string[] = [];
  for (const f of AUDIENCE_FIELDS) {
    const text = typeof consultation[f] === 'string' ? consultation[f] : '';
    if (!text) continue;
    const re = new RegExp(IMMERSIVE_CUES.source, 'gi');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) && cues.length < 3) {
      const frag = fragmentAround(text, m.index);
      if (frag && !cues.some((c) => c === frag || c.includes(frag) || frag.includes(c))) cues.push(frag);
    }
    if (cues.length >= 3) break;
  }
  return { register: 'immersive', label: REGISTER_LABEL.immersive, cues };
}

/** The sentence the record shows under the look. Fixed words plus the owner's quoted cues. */
export function registerBecause(d: VisualRegisterDecision | null): string | null {
  if (!d) return null;
  if (!d.cues.length) return 'Set for creative work, where the reader comes for the experience.';
  return `Set for the audience you described: ${d.cues.map((c) => `“${c}”`).join(', ')}.`;
}

/** Split a stated "where can people get it" answer into the names it lists, verbatim. */
export function listenRowFrom(answer: string | null | undefined): string[] {
  if (!answer || typeof answer !== 'string') return [];
  return answer
    .replace(/[.!]\s*$/, '')
    .split(/\s*(?:,|;|\/|·|\band\b|\bor\b|\n)\s*/i)
    .map((s) => s.trim())
    .filter((s) => s && s.length <= 40)
    .slice(0, 8);
}
