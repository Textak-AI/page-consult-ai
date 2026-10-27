// Gaze maps: ordered element roles per section type, in natural eye-path order.
// Roles are resolved against the rendered section DOM (see resolveGazeOrder).
export type GazeRole =
  | 'headline'
  | 'subheadline'
  | 'primaryCta'
  | 'secondaryCta'
  | 'trustLine'
  | 'sectionHeading'
  | 'cards'
  | 'quote'
  | 'attribution'
  | 'button';

export const GAZE_MAPS: Record<string, GazeRole[]> = {
  hero: ['headline', 'subheadline', 'primaryCta', 'secondaryCta', 'trustLine'],
  features: ['sectionHeading', 'cards'],
  'social-proof': ['sectionHeading', 'quote', 'attribution'],
  'final-cta': ['headline', 'button'],
};

export const getGazeMap = (sectionType: string): GazeRole[] | null =>
  GAZE_MAPS[sectionType] ?? null;

const CTA_SEL = 'a[href], button';
const HEADING_SEL = 'h1, h2';

const visible = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
};

/** Top-down, then left-to-right reading order. */
export const readingOrder = (els: HTMLElement[]) =>
  [...els].sort((a, b) => {
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    if (Math.abs(ra.top - rb.top) > 8) return ra.top - rb.top;
    return ra.left - rb.left;
  });

const all = (root: HTMLElement, sel: string) =>
  Array.from(root.querySelectorAll<HTMLElement>(sel)).filter(visible);

/** Card grid = the element with the most grid/flex children that each hold text. */
const findCards = (root: HTMLElement): HTMLElement[] => {
  let best: HTMLElement[] = [];
  root.querySelectorAll<HTMLElement>('[class*="grid"], [class*="flex"]').forEach((g) => {
    const kids = Array.from(g.children).filter(
      (c): c is HTMLElement => c instanceof HTMLElement && visible(c) && (c.textContent?.trim().length ?? 0) > 0,
    );
    if (kids.length >= 2 && kids.length > best.length && !kids.some((k) => k.matches(CTA_SEL))) best = kids;
  });
  return readingOrder(best);
};

/** A card's beats: icon one beat before its text. */
const cardBeats = (card: HTMLElement): HTMLElement[][] => {
  const kids = Array.from(card.children).filter((c): c is HTMLElement => c instanceof HTMLElement && visible(c));
  const icon = kids.find((k) => k.matches('svg, img') || (!k.textContent?.trim() && k.querySelector('svg, img')));
  if (!icon) return [[card]];
  return [[icon], kids.filter((k) => k !== icon)];
};

/** Mirror image-split layouts: image-left enters first, image-right last. */
const placeImage = (root: HTMLElement, beats: HTMLElement[][], used: Set<HTMLElement>) => {
  const img = all(root, 'img, picture, video').find((i) => !used.has(i) && ![...used].some((u) => u.contains(i)));
  if (!img) return beats;
  const copy = beats[0]?.[0];
  if (!copy) return [[img], ...beats];
  const imageLeft = img.getBoundingClientRect().left + 4 < copy.getBoundingClientRect().left;
  return imageLeft ? [[img], ...beats] : [...beats, [img]];
};

/** Fallback: top-level content blocks, top-down. */
const topDown = (root: HTMLElement): HTMLElement[][] => {
  const cand = all(root, 'h1, h2, h3, p, ul, ol, img, a[href], button, blockquote, [class*="card"]');
  const blocks = cand.filter((el) => !cand.some((o) => o !== el && o.contains(el)));
  return readingOrder(blocks).slice(0, 16).map((b) => [b]);
};

/**
 * Resolve a section's DOM into ordered beats (each beat = elements revealing together).
 * Never returns overlapping/nested elements.
 */
export function resolveGazeOrder(root: HTMLElement, sectionType: string): HTMLElement[][] {
  const map = getGazeMap(sectionType);
  if (!map) return topDown(root);

  const used = new Set<HTMLElement>();
  const beats: HTMLElement[][] = [];
  const take = (el: HTMLElement | undefined) => {
    if (!el || used.has(el) || [...used].some((u) => u.contains(el) || el.contains(u))) return false;
    used.add(el);
    beats.push([el]);
    return true;
  };
  const heading = all(root, HEADING_SEL)[0];
  const ctas = all(root, CTA_SEL);
  let cards: HTMLElement[] = [];

  for (const role of map) {
    switch (role) {
      case 'headline':
      case 'sectionHeading':
        take(heading);
        break;
      case 'subheadline':
        take(all(root, 'p').find((p) => !heading || heading.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING));
        break;
      case 'primaryCta':
      case 'button':
        take(ctas[0]);
        break;
      case 'secondaryCta':
        take(ctas[1]);
        break;
      case 'trustLine': {
        const last = ctas[ctas.length - 1];
        take(all(root, 'p, ul, div').find(
          (el) => last && last.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING && (el.textContent?.trim().length ?? 0) > 0 && !el.querySelector('h1,h2,a,button'),
        ));
        break;
      }
      case 'cards':
        cards = findCards(root).filter((c) => ![...used].some((u) => u.contains(c) || c.contains(u)));
        cards.forEach((c) => {
          used.add(c);
          beats.push(...cardBeats(c));
        });
        break;
      case 'quote':
        take(all(root, 'blockquote, q, [class*="italic"]')[0]);
        break;
      case 'attribution':
        take(all(root, 'cite, figcaption, footer')[0]);
        break;
    }
  }

  return placeImage(root, beats, used);
}
