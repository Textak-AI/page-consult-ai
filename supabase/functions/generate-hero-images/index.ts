import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  prompts: string[];
  cacheKey: string;
  forceRegenerate?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompts, cacheKey, forceRegenerate = false }: GenerateRequest = await req.json();

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'prompts array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
    if (!REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache if not forcing regeneration
    if (!forceRegenerate) {
      const { data: cached } = await supabase
        .from('hero_image_cache')
        .select('images')
        .eq('cache_key', cacheKey)
        .single();

      if (cached?.images && cached.images.length > 0) {
        console.log('[generate-hero-images] Returning cached images for:', cacheKey);
        return new Response(
          JSON.stringify({ 
            images: cached.images.map((url: string) => ({ url, prompt: '' })),
            fromCache: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('[generate-hero-images] Generating', prompts.length, 'images for:', cacheKey);

    // Generate images in parallel using Replicate
    const imagePromises = prompts.map(async (prompt, index) => {
      try {
        console.log(`[generate-hero-images] Starting generation ${index + 1}/${prompts.length}`);
        
        const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637",
            input: {
              prompt,
              go_fast: true,
              megapixels: "1",
              num_outputs: 1,
              aspect_ratio: "16:9",
              output_format: "webp",
              output_quality: 80,
              num_inference_steps: 4,
            },
          }),
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error(`[generate-hero-images] Replicate create error:`, errorText);
          return null;
        }

        const prediction = await createResponse.json();
        console.log(`[generate-hero-images] Prediction ${index + 1} created:`, prediction.id);

        // Poll for completion
        let result = prediction;
        let attempts = 0;
        const maxAttempts = 60;

        while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: {
              'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            },
          });
          
          result = await statusResponse.json();
          attempts++;
        }

        if (result.status === 'succeeded' && result.output && result.output.length > 0) {
          console.log(`[generate-hero-images] Image ${index + 1} completed`);
          return { url: result.output[0], prompt };
        }

        console.error(`[generate-hero-images] Image ${index + 1} failed:`, result.error);
        return null;
      } catch (error) {
        console.error(`[generate-hero-images] Error generating image ${index + 1}:`, error);
        return null;
      }
    });

    const results = await Promise.all(imagePromises);
    const validImages = results.filter((img): img is { url: string; prompt: string } => img !== null);

    console.log(`[generate-hero-images] Generated ${validImages.length}/${prompts.length} images`);

    if (validImages.length === 0) {
      throw new Error('Failed to generate any images');
    }

    // Cache the results
    const imageUrls = validImages.map(img => img.url);
    
    const { error: upsertError } = await supabase
      .from('hero_image_cache')
      .upsert({
        cache_key: cacheKey,
        images: imageUrls,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'cache_key',
      });

    if (upsertError) {
      console.error('[generate-hero-images] Cache upsert error:', upsertError);
      // Continue anyway, images are generated
    }

    return new Response(
      JSON.stringify({ images: validImages, fromCache: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[generate-hero-images] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
