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
  return typeof v.text === 'string' && typeof v.field === 'string' && typeof v.source === 'string' && !!v.text.trim() && !!v.field.trim() && !!v.source.trim() && v.source.includes(v.text);
}
export function validStat(stat: SignatureStat) {
  if (!stat || !sourced(stat.evidence) || typeof stat.label !== 'string' || typeof stat.value !== 'string' || !stat.label.trim()) return false;
  if (stat.value === '0') return new RegExp(`\\b(?:no|zero|without|never)\\s+${stat.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(stat.evidence.text);
  return /\d|^(?:one|two|three|four|five|six|seven|eight|nine|ten)$/i.test(stat.value) && stat.evidence.text.includes(stat.value) && stat.evidence.text.toLowerCase().includes(stat.label.toLowerCase());
}
/** Conservative extraction: explicit count + unit, or explicitly stated absence. */
export function inputStats(input: Record<string, unknown>): SignatureStat[] {
  const result: SignatureStat[] = [];
  for (const field of ['uniqueStrength', 'uniqueValue', 'unique_value', 'credentials', 'offer']) {
    const source = input[field];
    if (typeof source !== 'string') continue;
    const count = source.match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(clients|years|projects|locations)\b/i);
    if (count) result.push({ value: count[1], label: count[2], evidence: { text: count[0], source, field } });
    const absence = source.match(/\b(?:no|zero|without)\s+(generic templates|stock imagery|junior handoffs)\b/i);
    if (absence) result.push({ value: '0', label: absence[1], evidence: { text: absence[0], source, field } });
  }
  return result.filter(validStat);
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
  const fromInput = (value: unknown): value is SourceText => sourced(value) && input[value.field] === value.source;
  const stats = [...inputStats(input), ...(Array.isArray(input.signatureStats) ? (input.signatureStats as SignatureStat[]).filter(stat => validStat(stat) && fromInput(stat.evidence)) : [])];
  const terms = Array.isArray(input.ctaTerms) ? input.ctaTerms.filter(fromInput) : [];
  const microline = fromInput(input.ctaMicroline) ? input.ctaMicroline : null;
  const candidates: SignatureElement[] = ['chapter'];
  const payoff = payoffPhrase(strategy.reframe || strategy.oneLiner || '');
  if (payoff) candidates.push('gradient');
  if (sections.some(s => s.type === 'how-it-works' && s.content.steps?.length >= 3 && s.content.industryVariant !== 'saas')) candidates.push('timeline');
  if (reframe && sections.some(s => s.type === 'problem-solution')) candidates.push('reframe');
  if (strategy.ctaLadder.primary && strategy.ctaLadder.secondary) candidates.push('fork');
  if (stats.length) candidates.push('stats');
  if (sections.some(s => s.type === 'features' && s.content.features?.length >= 3)) candidates.push('glass');
  if (intensity !== 'restrained') candidates.push('ambient');
  return { intensity, elements: candidates.slice(0, signatureTokens.limits[intensity]), reframe, payoff, stats, primary: strategy.ctaLadder.primary, secondary: strategy.ctaLadder.secondary, terms, microline };
}
export function applySignatureStrategy<T extends { type: string; content: any }>(sections: T[], strategy: CommunicationStrategy, input: Record<string, unknown> = {}): T[] {
  const plan = selectSignature(strategy, sections, input);
  const attach = (item: any) => {
    const kicker = item.signatureKicker;
    return { ...item, signatureKicker: sourced(kicker) && input[kicker.field] === kicker.source ? kicker : null };
  };
  return sections.map(s => ({ ...s, content: { ...s.content,
    ...(Array.isArray(s.content.features) ? { features: s.content.features.map(attach) } : {}),
    signature: plan } }));
}