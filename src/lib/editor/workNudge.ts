import { slotOf } from '@/lib/composition/arc';

/**
 * "Show your work" nudge: when to suggest a work gallery, and where it goes.
 * The gallery is upload-only (WorkSamplesSection) - stock is never offered as
 * someone's work, so this nudge only ever asks for the owner's own photos.
 */
const VISUAL_TRADE = /\b(cabinet\w*|kitchen\w*|carpent\w*|joiner\w*|woodwork\w*|furniture|remodel\w*|renovat\w*|construct\w*|build(?:er|ers)|contractor\w*|roof\w*|paint\w*|landscap\w*|lawn|garden\w*|hardscap\w*|pool\w*|interior\w*|design studio|architect\w*|photograph\w*|videograph\w*|wedding\w*|floral|florist\w*|salon|barber\w*|groom\w*|tattoo\w*|nail\w*|makeup|bak(?:ery|er|ed)|cak(?:e|es)|restaurant\w*|cater\w*|chef|food|candle\w*|ceramic\w*|pottery|jewel\w*|apparel|fashion|detailing|auto body|tile|flooring|fence|deck\w*|art(?:ist|work)?|craft\w*|handmade|studio)\b/i;

type Sec = { type: string; content?: any };

export function hasWorkGallery(sections: Sec[]): boolean {
  return sections.some((s) => s.type === 'work-samples');
}

/** Visual trades, or any business we already found photos for, benefit from showing work. */
export function shouldSuggestWorkGallery(sections: Sec[], businessText: string, siteImageCount: number): boolean {
  if (hasWorkGallery(sections)) return false;
  return siteImageCount > 0 || VISUAL_TRADE.test(businessText || '');
}

/** Right after the payoff (what they get), else before proof, else before the close. */
export function workGalleryInsertAt(sections: Sec[]): number {
  const outcome = sections.map((s) => slotOf(s.type)).lastIndexOf('outcome');
  if (outcome >= 0) return outcome + 1;
  const proof = sections.findIndex((s) => slotOf(s.type) === 'proof');
  if (proof >= 0) return proof;
  const close = sections.findIndex((s) => slotOf(s.type) === 'cta');
  return close >= 0 ? close : sections.length;
}
