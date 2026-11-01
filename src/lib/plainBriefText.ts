/**
 * Brief markdown written before the plain-language pass can still carry
 * framework headings. Relabel them when shown, so older briefs read like
 * new ones. Only headings/labels change; the owner's content is untouched.
 */
const RELABEL: Array<[RegExp, string]> = [
  [/\bKey Messaging Pillars\b/g, 'Key Points'],
  [/\bMessaging Pillars\b/g, 'Key Points'],
  [/\bStrategy Blueprint\b/g, 'Strategy Brief'],
  [/\bPageConsult Method\b\s*·?\s*/g, ''],
  [/\s*\((?:Feature|Messaging) Pillars\)/g, ''],
  [/\bPillar (\d+):\s*/g, '$1. '],
  [/\bBased on layout intelligence[^,:\n]*[,:]?\s*/gi, ''],
  [/\blayout intelligence\b/gi, 'your answers'],
];

export function plainBriefText(markdown: string | null | undefined): string {
  let s = markdown || '';
  for (const [re, to] of RELABEL) s = s.replace(re, to);
  return s;
}
