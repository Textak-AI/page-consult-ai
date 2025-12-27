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
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if admin
    if (!ADMIN_EMAILS.includes(user.email || '')) {
      console.log('User not admin:', user.email);
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Admin deleting user:', userId);

    // Delete user's data first (cascade should handle most, but being explicit)
    await supabaseAdmin.from('landing_pages').delete().eq('user_id', userId);
    await supabaseAdmin.from('consultations').delete().eq('user_id', userId);
    await supabaseAdmin.from('consultation_drafts').delete().eq('user_id', userId);
    await supabaseAdmin.from('consultation_sessions').delete().eq('user_id', userId);
    await supabaseAdmin.from('brand_briefs').delete().eq('user_id', userId);
    await supabaseAdmin.from('user_usage').delete().eq('user_id', userId);
    await supabaseAdmin.from('user_plans').delete().eq('user_id', userId);
    await supabaseAdmin.from('usage_log').delete().eq('user_id', userId);
    await supabaseAdmin.from('persona_intelligence').delete().eq('user_id', userId);
    await supabaseAdmin.from('generation_logs').delete().eq('user_id', userId);
    await supabaseAdmin.from('testimonial_requests').delete().eq('user_id', userId);

    // Delete the user from auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return new Response(JSON.stringify({ error: 'Failed to delete user' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User deleted successfully:', userId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in admin-delete-user:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
