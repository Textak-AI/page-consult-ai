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
      console.error('Auth error:', authError);
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

    const { search } = await req.json().catch(() => ({ search: '' }));
    console.log('Admin fetching users, search:', search, 'user:', user.email);

    // Get all users
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get page counts per user
    const { data: pages } = await supabaseAdmin
      .from('landing_pages')
      .select('user_id');
    
    const pageCounts: Record<string, number> = {};
    pages?.forEach((p: { user_id: string }) => {
      pageCounts[p.user_id] = (pageCounts[p.user_id] || 0) + 1;
    });

    // Get user usage data for plan info
    const { data: usageData } = await supabaseAdmin
      .from('user_usage')
      .select('user_id, plan_tier');
    
    const planTiers: Record<string, string> = {};
    usageData?.forEach((u: { user_id: string; plan_tier: string }) => {
      planTiers[u.user_id] = u.plan_tier;
    });

    // Filter and enrich users
    const enrichedUsers = usersData.users
      .filter((u) => !search || u.email?.toLowerCase().includes(search.toLowerCase()))
      .map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        page_count: pageCounts[u.id] || 0,
        plan: planTiers[u.id] || 'starter',
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log(`Returning ${enrichedUsers.length} users`);

    return new Response(JSON.stringify(enrichedUsers), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in admin-get-users:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
