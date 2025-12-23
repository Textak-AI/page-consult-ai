import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limits
const LIMITS = {
  perUserPerDay: 20,      // Max 20 generation requests per user per day
  perUserPerHour: 8,      // Max 8 per hour
};

interface GenerateBrandSceneRequest {
  logoUrl: string;
  industry: string;
  subcategory?: string;
  styleKeywords?: string;
  userId?: string;
  consultationId?: string;
}

// Industry-specific brand scene prompts
const INDUSTRY_BRAND_SCENES: Record<string, Record<string, string[]>> = {
  "Professional Services": {
    "Consulting": [
      "Executive boardroom during strategy presentation, logo displayed on large wall-mounted screen, leather chairs around mahogany table, city skyline through floor-to-ceiling windows, morning golden light",
      "Modern glass office building exterior at golden hour, company logo on elegant brushed metal signage at entrance"
    ],
    "Legal": [
      "Prestigious law firm lobby, logo in brushed bronze on dark marble wall behind reception, leather seating",
      "Corner office in high-rise, logo on glass door, city view, mahogany desk with legal documents"
    ],
    "default": [
      "Professional office lobby, company logo on reception wall, modern furniture, natural lighting",
      "Business conference room, logo on presentation screen, executives in meeting"
    ]
  },
  "Healthcare / Medical": {
    "default": [
      "Modern hospital lobby, company logo on sleek white reception wall, healing garden visible through glass, calming atmosphere",
      "Medical professional in white coat holding tablet displaying company logo, clean clinical environment"
    ]
  },
  "B2B SaaS / Software": {
    "default": [
      "Tech startup open office, company logo on large curved monitor at center, developers collaborating, modern industrial design",
      "Product launch event stage, logo on massive LED screen behind presenter, dramatic purple and blue lighting"
    ]
  },
  "Financial Services": {
    "default": [
      "Bank headquarters lobby, company logo in brushed steel on marble feature wall, elegant and secure atmosphere",
      "Wealth management private office, logo etched on glass door, city skyline view, premium furnishings"
    ]
  },
  "E-commerce / Retail": {
    "default": [
      "Modern fulfillment center, company logo on wall above organized shelving, efficient logistics operation",
      "Pop-up retail store, logo on storefront signage, attractive window display, urban shopping district"
    ]
  },
  "Education / EdTech": {
    "default": [
      "Modern e-learning studio, logo on screen, professional educational setup",
      "Executive training room, logo on presentation display, professional learning environment"
    ]
  },
  "Real Estate / Property": {
    "default": [
      "Modern commercial building lobby, logo on wall behind reception, professional property",
      "Upscale real estate office, logo on window signage, welcoming professional space"
    ]
  },
  "Manufacturing / Industrial": {
    "default": [
      "Clean high-tech factory floor, logo on equipment or wall, modern industrial setting",
      "Precision manufacturing facility, logo on machinery, professional industrial environment"
    ]
  },
  "Agency / Creative": {
    "default": [
      "Creative design studio, logo on wall art display, artistic professional space",
      "Modern agency office, logo on presentation screen, creative team environment"
    ]
  },
  "default": {
    "default": [
      "Professional business environment, company logo prominently displayed on elegant wall signage, natural lighting",
      "Modern office lobby, logo on reception wall, professional atmosphere"
    ]
  }
};

function getSceneTemplates(industry: string, subcategory?: string): string[] {
  const industryTemplates = INDUSTRY_BRAND_SCENES[industry] || INDUSTRY_BRAND_SCENES["default"];
  const subcategoryTemplates = subcategory ? industryTemplates[subcategory] : null;
  return subcategoryTemplates || industryTemplates["default"] || INDUSTRY_BRAND_SCENES["default"]["default"];
}

