import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

// Validation schema - supports both legacy query and smart industry-based search
const UnsplashSearchSchema = z.object({
  query: z.string().trim().min(1).max(200).optional(),
  industry: z.string().optional(),
  subIndustry: z.string().optional(),
  pageType: z.string().optional(),
  tone: z.string().optional(),
  page: z.number().int().min(1).max(100).default(1),
  perPage: z.number().int().min(1).max(30).default(12),
});

// Industry-specific visual themes for smart queries
const INDUSTRY_VISUALS: Record<string, { primary: string[]; style: string[] }> = {
  'saas': {
    primary: ['modern office workspace', 'technology interface', 'digital collaboration'],
    style: ['minimal', 'professional', 'bright'],
  },
  'marketing': {
    primary: ['creative workspace', 'marketing strategy', 'data dashboard'],
    style: ['dynamic', 'colorful', 'energetic'],
  },
  'environmental': {
    primary: ['nature restoration', 'clean water landscape', 'green technology'],
    style: ['natural', 'hopeful', 'professional'],
  },
  'consulting': {
    primary: ['executive meeting', 'strategy session', 'business discussion'],
    style: ['premium', 'trustworthy', 'warm'],
  },
  'healthcare': {
    primary: ['medical professional', 'healthcare technology', 'modern clinic'],
    style: ['clean', 'trustworthy', 'caring'],
  },
  'finance': {
    primary: ['financial district', 'modern banking', 'wealth management'],
    style: ['prestigious', 'secure', 'modern'],
  },
  'education': {
    primary: ['modern learning', 'workshop training', 'knowledge sharing'],
    style: ['inspiring', 'bright', 'hopeful'],
  },
  'realestate': {
    primary: ['modern architecture', 'luxury interior', 'city skyline'],
    style: ['aspirational', 'luxurious', 'bright'],
  },
  'technology': {
    primary: ['innovation technology', 'futuristic workspace', 'tech startup'],
    style: ['cutting-edge', 'modern', 'sleek'],
  },
  'default': {
    primary: ['modern business', 'professional workspace', 'success achievement'],
    style: ['professional', 'clean', 'modern'],
  },
};

function detectIndustryKey(industry: string, subIndustry?: string): string {
  const combined = `${industry} ${subIndustry || ''}`.toLowerCase();
  
  if (combined.includes('saas') || combined.includes('software')) return 'saas';
  if (combined.includes('marketing') || combined.includes('sales')) return 'marketing';
  if (combined.includes('environmental') || combined.includes('waste')) return 'environmental';
  if (combined.includes('consulting') || combined.includes('professional service')) return 'consulting';
  if (combined.includes('health') || combined.includes('medical')) return 'healthcare';
  if (combined.includes('finance') || combined.includes('fintech')) return 'finance';
  if (combined.includes('education') || combined.includes('training')) return 'education';
  if (combined.includes('real estate') || combined.includes('property')) return 'realestate';
  if (combined.includes('tech') || combined.includes('ai') || combined.includes('startup')) return 'technology';
  
  return 'default';
}

function generateSmartQueries(industry: string, subIndustry?: string): string[] {
  const industryKey = detectIndustryKey(industry, subIndustry);
  const config = INDUSTRY_VISUALS[industryKey] || INDUSTRY_VISUALS['default'];
  
  return [
    `${config.primary[0]} ${config.style[0]}`,
    `${config.primary[1] || config.primary[0]} ${config.style[1] || config.style[0]}`,
    `${config.primary[0]} minimal negative space`,
    `${config.style[0]} business professional`,
  ];
}

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

    const { query: legacyQuery, industry, subIndustry, page, perPage } = validation.data;
    
    // Build smart queries if industry provided, otherwise use legacy query
    let searchQueries: string[];
    if (industry) {
      searchQueries = generateSmartQueries(industry, subIndustry);
      console.log('🧠 Smart queries generated for industry:', industry, '->', searchQueries);
    } else if (legacyQuery) {
      searchQueries = [legacyQuery];
    } else {
      return new Response(
        JSON.stringify({ error: 'Either query or industry parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const unsplashKey = Deno.env.get('UNSPLASH_ACCESS_KEY');

    if (!unsplashKey) {
      console.error('UNSPLASH_ACCESS_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Unsplash API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try each query until we get good results
    let allResults: any[] = [];
    let successfulQuery = '';
    
    for (const searchQuery of searchQueries) {
      console.log(`🔍 Searching Unsplash: "${searchQuery}"`);
      
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&page=${page}&per_page=${perPage}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${unsplashKey}`,
            'Accept-Version': 'v1',
          },
        }
      );

      if (!response.ok) {
        console.warn(`Query "${searchQuery}" failed with status:`, response.status);
        continue;
      }

      const data = await response.json();
      
      if (data.results?.length >= 3) {
        console.log(`✓ Query "${searchQuery}" returned ${data.results.length} images`);
        allResults = data.results;
        successfulQuery = searchQuery;
        break;
      } else if (data.results?.length > 0 && allResults.length === 0) {
        // Store partial results in case no query returns 3+ images
        allResults = data.results;
        successfulQuery = searchQuery;
      }
    }
    
    if (allResults.length === 0) {
      console.warn('No images found for any query');
      return new Response(
        JSON.stringify({ results: [], total: 0, usedQuery: searchQueries[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📸 Returning ${allResults.length} images from query: "${successfulQuery}"`);
    
    // Transform the response to only include what we need
    const results = allResults.map((photo: any) => ({
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
      JSON.stringify({ results, total: results.length, usedQuery: successfulQuery }),
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
