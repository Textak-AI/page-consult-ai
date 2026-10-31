// Shared contract/logic; no provider, credentials, or server client in this module.
export { computeCommunicationStrategy, auditCommunicationStrategy } from '../../../supabase/functions/_shared/communicationStrategy';
export type { CommunicationStrategy } from '../../../supabase/functions/_shared/communicationStrategy';

import type { CommunicationStrategy } from '../../../supabase/functions/_shared/communicationStrategy';
import { slotOf } from './arc';
import { toPageQuestion } from '../../../supabase/functions/_shared/buyerObjections';

/** Apply last so legacy messaging heuristics cannot rewrite approved input CTAs. */
export function applyCommunicationStrategy<T extends { type: string; order: number; content: any }>(sections: T[], strategy: CommunicationStrategy): T[] {
  const result = sections.map(s => ({ ...s, content: { ...s.content } }));
  const faqProof = strategy.proofPlan.filter(p => p.sectionType === 'faq' && p.claimSlot === 'proof');
  if (faqProof.length >= 2) {
    const faq = result.find(s => s.type === 'faq');
    const items = faqProof.map(p => ({ question: toPageQuestion(p.claim), answer: p.evidence }));
    if (faq) faq.content.items = items;
  }
  const hero = result.find(s => s.type === 'hero' || s.type === 'beta-hero-teaser');
  if (hero) {
    // Reframe owns the headline when the input supplied one; otherwise the
    // mapper's guarded brief headline stands — never fall back to the
    // one-liner, which previously rendered the same sentence as headline AND
    // subheadline. The one-liner becomes the subheadline only when it differs
    // from the headline and speaks to the reader: strategy prose written about
    // the buyer ("their team") stays in the brief, not on the page.
    // A positioning paragraph is not a headline: the reframe takes the
    // headline only at headline length; a longer one leaves the guarded brief
    // headline in place (Driftwatch E2E: a 210-char sentence rendered as h1).
    if (strategy.reframe && (isHeadlineLength(strategy.reframe) || !String(hero.content.headline || '').trim())) hero.content.headline = strategy.reframe;
    // The stated outcome, addressed to the reader ("their team" -> "your
    // team"): the user's own words in the page's voice, nothing added.
    const outcome = strategy.oneLiner ? toReader(strategy.oneLiner) : '';
    if (outcome && wordOverlap(outcome, hero.content.headline || '') < 0.6) {
      hero.content.subheadline = outcome;
    }
    // A subheadline that restates the headline wastes the second line read.
    if (hero.content.subheadline && wordOverlap(hero.content.subheadline, hero.content.headline || '') >= 0.6) {
      hero.content.subheadline = '';
    }
  }
  const problem = result.find(s => slotOf(s.type) === 'problem');
  if (problem && strategy.stakes) {
    if (problem.type === 'problem-solution') problem.content.problem = strategy.stakes;
    else problem.content.description = strategy.stakes;
  }
  for (const s of result) {
    if (['hero', 'beta-hero-teaser', 'final-cta', 'beta-final-cta'].includes(s.type)) {
      // Null means the input supplied no ask; never invent a lighter path.
      s.content.ctaText = strategy.ctaLadder.primary || '';
      s.content.secondaryCta = strategy.ctaLadder.secondary;
      s.content.secondaryCtaText = strategy.ctaLadder.secondary;
    }
  }
  // Order from the strategy, preserve every existing section and its content.
  const order = strategy.arcEmphasis === 'outcome-led' ? ['hero', 'outcome', 'problem', 'guide', 'plan', 'proof', 'cta'] : ['hero', 'problem', 'guide', 'plan', 'outcome', 'proof', 'cta'];
  result.sort((a,b) => order.indexOf(slotOf(a.type)) - order.indexOf(slotOf(b.type)));
  for (const proof of strategy.proofPlan) {
    if (proof.sectionType === 'faq') continue; // FAQs stay in the proof/ask run, not beside an earlier claim.
    const evidence = result.find(s => s.type === proof.sectionType);
    const claim = result.find(s => slotOf(s.type) === proof.claimSlot);
    if (!evidence || !claim || evidence === claim) continue;
    result.splice(result.indexOf(evidence), 1);
    result.splice(result.indexOf(claim) + 1, 0, evidence);
  }
  // mechanismName is deliberately never consumed here.
  return result.map((s, order) => ({ ...s, order }));
}
/** Headline-length: one read, roughly a line or two at display size. */
export function isHeadlineLength(text: string): boolean {
  const t = (text || '').trim();
  return t.length > 0 && t.length <= 90 && t.split(/\s+/).length <= 14;
}

/** Re-address buyer-description prose to the reader: their->your, they->you. */
export function toReader(text: string): string {
  const cap = (m: string, to: string) => (m[0] === m[0].toUpperCase() ? to[0].toUpperCase() + to.slice(1) : to);
  return text
    .replace(/\btheirs\b/gi, (m) => cap(m, 'yours'))
    .replace(/\btheir\b/gi, (m) => cap(m, 'your'))
    .replace(/\bthemselves\b/gi, (m) => cap(m, 'yourselves'))
    .replace(/\bthem\b/gi, (m) => cap(m, 'you'))
    .replace(/\bthey\b/gi, (m) => cap(m, 'you'));
}

/** Share of the shorter text's content words (4+ letters) found in the other. */
export function wordOverlap(a: string, b: string): number {
  const words = (t: string) => new Set((t.toLowerCase().match(/[a-z0-9']+/g) || []).filter((w) => w.length >= 4));
  const A = words(a);
  const B = words(b);
  if (A.size === 0 || B.size === 0) return 0;
  let shared = 0;
  A.forEach((w) => { if (B.has(w)) shared++; });
  return shared / Math.min(A.size, B.size);
}
