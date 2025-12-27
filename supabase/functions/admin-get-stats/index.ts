import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hardcoded admin emails - update as needed
const ADMIN_EMAILS = ['kyle@pageconsult.ai'];

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

    console.log('Admin fetching stats');

    // Get user count
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const userCount = usersData?.users?.length || 0;

    // Get page count
    const { count: pageCount } = await supabaseAdmin
      .from('landing_pages')
      .select('*', { count: 'exact', head: true });

    // Get consultation count
    const { count: consultationCount } = await supabaseAdmin
      .from('consultations')
      .select('*', { count: 'exact', head: true });

    // Get active users (users with activity in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: activePages } = await supabaseAdmin
      .from('landing_pages')
      .select('user_id')
      .gte('updated_at', sevenDaysAgo);
    
    const activeUserIds = new Set(activePages?.map((p: { user_id: string }) => p.user_id) || []);
    const activeCount = activeUserIds.size;

    // Get published pages count
    const { count: publishedCount } = await supabaseAdmin
      .from('landing_pages')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    // Get beta signups count
    const { count: betaSignupCount } = await supabaseAdmin
      .from('beta_signups')
      .select('*', { count: 'exact', head: true });

    const stats = {
      userCount,
      pageCount: pageCount || 0,
      consultationCount: consultationCount || 0,
      activeCount,
      publishedCount: publishedCount || 0,
      betaSignupCount: betaSignupCount || 0,
    };

    console.log('Stats:', stats);

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in admin-get-stats:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
