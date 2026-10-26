import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

// Public preview lookup: resolves exactly one token server-side so the
// preview_links table never needs an anonymous read policy.
serve(async (req) => {
  const preflight = handleCorsPreflightRequest(req);
  if (preflight) return preflight;
  const headers = { ...getCorsHeaders(req.headers.get('Origin')), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
  if (req.method !== 'POST') return respond({ error: 'Method not allowed' }, 405);
  let input;
  try { input = await req.json(); } catch { return respond({ error: 'Invalid JSON' }, 400); }
  if (typeof input?.token !== 'string' || !/^[a-zA-Z0-9_-]{1,200}$/.test(input.token)) {
    return respond({ status: 'not_found' }, 404);
  }
  try {
    const client = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { data: link, error: linkError } = await client.from('preview_links')
      .select('landing_page_id, expires_at').eq('token', input.token).maybeSingle();
    if (linkError) throw linkError;
    if (!link) return respond({ status: 'not_found' }, 404);
    if (new Date(link.expires_at) < new Date()) return respond({ status: 'expired' });

    const { data: page, error: pageError } = await client.from('landing_pages')
      .select('sections, styles, design_intelligence, consultation_data')
      .eq('id', link.landing_page_id).maybeSingle();
    if (pageError) throw pageError;
    if (!page) return respond({ status: 'not_found' }, 404);

    return respond({
      status: 'ready',
      page: {
        sections: page.sections,
        styles: page.styles,
        design_intelligence: page.design_intelligence,
        businessName: (page.consultation_data as any)?.businessName || null,
      },
    });
  } catch (err) {
    console.error('[get-preview-link] lookup failed:', err);
    return respond({ error: 'Lookup failed' }, 500);
  }
});
