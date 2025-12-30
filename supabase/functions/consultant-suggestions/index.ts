import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const { triggerType, newData, currentSections, fullContext } = await req.json();

    if (!triggerType || !currentSections) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: triggerType and currentSections' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a strategic landing page consultant. A user just made an edit that could significantly improve their page. Analyze the change and suggest specific copy updates.

You respond ONLY with valid JSON, no markdown, no explanation outside the JSON.

TONE GUIDELINES FOR REASONING:
- Conversational, like a smart colleague
- Strategic, not just descriptive
- Specific to their business, not generic
- Confident but not pushy
- Examples: 
  - "This is gold — lead with it"
  - "Your Fortune 500 credibility should be front and center"
  - "I'd move this number to the stats bar — it's too powerful to bury in a paragraph"
  - "This testimonial has a specific metric. Let's pull that into the hero."`;

    const userPrompt = `WHAT CHANGED:
Type: ${triggerType}
New Data: ${JSON.stringify(newData)}

CURRENT PAGE SECTIONS:
${JSON.stringify(currentSections, null, 2)}

BUSINESS CONTEXT:
- Company: ${fullContext?.companyName || 'Unknown'}
- Industry: ${fullContext?.industry || 'Unknown'}
- Value Prop: ${fullContext?.valueProposition || 'Unknown'}
- Target: ${fullContext?.targetAudience || 'Unknown'}
- Goal: ${fullContext?.pageGoal || 'Convert visitors'}

YOUR TASK:
1. Analyze how this new information should change the page
2. Suggest 2-4 specific copy changes (don't overwhelm)
3. For each, explain WHY in a conversational, strategic way
4. Focus on high-impact changes that leverage the new insight
5. Be specific - show exact before/after copy

Respond in this JSON format:
{
  "summary": "A conversational 1-2 sentence intro explaining your overall recommendation",
  "suggestions": [
    {
      "id": "unique-id-1",
      "section": "hero",
      "field": "headline",
      "currentValue": "Current headline text",
      "suggestedValue": "New headline that incorporates the insight",
      "reasoning": "Conversational explanation of why this change matters",
      "impact": "high"
    }
  ]
}

IMPORTANT: Return ONLY valid JSON. No markdown code blocks, no explanation outside the JSON.`;

    console.log('[consultant-suggestions] Requesting suggestions for trigger:', triggerType);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('[consultant-suggestions] AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('[consultant-suggestions] Raw AI response:', content.substring(0, 200));

    // Clean up the response - remove markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.slice(7);
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith('```')) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    const suggestions = JSON.parse(cleanedContent);

    // Ensure all suggestions have proper IDs and status
    if (suggestions.suggestions) {
      suggestions.suggestions = suggestions.suggestions.map((s: any, index: number) => ({
        ...s,
        id: s.id || `suggestion-${Date.now()}-${index}`,
        status: 'pending',
      }));
    }

    console.log('[consultant-suggestions] Parsed', suggestions.suggestions?.length || 0, 'suggestions');

    return new Response(
      JSON.stringify(suggestions),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[consultant-suggestions] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate suggestions';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
