/** Dashboard list helpers: plain names, newest first, published means live. */

const GENERIC = /\s*(landing page|page)\s*$/i;

/** The business name the owner gave, not "X Landing Page" or "Untitled". */
export function dashboardTitle(page: { title?: string | null; consultation_data?: any }): string {
  const name = typeof page?.consultation_data?.businessName === 'string' ? page.consultation_data.businessName.trim() : '';
  if (name) return name;
  const title = (page?.title || '').replace(GENERIC, '').trim();
  return title || 'Untitled page';
}

export function isLive(page: { is_published?: boolean | null }): boolean {
  return page?.is_published === true;
}

export function newestFirst<T extends { updated_at?: string | null }>(pages: T[]): T[] {
  const t = (p: T) => (p.updated_at ? new Date(p.updated_at).getTime() : 0);
  return [...pages].sort((a, b) => t(b) - t(a));
}

export const DASHBOARD_VISIBLE = 8;
