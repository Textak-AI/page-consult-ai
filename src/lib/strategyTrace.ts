/**
 * Strategy trace: the stored record of how a page came to be, built once when
 * the page is built and saved with it (landing_pages.consultation_data.strategyTrace).
 *
 * Every entry is extractive: owner answers are quoted, never paraphrased;
 * decisions are the ones the builder actually made (brief choices,
 * communication strategy, art director plan, section gates). Nothing here is
 * generated text, so a view or explainer built on it can only show what
 * happened. See the project doc claude/BENCHMARK_STRATEGY_TRACE.md (R1–R8).
 */
import { buyerTypeLabel } from '@/lib/buyerTypeLabels';
import { timeAwareContent } from '@/lib/text/releaseTiming';
import { missingSections } from '@/lib/sectionUnlocks';
import { truncateAtBoundary } from '@/lib/text/truncate';
import { hiddenReason } from '@/lib/editor/emptySections';
import { CHOICE_LABELS, parseMessagingChoices, type MessagingChoices } from '../../supabase/functions/_shared/messagingChoices';
import { REGISTER_LABEL, registerBecause } from '@/lib/design/visualRegister';

export const TRACE_VERSION = 1;

export interface TraceSource { field: string; label: string; quote: string }
export interface TraceSection {
  index: number;
  type: string;
  name: string;
  /** Owner answers this section's copy demonstrably draws on (shared content words). */
  sources: TraceSource[];
  /** Decisions that placed or shaped this section, in plain words. */
  decisions: string[];
  design: { surface: string | null; layout: string | null };
  /** Fingerprint of the section's copy at build time; a different one now means the owner edited it. */
  copyPrint: string;
}
export interface StrategyTrace {
  version: number;
  builtAt: string;
  evidence: 'thin' | 'some' | 'strong' | null;
  buyer: { label: string; choices: { question: string; answer: string }[] } | null;
  opening: { emphasis: 'problem-led' | 'outcome-led'; label: string; because: string } | null;
  design: { philosophy: string | null; label: string | null; because: string | null; brandColor: string | null };
  sections: TraceSection[];
  waiting: { section: string; name: string; needs: string }[];
}

/** The owner's answers a page can draw on, in plain labels. */
const ANSWER_FIELDS: [string, string][] = [
  ['idealClient', 'Who it’s for'],
  ['clientFrustration', 'Their biggest frustration'],
  ['desiredOutcome', 'The outcome they’re buying'],
  ['uniqueStrength', 'What you do differently'],
  ['identitySentence', 'How you describe the business'],
  ['mainOffer', 'Your offer'],
  ['offerIncludes', 'What’s included'],
  ['processDescription', 'Your process'],
  ['testimonialText', 'A customer’s words'],
  ['concreteProofStory', 'A result you’re proud of'],
  ['clientCount', 'Customers served'],
  ['yearsInBusiness', 'Years in business'],
  ['achievements', 'Credentials'],
  ['ctaText', 'Your button'],
];

const SECTION_NAMES: Record<string, string> = {
  hero: 'Opening', 'problem-solution': 'The problem and your fix', 'how-it-works': 'How it works',
  features: 'What they get', 'social-proof': 'What customers say', testimonials: 'What customers say',
  faq: 'Questions buyers ask', 'final-cta': 'The ask', 'stats-bar': 'Your numbers', 'credentials-bar': 'Credentials',
  'beta-hero-teaser': 'Opening', 'beta-perks': 'Early adopter perks', 'beta-final-cta': 'The ask', 'waitlist-proof': 'Waitlist',
  'work-samples': 'Your work', video: 'Video', 'differentiator-callout': 'What sets you apart', 'audience-fit': 'Who it’s for',
};
const PHILOSOPHY: Record<string, string> = {
  structural: 'Clean structure that lets the evidence lead',
  organic: 'Warm, open and human',
  bold: 'Direct and high-contrast',
  minimal: 'Quiet and considered',
  atmospheric: 'Rich and immersive',
};
const ARCHETYPE_PHILOSOPHY: Record<string, string> = {
  'Analytical Validator': 'structural', 'Emotional Connector': 'organic', 'Decisive Commander': 'bold', 'Cautious Researcher': 'minimal',
};
const SURFACE: Record<string, string> = { dark: 'Deep brand background', light: 'Light background', tinted: 'Soft tinted background', brand: 'Brand-colour background' };
const DESIGN_KEY = /(Color|Colors|Font|Image|Images|Url|URL|Link|Prompt|Asset|Credit|Attribution)$|^(sectionBackground|mode|pageMode|composition|layout.*|variant|icon.*|type|id|order|visible|signature.*|typography.*|tokens|numbering|trackingStyle|headingWeight|dividerSystem|borderSystem|imageStyle|statsPresentation|numberStyle|labelStyle|featureLayout|hasGridTexture|hasAccentGlow|trustSignals|designIntelligence|sdi.*|industry.*)$/;

