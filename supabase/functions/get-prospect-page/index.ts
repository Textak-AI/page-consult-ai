import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';
import { ownerShowsBadge } from '../_shared/planLimits.ts';

const PAGE_FIELDS = 'id,user_id,title,slug,sections,styles,meta_title,meta_description,consultation_data';

function displayPage(page: any) {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    sections: page.sections,
    styles: page.styles,
    meta_title: page.meta_title,
    meta_description: page.meta_description,
    businessName: page.consultation_data?.businessName || null,
  };
}

serve(async (req) => {
  const preflight = handleCorsPreflightRequest(req);
  if (preflight) return preflight;
  const headers = { ...getCorsHeaders(req.headers.get('Origin')), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
  if (req.method !== 'POST') return respond({ error: 'Method not allowed' }, 405);
  let input;
  try { input = await req.json(); } catch { return respond({ error: 'Invalid JSON' }, 400); }
  if (typeof input?.slug !== 'string' || !/^[a-zA-Z0-9_-]{1,200}$/.test(input.slug)) {
    return respond({ error: 'Invalid slug' }, 400);
  }
  try {
    const client = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { data: prospect, error: prospectError } = await client.from('prospects')
      .select('user_id,base_page_id,first_name,company,job_title,personalized_headline,personalized_subhead,personalized_cta_text')
      .eq('slug', input.slug).maybeSingle();
    if (prospectError) throw prospectError;
    if (prospect) {
      if (!prospect.base_page_id) return respond({ error: 'Not found' }, 404);
      const { data: page, error } = await client.from('landing_pages').select(PAGE_FIELDS)
        .eq('id', prospect.base_page_id).eq('user_id', prospect.user_id).maybeSingle();
      if (error) throw error;
      if (!page) return respond({ error: 'Not found' }, 404);
      return respond({
        prospect: {
          first_name: prospect.first_name,
          company: prospect.company,
          job_title: prospect.job_title,
          personalized_headline: prospect.personalized_headline,
          personalized_subhead: prospect.personalized_subhead,
          personalized_cta_text: prospect.personalized_cta_text,
        },
        page: displayPage(page),
        canCaptureLead: true,
        showBadge: await ownerShowsBadge(client, page.user_id),
      });
    }
    const { data: prospectPage, error: prospectPageError } = await client.from('prospect_pages')
      .select('id,user_id,source_landing_page_id,prospect_company,personalized_headline,personalized_subheadline,personalized_sections,unique_slug,expires_at')
      .eq('unique_slug', input.slug).eq('status', 'published').maybeSingle();
    if (prospectPageError) throw prospectPageError;
    if (prospectPage) {
      if (prospectPage.expires_at && new Date(prospectPage.expires_at).getTime() <= Date.now()) return respond({ error: 'Not found' }, 404);
      const { data: base } = await client.from('landing_pages').select(PAGE_FIELDS)
        .eq('id', prospectPage.source_landing_page_id).eq('user_id', prospectPage.user_id).maybeSingle();
      const sections = Array.isArray(prospectPage.personalized_sections) && prospectPage.personalized_sections.length
        ? prospectPage.personalized_sections : base?.sections;
      if (!sections) return respond({ error: 'Not found' }, 404);
      return respond({ prospect: null, canCaptureLead: true, showBadge: await ownerShowsBadge(client, prospectPage.user_id),
        page: { ...displayPage(base || { id: prospectPage.id, title: prospectPage.prospect_company, styles: {} }),
          slug: prospectPage.unique_slug, sections, title: prospectPage.prospect_company } });
    }
    // Preserve the route's existing published-landing-page fallback.
    const { data: page, error } = await client.from('landing_pages').select(PAGE_FIELDS)
      .eq('slug', input.slug).eq('is_published', true).maybeSingle();
    if (error) throw error;
    if (!page) return respond({ error: 'Not found' }, 404);
    return respond({ prospect: null, page: displayPage(page), showBadge: await ownerShowsBadge(client, page.user_id) });
  } catch {
    return respond({ error: 'Unable to load page' }, 500);
  }
});