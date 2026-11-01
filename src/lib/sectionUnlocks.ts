/**
 * Sections that only appear when the owner has given the facts behind them
 * (zero fabrication). This list mirrors those gates so the owner can see what
 * a short page is missing and answer one question to add each section,
 * instead of the page silently coming out thin.
 *
 * Gates mirrored:
 *  - how-it-works: sectionMapper renders it only when a process is stated
 *  - social-proof: SocialProofSection renders only with a real testimonial quote
 *  - faq: sectionMapper needs at least two answered buyer questions
 */
import { answeredObjections, promptsFor, type BuyerObjection } from '../../supabase/functions/_shared/buyerObjections';

export type UnlockSection = 'how-it-works' | 'social-proof' | 'faq';

export interface SectionUnlock {
  section: UnlockSection;
  /** Section name as the owner sees it. */
  label: string;
  /** The one question that adds it. */
  question: string;
  placeholder: string;
}

const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

export function processStated(d: Record<string, any>): boolean {
  const steps = [d.methodologySteps, d.methodology_steps].find(Array.isArray) as unknown[] | undefined;
  return !!text(d.processDescription ?? d.process_description) || (steps || []).some((s) => !!text(s));
}

export function testimonialStated(d: Record<string, any>): boolean {
  return text(d.testimonialText).length > 10;
}

export function answeredBuyerQuestions(d: Record<string, any>): number {
  return answeredObjections(d.objections).length;
}

export const FAQ_MIN_ANSWERS = 2;

/** The sections this owner's answers can't fill yet, in the order they would appear on the page. */
export function missingSections(d: Record<string, any> | null | undefined): SectionUnlock[] {
  const data = d || {};
  const out: SectionUnlock[] = [];
  if (!processStated(data)) {
    out.push({
      section: 'how-it-works',
      label: 'How It Works',
      question: 'What happens after someone contacts you? Two or three steps, in order.',
      placeholder: 'e.g., A 30-minute call. Then we review your current setup. Then you get a written plan.',
    });
  }
  if (!testimonialStated(data)) {
    out.push({
      section: 'social-proof',
      label: 'Results',
      question: 'Paste one thing a real client said about you, word for word, with their role.',
      placeholder: 'e.g., "We stopped rewriting every deck." - Head of Marketing, mid-size software company',
    });
  }
  if (answeredBuyerQuestions(data) < FAQ_MIN_ANSWERS) {
    out.push({
      section: 'faq',
      label: 'FAQ',
      question: `Answer at least ${FAQ_MIN_ANSWERS} questions buyers ask before they reach out.`,
      placeholder: '',
    });
  }
  return out;
}

/** Buyer questions still unanswered, so the unlock prompt asks only for what's missing. */
export function unansweredBuyerPrompts(d: Record<string, any> | null | undefined) {
  const answered = new Set(answeredObjections((d || {}).objections).map((o: BuyerObjection) => o.topic));
  return promptsFor(d || {}).filter((p) => p.topic !== 'materials' && !answered.has(p.topic));
}

/** Editor sidebar: what each waiting section needs. */
export const UNLOCK_HINTS: Record<UnlockSection, string> = {
  'how-it-works': 'Needs your process',
  'social-proof': 'Needs a real client quote',
  faq: `Needs ${FAQ_MIN_ANSWERS} answers to buyer questions`,
};

/** Page Chat opens with this typed in; the owner finishes the sentence with their facts. */
export const UNLOCK_PREFILLS: Record<UnlockSection, string> = {
  'how-it-works': 'Add a How It Works section. After someone contacts us: ',
  'social-proof': 'Add this real client quote to my Results section, word for word: ',
  faq: 'Add an FAQ. What it costs: \nHow long it takes: ',
};
