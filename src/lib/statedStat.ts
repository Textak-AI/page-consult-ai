/**
 * A stat chip from the owner's own words. Never adds "+" (that inflates a stated
 * count), never turns a founding year into "2011 Years Experience", and keeps a
 * count that doesn't lead its text whole ("About 900 households served").
 */
export function statedStat(raw: unknown, kind: 'clients' | 'years'): { value: string; label: string } | null {
  const text = String(raw ?? '').trim();
  const num = text.match(/\d[\d,]*(?:\.\d+)?\+?/);
  if (!num) return null;
  if (kind === 'years') {
    const count = text.match(/^(\d+\+?)\s*(?:years?|yrs?)\b/i);
    return count ? { value: count[1], label: 'Years Experience' } : { value: text, label: '' };
  }
  if (num.index === 0) {
    const rest = text.slice(num[0].length).replace(/^[\s,:–—-]+/, '').trim();
    return { value: num[0], label: rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : 'Clients Served' };
  }
  return { value: text, label: '' };
}
