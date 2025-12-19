import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const systemPrompt = `You extract business intelligence from prospect messages.

Return ONLY valid JSON:
{
  "industry": "Specific industry category or null",
  "audience": "Who they serve/sell to or null", 
  "valueProp": "What value/outcome they provide or null",
  "businessType": "B2B or B2C or Both or null"
}

Be specific:
- "Manufacturing" not "Business"
- "VP Operations at aerospace companies" not "business owners"
- "Supply chain waste reduction" not "consulting"

If something is unclear from this message, return null for that field.
Do not include any text outside the JSON object.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, existingIntelligence } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context from conversation history
    const contextMessages = conversationHistory?.slice(-5).map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })) || [];

    const existingContext = existingIntelligence 
      ? `\n\nAlready extracted:\n- Industry: ${existingIntelligence.industry || 'unknown'}\n- Audience: ${existingIntelligence.audience || 'unknown'}\n- Value Prop: ${existingIntelligence.valueProp || 'unknown'}`
      : '';

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt + existingContext },
          ...contextMessages,
          { role: 'user', content: `Extract intelligence from this message: "${message}"` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    let extracted = { industry: null, audience: null, valueProp: null, businessType: null };
    try {
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extracted = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse extraction:', parseError, content);
    }

    console.log('Extracted intelligence:', extracted);

    return new Response(
      JSON.stringify(extracted),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in demo-extract-intelligence:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        industry: null,
        audience: null,
        valueProp: null,
        businessType: null,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