function buildPrompt(sceneTemplate: string, styleKeywords?: string): string {
  let prompt = `Create a photorealistic brand placement photograph.

SCENE DESCRIPTION: ${sceneTemplate}

CRITICAL REQUIREMENTS:
1. Place the provided company logo PROMINENTLY and NATURALLY in the described location
2. The logo must be CRISP, CLEARLY READABLE, and PROPERLY SCALED for the scene
3. The logo should look like it genuinely BELONGS in this environment
4. Photorealistic quality - this should look like a real photograph
5. 16:9 aspect ratio, landscape orientation
6. Professional commercial photography lighting and composition
7. No additional text, watermarks, or overlays - ONLY the provided logo
8. High resolution, sharp focus on the logo area`;

  if (styleKeywords) {
    prompt += `\n\nStyle preferences: ${styleKeywords}`;
  }

  prompt += `\n\nThe viewer should immediately feel "This is this company's space" - the logo placement should feel intentional and premium.`;

  return prompt;
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function fetchLogoAsBase64(logoUrl: string): Promise<{ data: string; mimeType: string }> {
  console.log('[brand-scene] Fetching logo from:', logoUrl.substring(0, 80) + '...');
  
  const response = await fetch(logoUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch logo: ${response.status}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binary);
  
  const contentType = response.headers.get('content-type') || 'image/png';
  const mimeType = contentType.split(';')[0].trim();
  
  console.log('[brand-scene] Logo fetched, size:', uint8Array.length, 'bytes');
  
  return { data: base64, mimeType };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { logoUrl, industry, subcategory, styleKeywords, userId, consultationId }: GenerateBrandSceneRequest = await req.json();

    if (!logoUrl) {
      return new Response(
        JSON.stringify({ error: 'Logo URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!industry) {
      return new Response(
        JSON.stringify({ error: 'Industry is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch logo and create hash for cache key
    const logo = await fetchLogoAsBase64(logoUrl);
    const logoHash = await hashString(logo.data.slice(0, 1000));
    const cacheKey = `${logoHash}::${industry.toLowerCase()}::${(subcategory || 'default').toLowerCase()}`;

    console.log('[brand-scene] Cache key:', cacheKey);

    // CHECK CACHE FIRST
    const { data: cached } = await supabase
      .from('brand_scene_cache')
      .select('scenes')
      .eq('cache_key', cacheKey)
      .maybeSingle();

    if (cached?.scenes) {
      console.log('[brand-scene] Cache HIT - returning cached scenes');
      
      // Log the cache hit
      if (userId) {
        await supabase.from('brand_scene_generations').insert({
          user_id: userId,
          consultation_id: consultationId,
          cache_key: cacheKey,
          scenes_count: Array.isArray(cached.scenes) ? cached.scenes.length : 1,
          from_cache: true,
        });
      }

      return new Response(
        JSON.stringify({ 
          images: cached.scenes, 
          fromCache: true,
          prompt: '',
          type: 'brand-scene'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[brand-scene] Cache MISS - generating new scene');

    // CHECK RATE LIMITS (only for non-cached requests)
    if (userId) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      // Check daily limit
      const { count: dailyCount } = await supabase
        .from('brand_scene_generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('from_cache', false)
        .gte('created_at', oneDayAgo);

      if ((dailyCount || 0) >= LIMITS.perUserPerDay) {
        console.log('[brand-scene] Daily rate limit exceeded for user:', userId);
        return new Response(
          JSON.stringify({ 
            error: 'Daily limit reached. Your brand scenes are cached - try again tomorrow for new variations.',
            limitType: 'daily'
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check hourly limit
      const { count: hourlyCount } = await supabase
        .from('brand_scene_generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('from_cache', false)
        .gte('created_at', oneHourAgo);

      if ((hourlyCount || 0) >= LIMITS.perUserPerHour) {
        console.log('[brand-scene] Hourly rate limit exceeded for user:', userId);
        return new Response(
          JSON.stringify({ 
            error: 'Please wait a bit before generating more scenes.',
            limitType: 'hourly',
            retryAfter: 60
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // GENERATE NEW SCENE using Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sceneTemplates = getSceneTemplates(industry, subcategory);
    const sceneTemplate = sceneTemplates[Math.floor(Math.random() * sceneTemplates.length)];
    const prompt = buildPrompt(sceneTemplate, styleKeywords);

    console.log('[brand-scene] Using scene template:', sceneTemplate.substring(0, 80) + '...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${logo.mimeType};base64,${logo.data}`
                }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[brand-scene] AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.', limitType: 'ai' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate brand scene' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('[brand-scene] AI response received');

    // Extract the generated image
    const images = data.choices?.[0]?.message?.images?.map(
      (img: { image_url: { url: string } }) => img.image_url.url
    ) || [];

    if (images.length === 0) {
      console.warn('[brand-scene] No images in response');
      return new Response(
        JSON.stringify({ error: 'No image generated', images: [], prompt }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[brand-scene] Generated', images.length, 'brand scene(s)');

    // CACHE THE RESULT
    const { error: cacheError } = await supabase
      .from('brand_scene_cache')
      .upsert({
        cache_key: cacheKey,
        logo_hash: logoHash,
        industry,
        subcategory: subcategory || null,
        scenes: images,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'cache_key'
      });

    if (cacheError) {
      console.error('[brand-scene] Failed to cache:', cacheError);
    }

    // LOG THE GENERATION
    if (userId) {
      await supabase.from('brand_scene_generations').insert({
        user_id: userId,
        consultation_id: consultationId,
        cache_key: cacheKey,
        scenes_count: images.length,
        from_cache: false,
      });
    }

    return new Response(
      JSON.stringify({
        images,
        prompt,
        industry,
        subcategory,
        type: 'brand-scene',
        fromCache: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[brand-scene] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