const STOP = new Set('that this with your their they them have from into what when where which while about there these those than then been being also just more most very much many some such only even make makes made does doing done will would could should every each other after before over under again'.split(' '));
const words = (t: string) => new Set((t.toLowerCase().match(/[a-z][a-z'’-]{3,}/g) || []).map((w) => w.replace(/(ing|ed|es|s)$/, '')).filter((w) => w.length >= 4 && !STOP.has(w)));

/** Every copy string in a section's content (design and media keys skipped). */
export function sectionCopy(value: unknown, key = ''): string[] {
  if (key && DESIGN_KEY.test(key)) return [];
  if (typeof value === 'string') return /^(data:|https?:\/\/|#)/.test(value) ? [] : [value];
  if (Array.isArray(value)) return value.flatMap((v) => sectionCopy(v));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => sectionCopy(v, k));
  return [];
}

/** Small stable fingerprint (FNV-1a) of a section's copy, so later edits can be told apart. */
export function copyPrint(content: unknown): string {
  const text = sectionCopy(content).map((s) => s.trim()).filter(Boolean).join('␞');
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(36);
}

const answerText = (v: unknown): string | null => typeof v === 'string' && v.trim().length > 2 ? v.trim() : null;

const tokens = (t: string) => (t.toLowerCase().replace(/[’']/g, "'").match(/[a-z0-9$%']+/g) || []);
/** Every run of n consecutive words in the text. */
const shingles = (t: string, n: number) => {
  const tk = tokens(t);
  const out = new Set<string>();
  for (let i = 0; i + n <= tk.length; i++) out.add(tk.slice(i, i + n).join(' '));
  return out;
};

/**
 * Answers this copy demonstrably reuses: the whole answer appears, or a run of
 * four of the owner's words appears unchanged. Shared topic words alone
 * ("bank", "ledger") are not evidence, so short or generic overlaps don't count.
 */
export function sourcesFor(copy: string[], answers: Record<string, any>): TraceSource[] {
  const joined = copy.join(' \n ');
  const copyRuns = shingles(joined, 4);
  const lowered = tokens(joined).join(' ');
  const candidates: { source: TraceSource; runs: Set<string> }[] = [];
  const consider = (field: string, label: string, answer: string | null) => {
    if (!answer) return;
    const whole = tokens(answer).join(' ');
    const runs = new Set([...shingles(answer, 4)].filter((run) => copyRuns.has(run)));
    if (whole.length >= 6 && lowered.includes(whole)) runs.add(`whole:${whole}`);
    if (runs.size) candidates.push({ source: { field, label, quote: truncateAtBoundary(answer, 180) }, runs });
  };
  for (const [field, label] of ANSWER_FIELDS) consider(field, label, answerText(answers[field]));
  const objections = Array.isArray(answers.objections) ? answers.objections : [];
  objections.forEach((o: any, i: number) => consider(`objections.${i}`, `Your answer: ${o?.question}`, answerText(o?.answer)));
  // The owner often repeats a phrase across answers ("a 45-minute call"): credit the answer
  // that contributes the most, and others only for words no credited answer already explains.
  candidates.sort((a, b) => b.runs.size - a.runs.size);
  const covered = new Set<string>();
  const out: TraceSource[] = [];
  for (const c of candidates) {
    const fresh = [...c.runs].filter((r) => !covered.has(r));
    if (!fresh.length) continue;
    out.push(c.source);
    c.runs.forEach((r) => covered.add(r));
  }
  const order = (f: string) => { const i = ANSWER_FIELDS.findIndex(([k]) => k === f); return i < 0 ? 100 + Number(f.split('.')[1] || 0) : i; };
  return out.sort((a, b) => order(a.field) - order(b.field));
}

export function buildStrategyTrace(input: {
  answers: Record<string, any>;
  brief?: Record<string, any> | null;
  sections: Array<{ type: string; content?: Record<string, any> }>;
  /** Used only when the brief predates stored choices. */
  fallbackChoices?: Record<string, any> | null;
  brandColor?: string | null;
  now?: string;
}): StrategyTrace {
  const answers = input.answers || {};
  const brief = input.brief || {};
  const choices: MessagingChoices | null = parseMessagingChoices(brief.messagingChoices) || parseMessagingChoices(input.fallbackChoices);
  const strategy = brief.communicationStrategy || answers.communicationStrategy || null;

  const buyer = choices ? {
    label: buyerTypeLabel(choices.archetype),
    choices: (Object.keys(CHOICE_LABELS) as (keyof typeof CHOICE_LABELS)[]).map((k) => ({
      question: CHOICE_LABELS[k].question,
      answer: (CHOICE_LABELS[k] as Record<string, string>)[choices[k] as string],
    })),
  } : null;

  const emphasis: 'problem-led' | 'outcome-led' | null = strategy?.arcEmphasis === 'outcome-led' || strategy?.arcEmphasis === 'problem-led' ? strategy.arcEmphasis : null;
  const arcSource: string[] = strategy?.provenance?.arcEmphasis || [];
  // The record describes the hero that was built, never the decision alone: which brief option
  // the headline actually is. A headline that matches none (reframe, edited) claims nothing.
  const heroHeadline = String(input.sections?.[0]?.content?.headline || '').trim().toLowerCase();
  const h = brief.headlines || {};
  const same = (o: unknown) => !!heroHeadline && typeof o === 'string' && o.trim().toLowerCase() === heroHeadline;
  const openedWith: 'problem-led' | 'outcome-led' | 'benefit' | null =
    same(h.optionB) ? 'problem-led' : same(h.optionC) ? 'outcome-led' : same(h.optionA) ? 'benefit' : null;
  const OPENING_LABEL = { 'problem-led': 'Opens with the problem they have now', 'outcome-led': 'Opens with the result they want', benefit: 'Opens with what they get' } as const;
  const opening = openedWith ? {
    emphasis: openedWith === 'benefit' ? (emphasis || 'outcome-led') : openedWith,
    label: OPENING_LABEL[openedWith],
    because: openedWith === emphasis && arcSource.includes('messagingChoices.headlineFocus') && buyer
      ? `Your buyer ${buyer.label.charAt(0).toLowerCase()}${buyer.label.slice(1)}.`
      : openedWith === emphasis && arcSource.some((s) => /awareness/i.test(s)) ? 'You said how aware your buyers already are.'
      : 'Chosen for the goal you set for the page.',
  } : null;

  const philosophy = choices ? ARCHETYPE_PHILOSOPHY[choices.archetype] || null : null;
  // The reader's world can choose the look (visualRegister); the hero carries the register and the owner's cue words.
  const heroContent = input.sections?.[0]?.content || {};
  const register = heroContent.visualRegister === 'immersive' ? 'immersive' : null;
  const design = {
    philosophy,
    label: register ? REGISTER_LABEL[register] : philosophy ? PHILOSOPHY[philosophy] : null,
    because: register
      ? registerBecause({ register, label: REGISTER_LABEL[register], cues: Array.isArray(heroContent.registerCues) ? heroContent.registerCues.filter((c: unknown) => typeof c === 'string') : [] })
      : philosophy && buyer ? `Set for a buyer who ${buyer.label.charAt(0).toLowerCase()}${buyer.label.slice(1)}.` : null,
    brandColor: input.brandColor || null,
  };

  const proofPlan: any[] = Array.isArray(strategy?.proofPlan) ? strategy.proofPlan : [];
  const stated = String(answers.ctaText || answers.primaryCTA || answers.primary_cta || '').trim().toLowerCase();

  // Sections that render nothing (no real proof yet) are listed under "waiting", not credited here.
  const sections: TraceSection[] = (input.sections || []).flatMap((s, index) => hiddenReason(s) ? [] : [s].map(() => {
    const content = s.content || {};
    const copy = sectionCopy(content);
    const decisions: string[] = [];
    if (index === 0 && opening) decisions.push(opening.label);
    const timed = timeAwareContent(content);
    if (typeof timed.askNote === 'string' && timed.askNote) decisions.push(timed.askNote);
    else if (stated && copy.some((c) => c.trim().toLowerCase() === stated)) decisions.push('The button uses your words exactly.');
    for (const p of proofPlan) {
      if (p?.sectionType === s.type && s.type !== 'faq' && typeof p.evidence === 'string') decisions.push(`Your words back up: “${truncateAtBoundary(String(p.claim || ''), 120)}”`);
    }
    if (s.type === 'faq') decisions.push('Only questions you answered appear here, with your answers word for word.');
    if (s.type === 'how-it-works') decisions.push('The steps are the process you described.');
    if (s.type === 'beta-perks' && Array.isArray(content.perks) && content.perks.length) {
      decisions.push(`Only the perks you picked: ${content.perks.map((p: unknown) => String(p).replace(/-/g, ' ')).join(', ')}.`);
    }
    return {
      index,
      type: s.type,
      name: SECTION_NAMES[s.type] || s.type.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
      sources: sourcesFor(copy, answers),
      decisions,
      design: {
        surface: SURFACE[String(content.sectionBackground || '')] || null,
        layout: (content.composition || content.featureLayout || null) as string | null,
      },
      copyPrint: copyPrint(content),
    };
  }));

  const waiting = missingSections(answers).map((u) => ({ section: u.section, name: SECTION_NAMES[u.section] || u.section, needs: u.question }));

  return {
    version: TRACE_VERSION,
    builtAt: input.now || new Date().toISOString(),
    evidence: choices?.evidence || null,
    buyer,
    opening,
    design,
    sections,
    waiting,
  };
}

/** Sections whose copy no longer matches the build: the owner changed them, so the strategy isn't credited. */
export function editedSections(trace: StrategyTrace | null | undefined, current: Array<{ type: string; content?: unknown }>): Set<number> {
  const out = new Set<number>();
  if (!trace?.sections) return out;
  trace.sections.forEach((t) => {
    const now = current.find((c, i) => i === t.index && c.type === t.type) || current.find((c) => c.type === t.type);
    if (!now || copyPrint(now.content) !== t.copyPrint) out.add(t.index);
  });
  return out;
}
