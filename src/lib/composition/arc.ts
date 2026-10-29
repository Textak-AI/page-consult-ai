// StoryBrand arc composition for product pages.
// ZERO FABRICATION: an arc slot is filled only when a consultation/brief field
// that feeds it actually exists; an empty slot is skipped and logged, never padded.

export type ArcSlot = 'hero' | 'problem' | 'guide' | 'plan' | 'outcome' | 'proof' | 'cta';

/** Section types that satisfy each arc slot (first entry is inserted when the slot is missing). */
export const ARC_SLOT_TYPES: Record<Exclude<ArcSlot, 'proof'>, string[]> = {
  hero: ['hero'],
  problem: ['problem-solution', 'the-real-challenge', 'stakes-amplify'],
  guide: ['differentiator-callout', 'our-approach', 'expertise-areas'],
  plan: ['how-it-works', 'engagement-model'],
  outcome: ['features', 'client-results'],
  cta: ['final-cta'],
};

const ARC_ORDER: ArcSlot[] = ['hero', 'problem', 'guide', 'plan', 'outcome', 'proof', 'cta'];

export interface ArcSource {
  challenge?: string | null; // consultation.challenge (user's words)
  problemStatement?: string | null; // brief
  solutionStatement?: string | null; // brief
  uniqueValue?: string | null; // consultation.unique_value (user's words)
  processSteps?: unknown[] | null; // brief
  messagingPillars?: { title?: string; description?: string }[] | null; // brief
  offer?: string | null; // consultation.offer
}

export interface ArcDecision {
  slot: ArcSlot;
  type: string | null;
  action: 'kept' | 'inserted' | 'skipped';
  source: string;
}

const has = (v: unknown) => typeof v === 'string' && v.trim().length > 0;

export function slotOf(type: string): ArcSlot {
  for (const [slot, types] of Object.entries(ARC_SLOT_TYPES)) {
    if (types.includes(type)) return slot as ArcSlot;
  }
  return 'proof';
}

/** Which source field can fill a slot's default section, or null when none exists. */
function slotSource(slot: ArcSlot, s: ArcSource): string | null {
  switch (slot) {
    case 'problem':
      if (!has(s.solutionStatement)) return null;
      if (has(s.challenge)) return 'consultation.challenge + brief.solutionStatement';
      if (has(s.problemStatement)) return 'brief.problemStatement + brief.solutionStatement';
      return null;
    case 'guide':
      return has(s.uniqueValue) ? 'consultation.unique_value' : null;
    case 'plan':
      return (s.processSteps?.length ?? 0) > 0 ? 'brief.processSteps' : null;
    case 'outcome': {
      const n = (s.messagingPillars || []).filter((p) => has(p?.title) && has(p?.description)).length;
      if (n < 3) return null; // features quality floor
      return has(s.offer) ? 'consultation.offer (title) + brief.messagingPillars' : 'brief.messagingPillars';
    }
    default:
      return null;
  }
}

/**
 * Reorders a page structure onto the arc and inserts a missing slot's default
 * section only when its source exists. Types are expected already normalized.
 * Sections outside the arc (proof, FAQ, stats…) keep their relative order in the proof slot.
 */
export function composeArc(structure: string[], source: ArcSource): { structure: string[]; log: ArcDecision[] } {
  const buckets = new Map<ArcSlot, string[]>(ARC_ORDER.map((s) => [s, []]));
  for (const t of structure) {
    const bucket = buckets.get(slotOf(t))!;
    if (!bucket.includes(t)) bucket.push(t);
  }
  const log: ArcDecision[] = [];
  for (const slot of ARC_ORDER) {
    const bucket = buckets.get(slot)!;
    if (slot === 'proof') {
      bucket.forEach((t) => log.push({ slot, type: t, action: 'kept', source: 'page structure' }));
      continue;
    }
    if (bucket.length) {
      bucket.forEach((t) => log.push({ slot, type: t, action: 'kept', source: 'page structure' }));
      continue;
    }
    if (slot === 'hero' || slot === 'cta') {
      log.push({ slot, type: null, action: 'skipped', source: 'not in page structure' });
      continue;
    }
    const src = slotSource(slot, source);
    if (src) {
      const type = ARC_SLOT_TYPES[slot][0];
      bucket.push(type);
      log.push({ slot, type, action: 'inserted', source: src });
    } else {
      log.push({ slot, type: null, action: 'skipped', source: 'no source field' });
    }
  }
  return { structure: ARC_ORDER.flatMap((s) => buckets.get(s)!), log };
}
