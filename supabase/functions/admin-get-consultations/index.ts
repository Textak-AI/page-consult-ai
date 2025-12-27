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

    const { search } = await req.json().catch(() => ({ search: '' }));
    console.log('Admin fetching consultations, search:', search);

    // Get all consultations
    let query = supabaseAdmin
      .from('consultations')
      .select('id, user_id, business_name, industry, status, service_type, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`business_name.ilike.%${search}%,industry.ilike.%${search}%`);
    }

    const { data: consultations, error: consultationsError } = await query;

    if (consultationsError) {
      console.error('Error fetching consultations:', consultationsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch consultations' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user emails
    const userIds = [...new Set(consultations?.map((c: { user_id: string }) => c.user_id) || [])];
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    
    const userEmails: Record<string, string> = {};
    usersData?.users?.forEach((u: { id: string; email?: string }) => {
      userEmails[u.id] = u.email || 'Unknown';
    });

    // Enrich consultations with user emails
    const enrichedConsultations = consultations?.map((c: any) => ({
      id: c.id,
      user_id: c.user_id,
      user_email: userEmails[c.user_id] || 'Unknown',
      business_name: c.business_name || 'Untitled',
      industry: c.industry || 'N/A',
      status: c.status,
      service_type: c.service_type || 'N/A',
      created_at: c.created_at,
      updated_at: c.updated_at,
    })) || [];

    console.log(`Returning ${enrichedConsultations.length} consultations`);

    return new Response(JSON.stringify(enrichedConsultations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in admin-get-consultations:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
