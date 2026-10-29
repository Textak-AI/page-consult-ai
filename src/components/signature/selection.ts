import { signatureTokens } from '@/lib/design/tokens';
import type { CommunicationStrategy } from '@/lib/composition/communicationStrategy';

export type SignatureElement = 'chapter' | 'gradient' | 'stats' | 'glass' | 'timeline' | 'reframe' | 'fork' | 'ambient';
export type SourceText = { text: string; source: string; field: string };
export type SignatureStat = { value: string; label: string; evidence: SourceText };
export type SignaturePlan = { intensity: CommunicationStrategy['visualIntensity']; elements: SignatureElement[]; reframe: { refused: string; approach: string } | null; payoff: string | null; stats: SignatureStat[]; primary: string | null; secondary: string | null; terms: SourceText[]; microline: SourceText | null };

/** Split existing strategy text only. A single-sided reframe stays single-sided. */
export function reframeHalves(reframe: string | null) {
  if (!reframe) return null;
  const split = reframe.match(/^(.+?[.!?])\s+(.+)$/) || reframe.match(/^(.+?);\s*(.+)$/);
  return split ? { refused: split[1].trim(), approach: split[2].trim() } : null;
}
export function sourced(value: unknown): value is SourceText {
  if (!value || typeof value !== 'object') return false;
  const v = value as SourceText;
  return !!v.text?.trim() && !!v.field?.trim() && !!v.source?.trim() && v.source.includes(v.text);
}
export function validStat(stat: SignatureStat) {
  if (!sourced(stat.evidence) || !stat.label?.trim()) return false;
  if (stat.value === '0') return /\b(no|zero|without|never)\b/i.test(stat.evidence.text) && stat.evidence.text.toLowerCase().includes(stat.label.toLowerCase());
  return /\d/.test(stat.value) && stat.evidence.text.includes(stat.value) && stat.evidence.text.toLowerCase().includes(stat.label.toLowerCase());
}
export function payoffPhrase(headline: string, preferred?: string | null) {
  if (preferred && headline.includes(preferred) && preferred !== headline) return preferred;
  const halves = reframeHalves(headline);
  if (halves && halves.approach !== headline) return halves.approach;
  return null; // Never guess a payoff from arbitrary headline words.
}
export function selectSignature(strategy: CommunicationStrategy, sections: { type: string; content: any }[], input: Record<string, unknown> = {}): SignaturePlan {
  const intensity = strategy.visualIntensity;
  const reframe = reframeHalves(strategy.reframe);
  const stats = Array.isArray(input.signatureStats) ? (input.signatureStats as SignatureStat[]).filter(validStat) : [];
  const terms = Array.isArray(input.ctaTerms) ? input.ctaTerms.filter(sourced) : [];
  const microline = sourced(input.ctaMicroline) ? input.ctaMicroline : null;
  const candidates: SignatureElement[] = ['chapter'];
  const payoff = payoffPhrase(strategy.reframe || strategy.oneLiner || '');
  if (payoff) candidates.push('gradient');
  if (sections.some(s => s.type === 'how-it-works' && s.content.steps?.length >= 3 && s.content.industryVariant !== 'saas')) candidates.push('timeline');
  if (reframe) candidates.push('reframe');
  if (strategy.ctaLadder.primary && strategy.ctaLadder.secondary) candidates.push('fork');
  if (stats.length) candidates.push('stats');
  if (sections.some(s => s.type === 'features' && s.content.features?.length >= 3)) candidates.push('glass');
  if (intensity !== 'restrained') candidates.push('ambient');
  return { intensity, elements: candidates.slice(0, signatureTokens.limits[intensity]), reframe, payoff, stats, primary: strategy.ctaLadder.primary, secondary: strategy.ctaLadder.secondary, terms, microline };
}
export function applySignatureStrategy<T extends { type: string; content: any }>(sections: T[], strategy: CommunicationStrategy, input: Record<string, unknown> = {}): T[] {
  const plan = selectSignature(strategy, sections, input);
  return sections.map(s => ({ ...s, content: { ...s.content, signature: plan } }));
}