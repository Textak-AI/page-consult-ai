import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateBrandSceneRequest {
  logoUrl: string;
  industry: string;
  subcategory?: string;
  styleKeywords?: string;
}

// Industry-specific brand scene prompts
const INDUSTRY_BRAND_SCENES: Record<string, Record<string, string>> = {
  "Professional Services": {
    "Consulting": "Modern executive conference room during a strategy presentation, logo on the main display screen, natural light from floor-to-ceiling windows, elegant minimalist furniture",
    "Legal": "Prestigious law firm lobby, logo on elegant wall signage behind a sleek reception desk, marble and wood finishes, subtle professional lighting",
    "Accounting": "Professional office with logo on glass door entrance, clean modern interior visible, organized workspace",
    "default": "Professional office environment with the logo displayed prominently on wall signage or screen"
  },
  "Healthcare / Medical": {
    "Digital Health": "Modern telehealth setup, logo on computer screen, calming medical office environment with natural light",
    "Medical Devices": "Clean clinical environment, logo on modern medical equipment display, sterile professional setting",
    "Wellness": "Serene wellness spa reception, logo on natural wood signage, plants and soft lighting",
    "default": "Healthcare facility lobby, logo on reception wall, calming professional atmosphere with soft lighting"
  },
  "B2B SaaS / Software": {
    "Developer Tools": "Tech startup office, logo on large curved monitor among coding screens, modern workspace with team visible",
    "AI / Machine Learning": "Futuristic tech environment, logo on sleek display, ambient blue lighting, high-tech atmosphere",
    "Marketing Technology": "Modern marketing agency, logo on presentation screen, creative team workspace",
    "default": "Modern tech office, logo on presentation screen during team collaboration"
  },
  "Financial Services": {
    "Fintech": "Modern fintech office, logo on trading screens, sleek contemporary design",
    "Banking": "Elegant bank branch, logo on marble wall, professional and trustworthy atmosphere",
    "default": "Professional financial office, logo on wall display, trustworthy corporate environment"
  },
  "E-commerce / Retail": {
    "Fashion": "Stylish retail boutique, logo on store window and shopping bags, modern design",
    "Consumer Goods": "Premium product showroom, logo on display signage, well-lit retail environment",
    "default": "Modern retail space, logo on store signage, clean commercial environment"
  },
  "Education / EdTech": {
    "Online Learning": "Modern e-learning studio, logo on screen, professional educational setup",
    "Corporate Training": "Executive training room, logo on presentation display, professional learning environment",
    "default": "Modern educational facility, logo on wall or screen, bright learning atmosphere"
  },
  "Real Estate / Property": {
    "Commercial": "Modern commercial building lobby, logo on wall behind reception, professional property",
    "Residential": "Upscale real estate office, logo on window signage, welcoming professional space",
    "default": "Real estate office with logo prominently displayed, professional property environment"
  },
  "Manufacturing / Industrial": {
    "Technology Manufacturing": "Clean high-tech factory floor, logo on equipment or wall, modern industrial setting",
    "Precision Engineering": "Precision manufacturing facility, logo on machinery, professional industrial environment",
    "default": "Modern manufacturing facility, logo on equipment or signage, clean industrial setting"
  },
  "Agency / Creative": {
    "Design Agency": "Creative design studio, logo on wall art display, artistic professional space",
    "Marketing Agency": "Modern agency office, logo on presentation screen, creative team environment",
    "default": "Creative agency workspace, logo displayed artistically, inspiring professional environment"
  },
  "Food & Beverage": {
    "Restaurant": "Upscale restaurant entrance, logo on elegant signage, inviting dining atmosphere",
    "Beverage": "Modern bar or cafe, logo on wall display or menu board, warm ambiance",
    "default": "Food establishment with logo on signage, welcoming professional atmosphere"
  },
  "Nonprofit / Impact": {
    "Social Impact": "Community center or nonprofit office, logo on wall, warm and welcoming environment",
    "Environmental": "Green eco-friendly office, logo with natural elements, sustainable design",
    "default": "Impact-focused organization space, logo displayed prominently, mission-driven environment"
  },
  "default": {
    "default": "Professional business environment, company logo prominently displayed on elegant wall signage or modern screen display, natural lighting, high quality"
  }
};

function buildBrandScenePrompt(
  industry: string, 
  subcategory?: string,
  styleKeywords?: string
): string {
  const scenes = INDUSTRY_BRAND_SCENES[industry] || INDUSTRY_BRAND_SCENES.default;
  const scene = subcategory ? (scenes[subcategory] || scenes.default) : scenes.default;
  
  let prompt = `Place this company logo naturally and prominently in the following professional scene. 
The logo must remain crisp, readable, and properly integrated into the environment.

Scene: ${scene}`;

  if (styleKeywords) {
    prompt += `\n\nStyle preferences: ${styleKeywords}`;
  }

  prompt += `

Requirements:
- The logo should look like it naturally belongs in the scene - on a screen, sign, wall display, or surface appropriate to the setting
- Maintain the logo's original colors and proportions
- Photorealistic rendering, professional photography quality
- 16:9 aspect ratio, high resolution
- No text other than the logo itself
- Soft natural lighting that complements the scene`;

  return prompt;
}

async function fetchLogoAsBase64(logoUrl: string): Promise<{ data: string; mimeType: string }> {
  console.log('🖼️ Fetching logo from:', logoUrl);
  
  const response = await fetch(logoUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch logo: ${response.status}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Convert to base64
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binary);
  
  // Determine mime type from URL or response headers
  const contentType = response.headers.get('content-type') || 'image/png';
  const mimeType = contentType.split(';')[0].trim();
  
  console.log('✅ Logo fetched, size:', uint8Array.length, 'bytes, type:', mimeType);
  
  return { data: base64, mimeType };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { logoUrl, industry, subcategory, styleKeywords }: GenerateBrandSceneRequest = await req.json();

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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎨 Generating brand scene for industry:', industry, 'subcategory:', subcategory);

    // Fetch logo as base64
    const logo = await fetchLogoAsBase64(logoUrl);
    
    // Build the prompt
    const prompt = buildBrandScenePrompt(industry, subcategory, styleKeywords);
    console.log('📝 Prompt:', prompt.substring(0, 200) + '...');

    // Call Lovable AI Gateway with Gemini image generation
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
              {
                type: 'text',
                text: prompt
              },
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
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
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
    console.log('✅ AI response received');

    // Extract the generated image
    const images = data.choices?.[0]?.message?.images?.map(
      (img: { image_url: { url: string } }) => img.image_url.url
    ) || [];

    if (images.length === 0) {
      console.warn('⚠️ No images in response');
      return new Response(
        JSON.stringify({ error: 'No image generated', images: [], prompt }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🖼️ Generated', images.length, 'brand scene image(s)');

    return new Response(
      JSON.stringify({
        images,
        prompt,
        industry,
        subcategory,
        type: 'brand-scene'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating brand scene:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
