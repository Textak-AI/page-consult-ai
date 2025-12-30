import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

const MAX_MESSAGE_LENGTH = 5000;
const MAX_MESSAGES_COUNT = 100;

const CONVERSATION_SYSTEM_PROMPT = `You are an AI Associate at PageConsult — a strategic colleague helping a potential client prepare for their landing page.

## YOUR CORE MISSION
Have a REAL discovery conversation. This is strategy, not a form. You need to truly understand their business before you can create an effective landing page.

## INFORMATION TO GATHER (through natural conversation)
Track what you've learned. Only ask for what's missing:
1. NAME - Their first name
2. BUSINESS - What they do, their industry, what they offer
3. GOAL - What they want this landing page to accomplish
4. AUDIENCE - Who specifically they serve
5. DIFFERENTIATOR - What makes them different from competitors
6. ASPIRATION - What level of market/success they're aiming for
7. EMAIL - Where to send the research brief (ask this LAST)

## CONVERSATION RULES

### Ask ONE question at a time
Never bundle questions. Never use bullet points or numbered lists.

### Go DEEP on what they share
If they say "I'm a consultant" - ask what KIND.
If they mention a challenge - explore it.
Every answer should lead to a natural follow-up.

### Be genuinely curious
React to what they say: "Interesting..." "That's a tough space..." "Got it..."

### Sound human
Use contractions. Keep responses to 2-3 sentences MAX.

### You can reference the intelligence panel
Occasionally acknowledge what you're learning:
- "I'm getting a clear picture of your market now..."
- "That competitive angle is really coming into focus..."
- "Just need to understand your audience a bit better..."

## MINIMUM DEPTH
You MUST have at least 5-8 meaningful exchanges before moving to research.

## WHEN READY
When you have solid info on most categories AND 80%+ readiness would be achieved, say something like:
"I've got a solid understanding of your business. Ready for me to dig into the [their industry] landscape and see what's working? Just say the word."

When the user confirms (says "yes", "go ahead", "do it", etc.), research will start automatically. Do NOT tell them to click a button.

## WHAT NOT TO DO
- Never use bullet points or lists
- Never ask multiple questions at once
- Never sound robotic or form-like
- Never skip exploring an interesting answer`;

const EXTRACTION_SYSTEM_PROMPT = `You are an intelligence extraction system. Analyze the conversation and extract business intelligence into structured categories.

For each category, provide:
- fill: number 0-100 (how confident/complete the information is)
- insight: string (the extracted insight, or "Not yet known" if empty)
- state: "empty" | "emerging" | "developing" | "confirmed"

Categories to extract:
1. industry - Industry & Market (what industry, market segment)
2. audience - Target Audience (who they serve, job titles, demographics)
3. value - Value Proposition (what value they provide, results they deliver)
4. competitive - Competitive Position (how they differ from competitors)
5. goals - Goals & Objectives (what they want from the landing page)
6. swagger - Swagger Level (their confidence level, how bold they are)

State rules:
- empty: fill 0-10, no real info yet
- emerging: fill 11-35, hints but not clear
- developing: fill 36-70, good understanding forming
- confirmed: fill 71-100, solid, specific information

Return ONLY valid JSON in this exact format:
{
  "tiles": {
    "industry": { "fill": 0, "insight": "string", "state": "empty" },
    "audience": { "fill": 0, "insight": "string", "state": "empty" },
    "value": { "fill": 0, "insight": "string", "state": "empty" },
    "competitive": { "fill": 0, "insight": "string", "state": "empty" },
    "goals": { "fill": 0, "insight": "string", "state": "empty" },
    "swagger": { "fill": 0, "insight": "string", "state": "empty" }
  },
  "overallReadiness": 0,
  "hasEmail": false,
  "extractedName": ""
}

Be generous with fill percentages when real information is shared. If someone says "I help manufacturing companies reduce waste", that's at least 60% for industry and 40% for value.`;

serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  console.log('🚀 intake-chat function called');

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages, extractOnly } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (messages.length > MAX_MESSAGES_COUNT) {
      return new Response(
        JSON.stringify({ error: `Maximum ${MAX_MESSAGES_COUNT} messages allowed` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate messages
    for (const msg of messages) {
      if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
        return new Response(
          JSON.stringify({ error: 'Invalid message role' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (typeof msg.content !== 'string' || msg.content.length > MAX_MESSAGE_LENGTH) {
        return new Response(
          JSON.stringify({ error: 'Invalid message content' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build conversation text for extraction
    const conversationText = messages
      .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    // Run both conversation response and extraction in parallel
    const [conversationResponse, extractionResponse] = await Promise.all([
      // Only get conversation response if not extractOnly
      extractOnly ? Promise.resolve(null) : fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: CONVERSATION_SYSTEM_PROMPT },
            ...messages,
          ],
          max_tokens: 500,
          temperature: 0.8,
        }),
      }),
      
      // Always run extraction
      fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
            { role: 'user', content: `Analyze this conversation and extract intelligence:\n\n${conversationText}` },
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      }),
    ]);

    // Parse extraction response
    let intelligence = {
      tiles: {
        industry: { fill: 0, insight: "Not yet known", state: "empty" },
        audience: { fill: 0, insight: "Not yet known", state: "empty" },
        value: { fill: 0, insight: "Not yet known", state: "empty" },
        competitive: { fill: 0, insight: "Not yet known", state: "empty" },
        goals: { fill: 0, insight: "Not yet known", state: "empty" },
        swagger: { fill: 0, insight: "Not yet known", state: "empty" },
      },
      overallReadiness: 0,
      hasEmail: false,
      extractedName: ""
    };

    if (extractionResponse.ok) {
      const extractionData = await extractionResponse.json();
      const extractionText = extractionData.choices?.[0]?.message?.content || '';
      
      // Parse JSON from response
      try {
        // Find JSON in the response
        const jsonMatch = extractionText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          intelligence = { ...intelligence, ...parsed };
        }
      } catch (e) {
        console.error('Failed to parse extraction:', e);
      }
    }

    // Get conversation message if not extractOnly
    let message = '';
    if (!extractOnly && conversationResponse) {
      if (!conversationResponse.ok) {
        const errorText = await conversationResponse.text();
        console.error('Conversation error:', conversationResponse.status, errorText);
        
        if (conversationResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw new Error('AI Gateway error');
      }
      
      const conversationData = await conversationResponse.json();
      message = conversationData.choices?.[0]?.message?.content || 'Could you repeat that?';
    }

    console.log('✅ Response generated, readiness:', intelligence.overallReadiness);

    return new Response(
      JSON.stringify({ 
        message,
        intelligence,
        conversationDepth: messages.filter((m: any) => m.role === 'user').length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in intake-chat:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
