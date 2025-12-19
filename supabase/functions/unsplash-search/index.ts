import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// CORS with origin whitelist for security
const allowedOrigins = [
  'https://page-consult-ai.lovable.app',
  'https://preview--page-consult-ai.lovable.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && allowedOrigins.some(o => origin.startsWith(o.replace(/\/$/, '')))
    ? origin 
    : allowedOrigins[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };
}

// Validation schema
const UnsplashSearchSchema = z.object({
  query: z.string().trim().min(1).max(200),
  page: z.number().int().min(1).max(100).default(1),
  perPage: z.number().int().min(1).max(30).default(12),
});

serve(async (req) => {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Unsplash search request received');
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // SECURITY FIX: Use proper Supabase auth verification instead of manual JWT decode
    const verifyClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user }, error: authError } = await verifyClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth verification failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const userId = user.id;
    console.log('User authenticated:', userId);

    // Use service role key for database operations (quota checking)
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

    // Parse and validate request body
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      requestBody = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate request body against schema
    const validation = UnsplashSearchSchema.safeParse(requestBody);
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters', details: 'Request validation failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query, page, perPage } = validation.data;
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
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
    const origin = req.headers.get('Origin');
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
    );
  }
});
