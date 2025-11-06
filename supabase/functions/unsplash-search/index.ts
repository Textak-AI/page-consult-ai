import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Unsplash search request received');
    
    // Get user from JWT (already verified by Supabase since verify_jwt = true)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const [, payload] = token.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    const userId = decodedPayload.sub;

    if (!userId) {
      console.error('No user ID in token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', userId);

    // Use service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check user's API usage limit
    const { data: userPlan, error: planError } = await supabaseClient
      .from('user_plans')
      .select('plan_name, api_calls_remaining')
      .eq('user_id', userId)
      .maybeSingle();

    if (planError) {
      console.error('Error fetching user plan:', planError);
    }

    if (userPlan && userPlan.api_calls_remaining <= 0) {
      return new Response(
        JSON.stringify({ error: 'API rate limit exceeded. Please upgrade your plan or wait for the next billing cycle.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query, page = 1, perPage = 12 } = await req.json();
    
    console.log('Unsplash search query:', query, 'page:', page);
    
    const unsplashKey = Deno.env.get('UNSPLASH_ACCESS_KEY');

    if (!unsplashKey) {
      console.error('UNSPLASH_ACCESS_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Unsplash API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling Unsplash API...');
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${unsplashKey}`,
          'Accept-Version': 'v1',
        },
      }
    );

    console.log('Unsplash API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Unsplash API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Failed to fetch from Unsplash: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Unsplash returned', data.results?.length || 0, 'images');
    
    // Transform the response to only include what we need
    const results = data.results.map((photo: any) => ({
      id: photo.id,
      description: photo.description || photo.alt_description || 'Unsplash photo',
      urls: {
        small: photo.urls.small,
        regular: photo.urls.regular,
        full: photo.urls.full,
      },
      user: {
        name: photo.user.name,
        username: photo.user.username,
        link: photo.user.links.html,
      },
      links: {
        download_location: photo.links.download_location,
      },
    }));

    // Decrement API calls for the user
    if (userPlan) {
      console.log('Decrementing API calls for user:', userId);
      await supabaseClient
        .from('user_plans')
        .update({ api_calls_remaining: userPlan.api_calls_remaining - 1 })
        .eq('user_id', userId);
    }

    console.log('Returning', results.length, 'images to client');
    return new Response(
      JSON.stringify({ results, total: data.total }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unsplash search error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
