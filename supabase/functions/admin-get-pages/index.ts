import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hardcoded admin emails - update as needed
const ADMIN_EMAILS = ['kyle@pageconsult.ai', 'kyle@textak.ai'];

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if admin
    if (!ADMIN_EMAILS.includes(user.email || '')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { search } = await req.json().catch(() => ({ search: '' }));
    console.log('Admin fetching pages, search:', search);

    // Get all pages
    let query = supabaseAdmin
      .from('landing_pages')
      .select('id, user_id, title, slug, status, is_published, ai_seo_score, created_at, updated_at, consultation_data')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
    }

    const { data: pages, error: pagesError } = await query;

    if (pagesError) {
      console.error('Error fetching pages:', pagesError);
      return new Response(JSON.stringify({ error: 'Failed to fetch pages' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user emails for each page
    const userIds = [...new Set(pages?.map((p: { user_id: string }) => p.user_id) || [])];
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    
    const userEmails: Record<string, string> = {};
    usersData?.users?.forEach((u: { id: string; email?: string }) => {
      userEmails[u.id] = u.email || 'Unknown';
    });

    // Enrich pages with user emails and industry
    const enrichedPages = pages?.map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      user_email: userEmails[p.user_id] || 'Unknown',
      title: p.title || 'Untitled',
      slug: p.slug,
      status: p.status,
      is_published: p.is_published,
      ai_seo_score: p.ai_seo_score,
      industry: p.consultation_data?.industry || 'N/A',
      created_at: p.created_at,
      updated_at: p.updated_at,
    })) || [];

    console.log(`Returning ${enrichedPages.length} pages`);

    return new Response(JSON.stringify(enrichedPages), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in admin-get-pages:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
