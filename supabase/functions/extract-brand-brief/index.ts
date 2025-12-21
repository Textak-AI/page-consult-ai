import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfBase64, fileName, userId } = await req.json();
    
    if (!pdfBase64 || !userId) {
      throw new Error('Missing required fields: pdfBase64 and userId');
    }

    console.log('[extract-brand-brief] Starting extraction for user:', userId);
    console.log('[extract-brand-brief] File:', fileName);
    
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const anthropic = new Anthropic({
      apiKey: anthropicApiKey,
    });
    
    console.log('[extract-brand-brief] Calling Claude API...');
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: pdfBase64,
            },
          },
          {
            type: 'text',
            text: `You are a brand strategist extracting guidelines from a brand document.

Extract brand guidelines and return ONLY valid JSON (no markdown, no explanation):

{
  "colors": {
    "primary": { "hex": "#XXXXXX", "name": "Color name" },
    "secondary": { "hex": "#XXXXXX", "name": "Color name" },
    "accent": { "hex": "#XXXXXX", "name": "Color name" }
  },
  "typography": {
    "headlineFont": "Font family name",
    "headlineWeight": "700",
    "bodyFont": "Font family name",
    "bodyWeight": "400"
  },
  "voiceTone": {
    "personality": ["trait1", "trait2", "trait3"],
    "description": "One sentence describing the brand voice",
    "doSay": ["preferred phrase 1", "preferred phrase 2"],
    "dontSay": ["forbidden phrase 1", "forbidden phrase 2"]
  }
}

Rules:
- Extract ACTUAL values from the document
- For colors, look for hex codes, RGB values, or color names with swatches
- For typography, look for font family names (e.g., Inter, Helvetica, Roboto)
- For voice, look for tone guidelines, personality traits, do/don't lists
- If a value isn't found, use null
- Return ONLY the JSON object, nothing else`
          }
        ],
      }],
    });

    const extractedText = response.content[0].type === 'text' ? response.content[0].text : '';
    console.log('[extract-brand-brief] Raw response:', extractedText.slice(0, 500));
    
    // Parse the JSON response
    let extracted;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extracted = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('[extract-brand-brief] JSON parse error:', parseError);
      throw new Error('Failed to parse extracted brand data');
    }

    console.log('[extract-brand-brief] Extracted:', JSON.stringify(extracted, null, 2));

    // Save to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upsert brand brief (one per user)
    const { data, error } = await supabase
      .from('brand_briefs')
      .upsert({
        user_id: userId,
        name: fileName?.replace('.pdf', '') || 'My Brand',
        colors: extracted.colors || {},
        typography: extracted.typography || {},
        voice_tone: extracted.voiceTone || {},
        source_file_name: fileName,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) {
      console.error('[extract-brand-brief] Database error:', error);
      throw error;
    }

    console.log('[extract-brand-brief] Saved brand brief:', data.id);

    return new Response(JSON.stringify({ success: true, brandBrief: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[extract-brand-brief] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
