/**
 * Shorten real copy to a length limit without mechanical damage.
 *
 * - Text within the limit is returned unchanged.
 * - Prefers the last sentence end (. ! ?) inside the limit when it falls past
 *   half the limit; otherwise cuts at the last word boundary.
 * - Never cuts mid-word. A single word longer than the limit is kept whole.
 * - Never adds words; the optional ellipsis is only appended on a word cut.
 */
export function truncateAtBoundary(
  text: string | null | undefined,
  max: number,
  opts: { ellipsis?: boolean } = {}
): string {
  if (text == null) return text as any;
  const value = String(text).trim();
  if (value.length <= max) return value;

  const suffix = opts.ellipsis ? '...' : '';
  const limit = Math.max(1, max - suffix.length);
  const windowText = value.slice(0, limit);
  // A cut exactly at a space boundary is a clean word boundary.
  const nextChar = value.charAt(limit);

  // Sentence boundary past half the limit: return the complete sentence(s).
  const sentenceRe = /[.!?](?=\s|$)/g;
  let lastSentenceEnd = -1;
  let m: RegExpExecArray | null;
  while ((m = sentenceRe.exec(windowText))) lastSentenceEnd = m.index + 1;
  if (nextChar === '' || /\s/.test(nextChar)) {
    if (/[.!?]$/.test(windowText)) lastSentenceEnd = windowText.length;
  }
  if (lastSentenceEnd > max / 2) {
    return windowText.slice(0, lastSentenceEnd).trim();
  }

  let cut: string;
  if (/\s/.test(nextChar)) {
    cut = windowText;
  } else {
    const lastSpace = windowText.search(/\s\S*$/);
    if (lastSpace <= 0) {
      // One word longer than the limit: keep that word whole.
      const firstWord = value.split(/\s/)[0];
      return firstWord;
    }
    cut = windowText.slice(0, lastSpace);
  }
  cut = cut.replace(/[\s,;:\-–—]+$/, '');
  return cut + suffix;
}
