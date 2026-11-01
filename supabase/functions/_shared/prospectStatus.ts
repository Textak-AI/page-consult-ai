/** Engagement can move a prospect forward (new -> contacted -> engaged -> hot), never backward, and never off an owner-set status. */
const ORDER = ['new', 'contacted', 'engaged', 'hot'];
export function nextProspectStatus(current: string | null | undefined, score: number, firstView: boolean): string {
  const now = current || 'new';
  if (!ORDER.includes(now)) return now; // converted, lost, archived: the owner's call
  let target = firstView ? 'contacted' : now;
  if (score >= 50) target = 'engaged';
  if (score >= 100) target = 'hot';
  return ORDER.indexOf(target) > ORDER.indexOf(now) ? target : now;
}
