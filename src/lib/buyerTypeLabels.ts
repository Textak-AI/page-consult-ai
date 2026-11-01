// Plain-language buyer-type labels for anything an owner sees.
// Internal identifiers, logs and model prompts keep the archetype names
// (analytical_validator / "Analytical Validator" etc.); the UI shows how the
// buyer decides instead, so owners never have to learn a framework.

export type BuyerTypeId =
  | 'analytical_validator'
  | 'emotional_connector'
  | 'decisive_commander'
  | 'cautious_researcher';

export const BUYER_TYPE_LABELS: Record<BuyerTypeId, string> = {
  analytical_validator: 'Wants evidence before they talk to you',
  emotional_connector: 'Needs to feel understood first',
  decisive_commander: 'Wants the outcome and the next step, fast',
  cautious_researcher: 'Takes time and checks everything',
};

/** Accepts either identifier form: 'analytical_validator' or 'Analytical Validator'. */
export function toBuyerTypeId(id: string | null | undefined): BuyerTypeId | null {
  const key = String(id || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  return key in BUYER_TYPE_LABELS ? (key as BuyerTypeId) : null;
}

/** The label to show an owner. Unknown ids get a neutral fallback, never the raw id. */
export function buyerTypeLabel(id: string | null | undefined): string {
  const key = toBuyerTypeId(id);
  return key ? BUYER_TYPE_LABELS[key] : 'How your buyer decides';
}
