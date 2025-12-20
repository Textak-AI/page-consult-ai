import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Replicate from 'https://esm.sh/replicate@0.25.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { 
      prompt,
      sectionType,
      industry,
      quality,
      aspectRatio
    } = await req.json()

    console.log('Generating image for section:', sectionType)
    console.log('Prompt:', prompt)
    console.log('Quality:', quality)

    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN')
    if (!REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not configured')
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN
    })

    // Enhance prompt for better results
    const enhancedPrompt = `${prompt}. 
Professional, modern, high-quality photography style.
Well-lit, suitable for a business landing page.
No text or words in the image.
Industry context: ${industry}.
Mood: Confident, trustworthy, innovative.`

    // Choose model based on quality
    const model = quality === 'quick' 
      ? 'black-forest-labs/flux-schnell'
      : 'black-forest-labs/flux-dev'

    console.log('Using model:', model)

    const output = await replicate.run(model, {
      input: {
        prompt: enhancedPrompt,
        aspect_ratio: aspectRatio === 'wide' ? '16:9' : '1:1',
        num_outputs: 4,
        output_format: 'webp',
        output_quality: 80
      }
    })

    console.log('Generation complete, images count:', Array.isArray(output) ? output.length : 0)

    return new Response(JSON.stringify({ 
      success: true, 
      images: output,
      model: model
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error generating image:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
