import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Verify the requesting user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized - No auth header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🗑️ [Reset Data] Starting for user:', user.id, user.email);

    // Track deletion counts
    const deletionCounts: Record<string, number> = {};

    // Tables to delete from, in order (respecting foreign keys)
    const userIdTables = [
      'landing_pages',
      'beta_pages',
      'consultations',
      'consultation_sessions',
      'consultation_drafts',
      'persona_intelligence',
      'generation_logs',
      'usage_log',
      'testimonial_requests',
      'prospects',
      'prospect_pages',
      'brands',
      'brand_briefs',
      'intelligence_accumulator',
    ];

    // Delete from user_id tables
    for (const table of userIdTables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', user.id)
          .select('id');
        
        if (error) {
          console.error(`❌ Error deleting from ${table}:`, error.message);
          deletionCounts[table] = 0;
        } else {
          const count = data?.length || 0;
          deletionCounts[table] = count;
          console.log(`✅ Deleted ${count} rows from ${table}`);
        }
      } catch (err) {
        console.error(`❌ Exception deleting from ${table}:`, err);
        deletionCounts[table] = 0;
      }
    }

    // Delete demo_sessions (uses claimed_by)
    try {
      const { data, error } = await supabaseAdmin
        .from('demo_sessions')
        .delete()
        .eq('claimed_by', user.id)
        .select('id');
      
      if (error) {
        console.error('❌ Error deleting from demo_sessions:', error.message);
        deletionCounts['demo_sessions'] = 0;
      } else {
        const count = data?.length || 0;
        deletionCounts['demo_sessions'] = count;
        console.log(`✅ Deleted ${count} rows from demo_sessions`);
      }
    } catch (err) {
      console.error('❌ Exception deleting from demo_sessions:', err);
      deletionCounts['demo_sessions'] = 0;
    }

    // Delete guest_sessions (uses converted_to_user_id)
    try {
      const { data, error } = await supabaseAdmin
        .from('guest_sessions')
        .delete()
        .eq('converted_to_user_id', user.id)
        .select('id');
      
      if (error) {
        console.error('❌ Error deleting from guest_sessions:', error.message);
        deletionCounts['guest_sessions'] = 0;
      } else {
        const count = data?.length || 0;
        deletionCounts['guest_sessions'] = count;
        console.log(`✅ Deleted ${count} rows from guest_sessions`);
      }
    } catch (err) {
      console.error('❌ Exception deleting from guest_sessions:', err);
      deletionCounts['guest_sessions'] = 0;
    }

    // Calculate total
    const totalDeleted = Object.values(deletionCounts).reduce((a, b) => a + b, 0);
    
    console.log('🎉 [Reset Data] Complete!', { totalDeleted, deletionCounts });

    return new Response(JSON.stringify({ 
      success: true,
      totalDeleted,
      deletionCounts,
      userId: user.id,
      email: user.email
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Reset data error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
