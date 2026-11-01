/** Prospect page link names: lowercase letters, numbers and single hyphens, 3–40 chars. Matches get-prospect-page's lookup. */
export function prospectSlug(input: unknown): string {
  const s = String(input ?? '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
  return s.length >= 3 ? s : s ? `${s}-page` : '';
}
