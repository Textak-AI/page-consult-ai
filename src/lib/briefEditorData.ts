/**
 * The Strategy Brief editor uses its own field names (audiencePainPoints,
 * caseStudyHighlight, primaryCTA…). The wizard stores the same answers under
 * the consultation's names (clientFrustration, concreteProofStory, ctaText…).
 * Without this map the editor showed blank fields for things the owner had
 * already answered.
 *
 * Only copies what the owner said. Editor values win when both exist.
 */

const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const list = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(text).filter(Boolean);
  const t = text(v);
  return t ? t.split(/\n+/).map((s) => s.trim()).filter(Boolean) : [];
};
const pick = (...vals: unknown[]): string => vals.map(text).find(Boolean) || '';
const pickList = (...vals: unknown[]): string[] => vals.map(list).find((l) => l.length) || [];

export function toBriefEditorData(cd: Record<string, any> | null | undefined): Record<string, any> {
  const d = cd || {};
  const testimonialText = text(d.testimonialText);
  return {
    ...d,
    idealClient: pick(d.idealClient, d.targetAudience),
    audiencePainPoints: pickList(d.audiencePainPoints, d.painPoints, d.clientFrustration),
    audienceGoals: pickList(d.audienceGoals, d.desiredOutcome),
    uniqueStrength: pick(d.uniqueStrength, d.identitySentence),
    keyBenefits: pickList(d.keyBenefits, d.offerIncludes),
    competitorDifferentiator: pick(d.competitorDifferentiator),
    authorityMarkers: pickList(d.authorityMarkers),
    credentials: pick(d.credentials, d.achievements),
    clientCount: pick(d.clientCount),
    caseStudyHighlight: pick(d.caseStudyHighlight, d.concreteProofStory),
    guaranteeOffer: pick(d.guaranteeOffer, d.guarantee),
    riskReversals: pickList(d.riskReversals),
    primaryCTA: pick(d.primaryCTA, d.ctaText),
    secondaryCTA: pick(d.secondaryCTA),
    urgencyAngle: pick(d.urgencyAngle),
    testimonials: Array.isArray(d.testimonials) && d.testimonials.length
      ? d.testimonials
      : testimonialText ? [{ quote: testimonialText, author: '' }] : [],
  };
}

/**
 * Fold editor edits back into the consultation shape the page builder reads,
 * so an edit survives reload and feeds the next regeneration.
 */
export function fromBriefEditorData(original: Record<string, any> | null | undefined, edited: Record<string, any>): Record<string, any> {
  const o = original || {};
  const out: Record<string, any> = { ...o, ...edited };
  const join = (l: unknown) => list(l).join('\n');
  if ('audiencePainPoints' in edited && 'clientFrustration' in o) out.clientFrustration = join(edited.audiencePainPoints);
  if ('audienceGoals' in edited && 'desiredOutcome' in o) out.desiredOutcome = join(edited.audienceGoals);
  if ('caseStudyHighlight' in edited && 'concreteProofStory' in o) out.concreteProofStory = text(edited.caseStudyHighlight);
  if ('credentials' in edited && 'achievements' in o) out.achievements = text(edited.credentials);
  if ('primaryCTA' in edited && 'ctaText' in o && text(edited.primaryCTA)) out.ctaText = text(edited.primaryCTA);
  if ('uniqueStrength' in edited && 'identitySentence' in o && !('uniqueStrength' in o)) out.identitySentence = text(edited.uniqueStrength);
  return out;
}
