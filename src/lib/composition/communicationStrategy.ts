// Shared contract/logic; no provider, credentials, or server client in this module.
export { computeCommunicationStrategy, auditCommunicationStrategy } from '../../../supabase/functions/_shared/communicationStrategy';
export type { CommunicationStrategy } from '../../../supabase/functions/_shared/communicationStrategy';

import type { CommunicationStrategy } from '../../../supabase/functions/_shared/communicationStrategy';
import { slotOf } from './arc';

/** Apply last so legacy messaging heuristics cannot rewrite approved input CTAs. */
export function applyCommunicationStrategy<T extends { type: string; order: number; content: any }>(sections: T[], strategy: CommunicationStrategy): T[] {
  const result = sections.map(s => ({ ...s, content: { ...s.content } }));
  const faqProof = strategy.proofPlan.filter(p => p.sectionType === 'faq' && p.claimSlot === 'proof');
  if (faqProof.length >= 2) {
    const faq = result.find(s => s.type === 'faq');
    const items = faqProof.map(p => ({ question: p.claim, answer: p.evidence }));
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
    if (strategy.reframe) hero.content.headline = strategy.reframe;
    const speaksToReader = (text: string) => !/\b(their|they|them)\b/i.test(text);
    if (strategy.oneLiner && strategy.oneLiner !== hero.content.headline && speaksToReader(strategy.oneLiner)) {
      hero.content.subheadline = strategy.oneLiner;
    }
    if (hero.content.subheadline === hero.content.headline) hero.content.subheadline = '';
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