import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

// Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

// Anonymize name for display
function anonymizeName(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[1].charAt(0)}.`;
    }
    return parts[0];
  }
  // Use email prefix
  const prefix = email.split('@')[0];
  if (prefix.length <= 3) return prefix;
  return `${prefix.substring(0, 3)}***`;
}

// Extract location from email domain (rough approximation)
function inferLocation(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  
  // Common TLD to location mapping
  const tldLocations: Record<string, string> = {
    'de': 'Germany',
    'uk': 'UK',
    'co.uk': 'UK',
    'fr': 'France',
    'es': 'Spain',
    'it': 'Italy',
    'nl': 'Netherlands',
    'au': 'Australia',
    'ca': 'Canada',
    'jp': 'Japan',
    'br': 'Brazil',
    'in': 'India',
  };

  for (const [tld, location] of Object.entries(tldLocations)) {
    if (domain.endsWith(`.${tld}`)) {
      return location;
    }
  }

  return 'Online';
}

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const pageId = url.searchParams.get('pageId');

    if (!pageId) {
      console.error('Missing pageId');
      return new Response(
        JSON.stringify({ success: false, error: 'Page ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get page info
    const { data: page, error: pageError } = await supabase
      .from('beta_pages')
      .select('id, total_signups, signup_goal, status')
      .eq('id', pageId)
      .single();

    if (pageError || !page) {
      console.error('Page not found:', pageId, pageError);
      return new Response(
        JSON.stringify({ success: false, error: 'Page not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if page is published (only public pages can have stats viewed publicly)
    if (page.status !== 'published') {
      console.error('Page not published:', pageId);
      return new Response(
        JSON.stringify({ success: false, error: 'Page not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get today's signup count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: todaySignups } = await supabase
      .from('beta_signups')
      .select('id', { count: 'exact', head: true })
      .eq('page_id', pageId)
      .gte('created_at', today.toISOString());

    // Get recent 10 signups for ticker
    const { data: recentSignupsRaw } = await supabase
      .from('beta_signups')
      .select('name, email, created_at')
      .eq('page_id', pageId)
      .order('created_at', { ascending: false })
      .limit(10);

    const recentSignups = (recentSignupsRaw || []).map((signup) => ({
      name: anonymizeName(signup.name, signup.email),
      location: inferLocation(signup.email),
      time: formatRelativeTime(new Date(signup.created_at)),
    }));

    console.log('Stats fetched for page:', pageId, 'Total:', page.total_signups, 'Today:', todaySignups);

    return new Response(
      JSON.stringify({
        success: true,
        totalSignups: page.total_signups || 0,
        signupGoal: page.signup_goal || 1000,
        todaySignups: todaySignups || 0,
        recentSignups,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in beta-stats:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
