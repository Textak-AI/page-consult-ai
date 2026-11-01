/**
 * Search and link-preview text built from what the owner stated in the
 * consultation (offer, audience, business name, the brief's one-liner).
 * No model call and nothing new: every word comes from their answers, cut to
 * search lengths at word or sentence boundaries. Used as the SEO panel's
 * fallback and as the Publish dialog's default when the owner sets nothing.
 */

export const TITLE_TARGET = 60;
export const DESCRIPTION_TARGET = 160;

const clean = (v: unknown): string => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');
const first = (...vals: unknown[]): string => vals.map(clean).find(Boolean) || '';

/** Cut at a word boundary, never mid-word, no trailing punctuation dangling. */
export function cutAtWord(text: string, max: number): string {
  const t = clean(text);
  if (t.length <= max) return t;
  const cut = t.slice(0, max + 1);
  const i = cut.lastIndexOf(' ');
  return (i > max * 0.5 ? cut.slice(0, i) : t.slice(0, max)).replace(/[\s,;:–—-]+$/, '');
}

/** Whole sentences that fit; falls back to a word cut when one sentence is too long. */
export function cutAtSentence(text: string, max: number): string {
  const t = clean(text);
  if (t.length <= max) return t;
  const sentences = t.match(/[^.!?]+[.!?]+(\s|$)/g) || [];
  let out = '';
  for (const s of sentences) {
    if ((out + s).trim().length > max) break;
    out += s;
  }
  return out.trim() || cutAtWord(t, max);
}

/** The audience's lead phrase: the owner's own words up to the first clause break. */
export function shortAudience(idealClient: string): string {
  const t = clean(idealClient).replace(/^(our|my|the)\s+ideal\s+(client|customer)s?\s+(is|are)\s+/i, '');
  const lead = t.split(/,|;|\.|\s(?:who|that|with|at|in|across)\s/i)[0] || '';
  if (lead.length < 4 || lead.length > 40) return '';
  // Mid-title: "for marketing leads", keeping acronyms ("CTOs") as written.
  return /^[A-Z][a-z]/.test(lead) ? lead[0].toLowerCase() + lead.slice(1) : lead;
}

export function seoFallback(cd: Record<string, any> | null | undefined, fallback: { title?: string; description?: string } = {}) {
  const d = cd || {};
  const business = first(d.businessName, d.companyName);
  const offer = first(d.mainOffer, d.spotlightService, d.offer, d.productName);
  const audience = shortAudience(first(d.idealClient, d.targetAudience));
  const oneLiner = first(d.communicationStrategy?.oneLiner, d.structuredBrief?.communicationStrategy?.oneLiner, d.desiredOutcome);
  const offerLine = first(d.offerIncludes);

  // Title: the most specific version that fits.
  const candidates = [
    offer && audience && business ? `${offer} for ${audience} | ${business}` : '',
    offer && business ? `${offer} | ${business}` : '',
    offer || business,
  ].filter(Boolean);
  const title = candidates.find((c) => c.length <= TITLE_TARGET) || cutAtWord(candidates[0] || clean(fallback.title), TITLE_TARGET) || clean(fallback.title);

  // Description: the brief's one-liner, then what the offer includes, in whole sentences.
  const sentence = (s: string) => (s && !/[.!?]$/.test(s) ? `${s}.` : s);
  const joined = [sentence(oneLiner), sentence(offerLine)].filter(Boolean).join(' ');
  const description = cutAtSentence(joined, DESCRIPTION_TARGET) || cutAtSentence(clean(fallback.description), DESCRIPTION_TARGET);

  return { title, description };
}
