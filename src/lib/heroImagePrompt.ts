/**
 * Hero photo prompts describe THIS business. The art director contributes
 * only mood (light, tone); the subject comes from the consultation. The old
 * archetype-level prompt ("community atmosphere, people connecting") gave a
 * home inspector, a candle maker and a photo studio the same cafe interior.
 * Uses stated input only, so it can't invent claims about the business.
 */
const pick = (...values: unknown[]): string | undefined =>
  values.find((v): v is string => typeof v === 'string' && v.trim().length > 0)?.trim();

const firstSentence = (text: string | undefined, max = 220): string | undefined => {
  if (!text) return undefined;
  const sentence = text.split(/(?<=[.!?])\s+/)[0] || text;
  return sentence.length > max ? sentence.slice(0, max).replace(/\s+\S*$/, '') : sentence;
};

export function buildHeroImagePrompt(consultation: any, mood?: string | null): string {
  const industry = pick(consultation?.industrySubcategory, consultation?.industry) || 'small business';
  const offer = pick(consultation?.offer, consultation?.mainOffer, consultation?.productName);
  const what = firstSentence(pick(consultation?.unique_value, consultation?.uniqueValue));
  return [
    `Editorial photograph for a ${industry} business${offer ? ` offering ${offer}` : ''}.`,
    what ? `Show the work itself, as described: ${what}` : 'Show the work itself, not a generic workplace.',
    mood ? `Mood: ${mood}.` : '',
    'Specific and authentic to this trade; no text, no logos, no generic offices or cafes, no stock-photo posing.',
  ].filter(Boolean).join(' ');
}

/** Stable short hash so each distinct prompt gets its own cache entry. */
export function promptKey(prompt: string): string {
  let h = 5381;
  for (let i = 0; i < prompt.length; i++) h = ((h << 5) + h + prompt.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
