// Pure section-list operations for the editor. Every op returns a new array,
// sorted by render order with `order` renumbered to the array index, so the
// array index the editor uses always equals the position the renderer shows.
//
// Pinning rule (matches the generator's structural assumption and both renderers,
// which simply sort by `order`): a hero that is first stays first, and a final CTA
// that is last stays last. Nothing can be moved or inserted above/below them.

export interface EditorSection {
  type: string;
  order: number;
  visible: boolean;
  content: any;
}

export const PINNED_FIRST = 'hero';
export const PINNED_LAST = 'final-cta';

export function normalize(sections: EditorSection[]): EditorSection[] {
  return sections
    .map((s, i) => ({ s, i }))
    .sort((a, b) => (a.s.order ?? a.i) - (b.s.order ?? b.i) || a.i - b.i)
    .map(({ s }, order) => ({ ...s, order }));
}

/** Inclusive index range that movable/inserted sections may occupy. */
export function movableRange(sections: EditorSection[]): { min: number; max: number } {
  const min = sections[0]?.type === PINNED_FIRST ? 1 : 0;
  const lastPinned = sections.length > min && sections[sections.length - 1]?.type === PINNED_LAST;
  return { min, max: sections.length - 1 - (lastPinned ? 1 : 0) };
}

export function isPinned(sections: EditorSection[], index: number): boolean {
  const { min, max } = movableRange(sections);
  return index < min || index > max;
}

export function canMove(sections: EditorSection[], index: number, dir: -1 | 1): boolean {
  const { min, max } = movableRange(sections);
  if (index < min || index > max) return false;
  const to = index + dir;
  return to >= min && to <= max;
}

/** Move section `from` to position `to` (clamped into the movable range). */
export function moveTo(sections: EditorSection[], from: number, to: number): EditorSection[] {
  const list = normalize(sections);
  const { min, max } = movableRange(list);
  if (from < min || from > max) return list;
  const target = Math.max(min, Math.min(max, to));
  if (target === from) return list;
  const [item] = list.splice(from, 1);
  list.splice(target, 0, item);
  return list.map((s, order) => ({ ...s, order }));
}

export const move = (sections: EditorSection[], index: number, dir: -1 | 1) =>
  canMove(sections, index, dir) ? moveTo(sections, index, index + dir) : normalize(sections);

/** Insert at `index` (clamped so pinned hero/final CTA keep their positions). */
export function insertAt(sections: EditorSection[], section: Omit<EditorSection, 'order'>, index: number): EditorSection[] {
  const list = normalize(sections);
  const { min, max } = movableRange(list);
  const at = Math.max(min, Math.min(max + 1, index));
  list.splice(at, 0, { ...section, order: at });
  return list.map((s, order) => ({ ...s, order }));
}

export function removeAt(sections: EditorSection[], index: number): EditorSection[] {
  return normalize(sections).filter((_, i) => i !== index).map((s, order) => ({ ...s, order }));
}

export function toggleVisibleAt(sections: EditorSection[], index: number): EditorSection[] {
  return normalize(sections).map((s, i) => (i === index ? { ...s, visible: !s.visible } : s));
}
