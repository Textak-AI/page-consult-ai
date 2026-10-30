/**
 * Normalize a user-supplied testimonial for display. Users often paste the
 * quote WITH its own quotation marks and a trailing attribution
 * ('"Creek Bank April got me through..." - repeat customer review'); the
 * renderer adds its own marks, which produced ""doubled"" quotes with the
 * attribution trapped inside. Text is never rewritten - only the wrapping
 * marks are removed and a trailing "- attribution" is split out.
 */
export function splitQuote(raw: string): { text: string; attribution: string | null } {
  const s = (raw || '').trim();
  const withAttribution = /^["“”'‘’]+([\s\S]+?)["“”'‘’]+\s*[-–—]\s*(.{2,80})$/.exec(s);
  if (withAttribution) return { text: withAttribution[1].trim(), attribution: withAttribution[2].trim() };
  return { text: s.replace(/^["“”'‘’]+/, '').replace(/["“”'‘’]+$/, '').trim(), attribution: null };
}
