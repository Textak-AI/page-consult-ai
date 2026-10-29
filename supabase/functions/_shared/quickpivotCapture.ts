export function parseQuickPivotLead(body: any) {
  if (typeof body?.prospectSlug !== 'string' || !/^[a-zA-Z0-9_-]{1,200}$/.test(body.prospectSlug)) throw new Error('Invalid prospect slug');
  if (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) throw new Error('Invalid email format');
  const field = (key: string, limit: number) => typeof body[key] === 'string' ? body[key].slice(0, limit) : null;
  return {
    email: body.email.slice(0, 255), name: field('name', 255), phone: field('phone', 50),
    company: field('company', 255), message: field('message', 5000), source_url: field('sourceUrl', 2000),
    utm_source: field('utmSource', 100), utm_medium: field('utmMedium', 100), utm_campaign: field('utmCampaign', 100),
    custom_fields: body.customFields && typeof body.customFields === 'object' && !Array.isArray(body.customFields) ? body.customFields : {},
  };
}

export async function resolveQuickPivotTarget(client: any, slug: string) {
  const { data: prospect, error } = await client.from('prospects').select('id,user_id,base_page_id,slug').eq('slug', slug).maybeSingle();
  if (error) throw error;
  if (prospect) {
    const { data: page, error: pageError } = await client.from('landing_pages').select('id,title').eq('id', prospect.base_page_id).eq('user_id', prospect.user_id).maybeSingle();
    if (pageError) throw pageError;
    return page ? { userId: prospect.user_id, prospectId: prospect.id, prospectPageId: null, title: page.title, slug } : null;
  }
  const { data: page, error: pageError } = await client.from('prospect_pages')
    .select('id,user_id,prospect_company,unique_slug,expires_at').eq('unique_slug', slug).eq('status', 'published').maybeSingle();
  if (pageError) throw pageError;
  if (!page || (page.expires_at && new Date(page.expires_at).getTime() <= Date.now())) return null;
  return { userId: page.user_id, prospectId: null, prospectPageId: page.id, title: page.prospect_company, slug };
}

export async function captureQuickPivotLead(client: any, slug: string, lead: ReturnType<typeof parseQuickPivotLead>, afterInsert: (target: any, submission: any) => void) {
  const target = await resolveQuickPivotTarget(client, slug);
  if (!target) return null;
  const { data, error } = await client.from('quickpivot_leads').insert({
    ...lead, user_id: target.userId, prospect_id: target.prospectId, prospect_page_id: target.prospectPageId,
    prospect_slug: target.slug, page_title: target.title,
  }).select('id,submitted_at').single();
  if (error) throw error;
  // No delivery work can run before the committed insert or fail capture.
  try { afterInsert(target, data); } catch (error) { console.error('QuickPivot delivery scheduling failed', error); }
  return data;
}