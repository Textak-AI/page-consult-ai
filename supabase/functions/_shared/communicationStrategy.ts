// Phase A is deliberately extractive: words may be selected/recombined, never invented.
export interface CommunicationStrategy {
  reframe: string | null;
  stakes: string | null;
  oneLiner: string | null;
  mechanismName: { name: string; status: 'suggestion'; approved: false } | null;
  arcEmphasis: 'problem-led' | 'outcome-led';
  proofPlan: { sectionType: string; claimSlot: 'guide' | 'outcome'; claim: string; evidence: string; sourceField: string }[];
  ctaLadder: { primary: string | null; secondary: string | null };
  register: string;
  visualIntensity: 'restrained' | 'balanced' | 'expressive';
  provenance: Record<string, string[]>;
}

const text = (v: unknown): string | null => typeof v === 'string' && v.trim() && !/^(not specified|none provided)$/i.test(v.trim()) ? v.trim() : null;
const sentences = (s: string) => s.match(/[^.!?]+[.!?]?/g)?.map(s => s.trim()).filter(Boolean) || [];

export function computeCommunicationStrategy(input: Record<string, any>, brief: Record<string, any>): CommunicationStrategy {
  const provenance: Record<string, string[]> = {};
  const pick = (key: string, fields: string[]) => {
    for (const field of fields) { const value = text(input[field]); if (value) { provenance[key] = [field]; return value; } }
    provenance[key] = []; return null;
  };
  const challenge = pick('stakes', ['clientFrustration', 'challenge']);
  const value = pick('oneLiner', ['desiredOutcome', 'uniqueStrength', 'uniqueValue', 'unique_value', 'offerIncludes', 'mainOffer', 'offer']);
  const opposition = [text(input.uniqueStrength), text(input.uniqueValue), text(input.unique_value), challenge].filter((s): s is string => !!s)
    .flatMap(sentences).find(s => /\b(don[’']t|not just|past consultants|instead|rather than|refuse)\b/i.test(s));
  const reframe = opposition || null;
  provenance.reframe = reframe ? Object.keys(input).filter(k => typeof input[k] === 'string' && input[k].includes(reframe)) : [];
  // Prefer stated outcome. Long sentences are shortened at a clause boundary only.
  let oneLiner = value ? sentences(value)[0] : null;
  if (oneLiner && /\b(visceral|resonan|sculpt|empower|elevat)/i.test(oneLiner)) {
    const partner = value?.match(/We partner with[^.!?;]+?(?=\s+to\s|[.!?;]|$)/i)?.[0];
    oneLiner = partner ? `${partner.trim()}.` : text(input.mainOffer) || text(input.offer);
  }
  const primary = pick('ctaLadder.primary', ['primaryCTA', 'primary_cta', 'ctaText']);
  const secondary = pick('ctaLadder.secondary', ['secondaryCTA', 'secondary_cta']);
  const mechanism = text(input.processName) || text(input.mechanismName);
  provenance.mechanismName = mechanism ? ['processName', 'mechanismName'].filter(k => text(input[k]) === mechanism) : [];
  const awareness = text(input.awarenessLevel) || text(input.awareness_level);
  const arcEmphasis = awareness && /solution|product|most.aware/i.test(awareness) ? 'outcome-led' : 'problem-led';
  provenance.arcEmphasis = awareness ? ['awarenessLevel', 'awareness_level'] : ['default:problem-led (awareness not supplied)'];
  const archetype = text(input.archetype) || text(brief.layoutIntelligence?.archetype);
  const visualIntensity = archetype && /bold|disrupt|creative/i.test(archetype) ? 'expressive' : archetype && /executive|trust|professional/i.test(archetype) ? 'restrained' : 'balanced';
  provenance.visualIntensity = archetype ? ['archetype / brief.layoutIntelligence.archetype'] : ['default:balanced (archetype not supplied)'];
  const proofPlan: CommunicationStrategy['proofPlan'] = [];
  const claim = oneLiner || value;
  // Evidence only attaches when the stated claim shares content words with it.
  for (const [field, sectionType] of [['testimonialText', 'social-proof'], ['caseStudyHighlight', 'client-results'], ['case_study_highlight', 'client-results'], ['credentials', 'credentials-bar'], ['achievements', 'credentials-bar']]) {
    const evidence = text(input[field]);
    if (!evidence || !claim) continue;
    const words = claim.toLowerCase().match(/\b[a-z]{5,}\b/g) || [];
    if (!words.some(w => evidence.toLowerCase().includes(w))) continue;
    proofPlan.push({ sectionType, claimSlot: 'outcome', claim, evidence, sourceField: field });
  }
  provenance.proofPlan = proofPlan.map(p => p.sourceField);
  provenance.register = ['policy:COPY_REGISTER_RULES'];
  return { reframe, stakes: challenge, oneLiner, mechanismName: mechanism ? { name: mechanism, status: 'suggestion', approved: false } : null, arcEmphasis, proofPlan, ctaLadder: { primary, secondary }, register: 'plain, concrete, input-only; at most two subheadline clauses; no hype or dash chains', visualIntensity, provenance };
}

/** No exemptions for short strings or metadata keys: every synthesis leaf is logged. */
export function auditCommunicationStrategy(strategy: CommunicationStrategy, input: Record<string, any>) {
  const raw = JSON.stringify(input).toLowerCase();
  const flags: { path: string; reason: string }[] = [];
  for (const [path, value] of Object.entries({ reframe: strategy.reframe, stakes: strategy.stakes, oneLiner: strategy.oneLiner, mechanismName: strategy.mechanismName?.name, primary: strategy.ctaLadder.primary, secondary: strategy.ctaLadder.secondary, ...Object.fromEntries(strategy.proofPlan.map((p, i) => [`proofPlan.${i}`, p.evidence])) })) {
    if (!value) continue;
    const words = value.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
    if (words.some(w => !raw.includes(w))) flags.push({ path, reason: 'word not present in stated input' });
    if (path === 'reframe' && !raw.includes(value.toLowerCase())) flags.push({ path, reason: 'reframe recombination requires review' });
  }
  console.log('[communication-strategy] provenance for every output', JSON.stringify(strategy.provenance));
  console.log('[communication-strategy] synthesis flags', JSON.stringify(flags));
  return flags;
}