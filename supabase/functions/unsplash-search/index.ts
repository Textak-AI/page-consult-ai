import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, page = 1, perPage = 12 } = await req.json();
    const unsplashKey = Deno.env.get('UNSPLASH_ACCESS_KEY');

    if (!unsplashKey) {
      console.error('UNSPLASH_ACCESS_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Unsplash API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching Unsplash for:', query);

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${unsplashKey}`,
          'Accept-Version': 'v1',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Unsplash API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch from Unsplash' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
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

    return new Response(
      JSON.stringify({ results, total: data.total }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in unsplash-search function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
