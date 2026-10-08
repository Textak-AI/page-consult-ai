/**
 * Recover a structured brief from markdown: first fenced JSON block
 * (```json preferred, bare ``` tolerated). Returns the parsed object or null.
 * No synthesis — only parses what is literally present.
 */
export function extractStructuredBrief(markdown: string | null | undefined): Record<string, any> | null {
  if (!markdown || typeof markdown !== 'string') return null;
  const candidates: string[] = [];
  const jsonFence = markdown.match(/```json\s*([\s\S]*?)```/i);
  if (jsonFence) candidates.push(jsonFence[1]);
  const bareFence = markdown.match(/```\s*\n([\s\S]*?)```/);
  if (bareFence) candidates.push(bareFence[1]);
  for (const c of candidates) {
    try {
      const parsed = JSON.parse(c.trim());
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch {
      // try next candidate
    }
  }
  return null;
}
