import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const { image, mimeType } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided', colors: [] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured', colors: [] }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎨 Extracting colors from logo image...');

    // Use Lovable AI with vision to extract brand colors
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType || 'image/png'};base64,${image}`
                }
              },
              {
                type: 'text',
                text: `Analyze this logo image and extract the 2-4 most prominent brand colors.
                
Rules:
- Return colors as hex codes (e.g., #3298ED)
- Order by visual prominence (most dominant first)
- Ignore pure white (#FFFFFF) and pure black (#000000) unless they are the primary brand colors
- Focus on the main brand colors, not background or subtle accents

Return ONLY a valid JSON array of hex color strings, nothing else.
Example: ["#3298ED", "#1A1A1A", "#F5A623"]`
              }
            ]
          }
        ],
        max_tokens: 150,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI extraction failed', colors: [] }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('🎨 AI response:', content);

    // Parse the JSON array from the response
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const colors = JSON.parse(jsonMatch[0]);
        
        // Validate and clean colors
        const validColors = colors
          .filter((c: unknown) => typeof c === 'string' && /^#[0-9A-Fa-f]{6}$/.test(c))
          .map((c: string) => c.toUpperCase())
          .slice(0, 4);
        
        console.log('🎨 Extracted colors:', validColors);
        
        return new Response(
          JSON.stringify({ colors: validColors, success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (parseError) {
      console.error('Failed to parse colors:', parseError);
    }

    // Fallback: return empty array if parsing fails
    return new Response(
      JSON.stringify({ colors: [], success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Extract colors error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', colors: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
