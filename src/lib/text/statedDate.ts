/**
 * A date the owner stated (or their site states) for a release, launch, opening or event.
 * Returned verbatim with its lead-in ("Out October 27, 2026"), never computed or reworded,
 * so a pre-save or launch page can carry the one fact that matters most.
 */

const MONTH = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
const DAY = '(?:[0-3]?\\d)(?:st|nd|rd|th)?';
const YEAR = '(?:20\\d\\d)';
const LEAD = '(?:out|available|releases?|released|launch(?:es|ing)?|coming|opens?|opening|starts?|starting|ships?|shipping|arrives?|drops?|live|on sale|in stores|streaming)';
const DATE =
  `(?:${MONTH}\\s+${DAY},?\\s+${YEAR}|${DAY}\\s+${MONTH},?\\s+${YEAR}|${MONTH}\\s+${YEAR}|${MONTH}\\s+${DAY}(?!\\d)|\\d{1,2}/\\d{1,2}/${YEAR})`;
const WITH_LEAD = new RegExp(`\\b(${LEAD})\\s+(?:on\\s+|in\\s+)?(?:(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day,?\\s+)?${DATE}`, 'i');
const BARE = new RegExp(`\\b${DATE}\\b`, 'i');

const FIELDS = [
  'offerIncludes', 'mainOffer', 'uniqueStrength', 'identitySentence', 'achievements', 'launchDate', 'launch_date',
  'urgencyAngle', 'desiredOutcome', 'concreteProofStory',
] as const;

function texts(consultation: Record<string, any>): string[] {
  const out: string[] = [];
  for (const f of FIELDS) if (typeof consultation?.[f] === 'string') out.push(consultation[f]);
  const wi = consultation?.websiteIntelligence || {};
  for (const f of ['description', 'tagline', 'heroText', 'title']) if (typeof wi?.[f] === 'string') out.push(wi[f]);
  for (const o of Array.isArray(wi?.siteOffers) ? wi.siteOffers : []) {
    if (typeof o?.name === 'string') out.push(o.name);
    if (typeof o?.description === 'string') out.push(o.description);
  }
  return out;
}

/** The stated date line, e.g. "Out October 27, 2026", or null when the owner gave no date. */
export function statedDateLine(consultation: Record<string, any> | null | undefined): string | null {
  if (!consultation) return null;
  let bare: string | null = null;
  for (const t of texts(consultation)) {
    const led = t.match(WITH_LEAD);
    if (led) {
      const line = led[0].trim();
      return line.charAt(0).toUpperCase() + line.slice(1);
    }
    if (!bare) {
      const m = t.match(BARE);
      if (m) bare = m[0].trim();
    }
  }
  return bare;
}
