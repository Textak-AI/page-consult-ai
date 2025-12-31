import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[track-prospect-page-view] Starting...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { prospectPageId, visitorId } = await req.json();

    if (!prospectPageId) {
      return new Response(
        JSON.stringify({ error: 'Prospect page ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get IP and user agent
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] ?? req.headers.get('x-real-ip');
    const userAgent = req.headers.get('user-agent');
    const referrer = req.headers.get('referer');

    console.log('[track-prospect-page-view] Recording view for page:', prospectPageId);

    // Insert view record
    const { error: insertError } = await supabase
      .from('prospect_page_views')
      .insert({
        prospect_page_id: prospectPageId,
        visitor_id: visitorId,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer,
      });

    if (insertError) {
      console.error('[track-prospect-page-view] Insert error:', insertError);
    }

    // Update view count using the database function
    const { error: rpcError } = await supabase.rpc('increment_prospect_page_views', {
      page_id: prospectPageId,
    });

    if (rpcError) {
      console.error('[track-prospect-page-view] RPC error:', rpcError);
    }

    console.log('[track-prospect-page-view] View recorded successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[track-prospect-page-view] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
