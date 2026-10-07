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
