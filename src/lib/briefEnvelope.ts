/**
 * consultations.strategy_brief envelope helpers.
 * New saves: { markdown, structured }. Legacy rows: raw string or object — passed through untouched.
 */
export interface BriefEnvelope {
  markdown: string | null;
  structured: Record<string, any> | null;
}

export function isBriefEnvelope(value: unknown): value is BriefEnvelope {
  return !!value && typeof value === 'object' && !Array.isArray(value) &&
    'markdown' in (value as any) && 'structured' in (value as any);
}

/** Display value: envelope → markdown; anything else → unchanged. */
export function briefDisplayValue(value: any): any {
  return isBriefEnvelope(value) ? value.markdown : value;
}

/** Object value: envelope → structured (when non-null); anything else → unchanged. */
export function briefObjectValue(value: any): any {
  return isBriefEnvelope(value) && value.structured != null ? value.structured : value;
}

/** Display shape rendered by the Review Brief page (StrategyBrief.tsx). */
export interface BriefView {
  positioning?: string;
  targetAudience?: string;
  industry?: string;
  headlines?: { primary?: string; supporting?: string };
  valueProps?: string;
  proofPoints?: string[];
  objectionHandlers?: string[];
  ctaStrategy?: { primary?: string; secondary?: string };
  cardNotes?: Record<string, string>;
  pageStructure?: any[];
  layoutIntelligence?: Record<string, unknown>;
}

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v : undefined;

/** StructuredBrief = generate-strategy-brief output (headlines.optionA, subheadline, ctaText…). */
export function isStructuredBriefShape(v: any): boolean {
  return !!v && typeof v === 'object' && !Array.isArray(v) && (
    'subheadline' in v || 'ctaText' in v || 'messagingPillars' in v ||
    'solutionStatement' in v || (!!v.headlines && typeof v.headlines === 'object' && 'optionA' in v.headlines)
  );
}

/**
 * View-model adapter. Accepts envelope / StructuredBrief / legacy 9-key object.
 * ZERO-FABRICATION: unmapped or absent fields stay undefined (render blank).
 */
export function toBriefView(
  value: any,
  consultation?: { target_audience?: string | null; industry?: string | null } | null,
): BriefView | null {
  const obj = briefObjectValue(value);
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
  if (!isStructuredBriefShape(obj)) return obj as BriefView;

  const pp = obj.proofPoints;
  const proofPoints: string[] = [];
  if (pp && typeof pp === 'object' && !Array.isArray(pp)) {
    for (const [k, v] of Object.entries(pp)) {
      if (k === 'otherStats') continue;
      const s = str(v);
      if (s) proofPoints.push(s);
    }
    if (Array.isArray(pp.otherStats)) pp.otherStats.forEach((s: unknown) => { const t = str(s); if (t) proofPoints.push(t); });
  } else if (Array.isArray(pp)) {
    pp.forEach((s: unknown) => { const t = str(s); if (t) proofPoints.push(t); });
  }

  return {
    positioning: str(obj.solutionStatement),
    targetAudience: str(consultation?.target_audience),
    industry: str(consultation?.industry),
    headlines: { primary: str(obj.headlines?.optionA), supporting: str(obj.subheadline) },
    proofPoints,
    ctaStrategy: { primary: str(obj.ctaText) },
    pageStructure: Array.isArray(obj.pageStructure) ? obj.pageStructure : undefined,
    layoutIntelligence: obj.layoutIntelligence && typeof obj.layoutIntelligence === 'object' ? obj.layoutIntelligence : undefined,
  };
}

/** View field → canonical StructuredBrief path. Fields absent here are read-only on structured rows. */
export const STRUCTURED_EDIT_MAP: Record<string, string> = {
  'headlines.primary': 'headlines.optionA',
  'headlines.supporting': 'subheadline',
  'ctaStrategy.primary': 'ctaText',
  'positioning': 'solutionStatement',
};
