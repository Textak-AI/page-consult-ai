/**
 * The owner's own button link. The wizard asks where the main button should send people;
 * a blank answer means the page's contact form. Only absolute http(s) URLs count — anything
 * else (a bare word, a mailto, javascript:) falls back so the form still works.
 */
export function ownerCtaLink(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const v = raw.trim();
  if (!v) return null;
  const withScheme = /^https?:\/\//i.test(v) ? v : /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(v) ? `https://${v}` : null;
  if (!withScheme) return null;
  try {
    const u = new URL(withScheme);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : null;
  } catch {
    return null;
  }
}

/** The link a section's ask should carry: the owner's URL when they gave one, otherwise the form anchor. */
export function ctaHref(raw: unknown, fallback = '#contact'): string {
  return ownerCtaLink(raw) || fallback;
}

/** True when an ask already points somewhere real, so a click must navigate rather than open the form. */
export function isExternalAsk(href: string | null | undefined): boolean {
  return !!href && /^https?:\/\//i.test(href);
}

/**
 * When the main ask leaves the page, the close still collects an address. The words are the
 * page's own function, not a claim: creative pages ask to be kept posted, everything else
 * leaves an email for the business.
 */
export function emailLineFor(ctaLink: string | null | undefined, offerKind: string | null | undefined, businessName?: string | null): { prompt: string; buttonText: string; heroLink?: string } | null {
  if (!isExternalAsk(ctaLink)) return null;
  if (offerKind === 'creative') {
    return { prompt: 'Get a note when something new is out.', buttonText: 'Keep me posted', heroLink: 'Or leave your email and get a note when something new is out.' };
  }
  const who = businessName?.trim() ? businessName.trim() : 'us';
  return { prompt: `Not ready yet? Leave your email and hear from ${who}.`, buttonText: 'Keep me posted' };
}
