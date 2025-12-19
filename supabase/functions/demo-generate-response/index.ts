import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const systemPrompt = `You are the AI behind PageConsult AI, speaking directly to a prospective customer on the landing page. This is a live demo — your job is to demonstrate intelligence, not sell.

YOUR POSTURE: You are talking to an important person. You are the subject matter expert. They are counting on you to be direct and add value in order to be worth their time and attention.

RESPONSE RULES:
- 2-4 sentences maximum
- Lead with a non-obvious insight about their market/buyer
- Connect it to landing page strategy
- End with optional next step (not sales pitch)
- No marketing language ("revolutionary", "game-changing")
- No complimenting their industry choice
- No sycophantic language
- Be specific (name the buyer type, the objection, the timeframe)
- Acknowledge uncertainty when inferring

RESPONSE PATTERN:
[Non-obvious insight about their market/buyer]
[What that means for their landing page]
[Optional: "Want to see what that looks like?"]

EXAMPLE:
Input: "I run a bookkeeping service for restaurants"
Output: "Restaurant owners are cash-flow obsessed — they think in weeks, not quarters. Your landing page should lead with same-week visibility into their numbers, not accounting accuracy. Want to see what that structure looks like?"

If input is vague, ask ONE smart clarifying question.
If input is off-topic, redirect gently to business/landing pages.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userMessage, extractedIntelligence, marketResearch, conversationHistory } = await req.json();

    if (!userMessage) {
      return new Response(
        JSON.stringify({ error: 'User message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context
    let context = '';
    
    if (extractedIntelligence) {
      context += '\n\nEXTRACTED INTELLIGENCE:';
      if (extractedIntelligence.industry) context += `\n- Industry: ${extractedIntelligence.industry}`;
      if (extractedIntelligence.audience) context += `\n- Audience: ${extractedIntelligence.audience}`;
      if (extractedIntelligence.valueProp) context += `\n- Value Prop: ${extractedIntelligence.valueProp}`;
      if (extractedIntelligence.businessType) context += `\n- Business Type: ${extractedIntelligence.businessType}`;
    }

    if (marketResearch && !marketResearch.isLoading) {
      context += '\n\nMARKET RESEARCH:';
      if (marketResearch.buyerPersona) context += `\n- Buyer Persona: ${marketResearch.buyerPersona}`;
      if (marketResearch.commonObjections?.length > 0) {
        context += `\n- Common Objections: ${marketResearch.commonObjections.join('; ')}`;
      }
      if (marketResearch.industryInsights?.length > 0) {
        context += `\n- Industry Insights: ${marketResearch.industryInsights.join('; ')}`;
      }
    }

    // Build conversation messages
    const messages = [
      { role: 'system', content: systemPrompt + context },
    ];

    // Add conversation history (last 6 messages for context)
    const historyToInclude = conversationHistory?.slice(-6) || [];
    for (const msg of historyToInclude) {
      messages.push({ role: msg.role, content: msg.content });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded', response: "I'm getting a lot of interest right now. Give me a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I'd love to learn more about your business. What's the main outcome you deliver for clients?";

    console.log('Generated response for:', userMessage.slice(0, 50));

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in demo-generate-response:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        response: "I'd love to learn more about your business. What's the main outcome you deliver for clients?",
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
