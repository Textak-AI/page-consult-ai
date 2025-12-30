import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify the requesting user is authenticated
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

    // Check if user has admin role in database
    const { data: adminRole } = await supabaseAdmin
      .from('admin_roles')
      .select('role')
      .eq('user_id', user.id)
      .or('expires_at.is.null,expires_at.gt.now()')
      .in('role', ['super_admin', 'admin'])
      .maybeSingle();

    if (!adminRole) {
      console.log('User not admin:', user.email);
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Admin fetching stats, user:', user.email, 'role:', adminRole.role);

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
