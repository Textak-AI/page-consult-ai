import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

const MAX_MESSAGE_LENGTH = 5000;
const MAX_MESSAGES_COUNT = 100;

const CONVERSATION_SYSTEM_PROMPT = `You are a senior strategist conducting a focused intake interview at PageConsult.

## YOUR ROLE
You're a strategist gathering intel to build a landing page — NOT a research assistant sharing findings.

## RESPONSE FORMAT (MANDATORY)
Every response must be EXACTLY:
1. Brief acknowledgment (1 sentence max, or skip if not needed)
2. One follow-up question that moves the consultation forward

That's it. Nothing else.

## WHAT TO GATHER (one at a time)
- NAME - Their first name
- BUSINESS - What they do, their industry
- GOAL - What the landing page should accomplish
- AUDIENCE - Who specifically they serve
- DIFFERENTIATOR - What makes them different
- EMAIL - Where to send results (ask LAST)

## ACKNOWLEDGMENT HANDLING
When user says "ok", "sure", "got it", "I see", "makes sense", "yes", etc.:
→ Treat as "ready for next question"
→ Do NOT interpret as invitation to share more info
→ Simply ask your next strategic question

## STRICT PROHIBITIONS
- NO insight paragraphs or market research mid-conversation
- NO "I've done some research..." or "Here's what I found..."
- NO multi-paragraph responses
- NO lecturing about what landing pages "must" or "should" do
- NO bullet points or numbered lists
- NO explaining your methodology
- NO unsolicited advice or insights
- NO "Great question!" or "That's a common challenge..." filler
- NEVER dump information the user didn't ask for

## HOW TO USE INTELLIGENCE
Research informs your QUESTIONS, not separate deliverables.
Wrong: "Research shows 67% of buyers want X. Your page should..."
Right: "You're up against some tough competitors — what actually makes you different?"

## GOOD EXAMPLES

User: "We help teams consolidate their tools into one workspace."
✅ "Tool consolidation — got it. Who's the buyer? IT leader, team lead, or someone else?"

User: "Mostly IT directors at mid-size companies."
✅ "IT directors, mid-size. What's the main pain you solve for them?"

User: "ok"
✅ "What's your biggest differentiator against other platforms?"

## BAD EXAMPLES (NEVER DO THIS)

User: "We do marketing automation."
❌ "Marketing automation is a competitive space! Research shows that 73% of marketers cite automation as critical. Your landing page should emphasize time savings and ROI. Here's what I've found about your competitive landscape..."

## WHEN COMPLETE
After gathering enough info (5+ meaningful exchanges), simply say:
"Got what I need. Ready for me to pull together a strategy brief?"

Do NOT mention research, market analysis, or what you'll "dig into."`;


const EXTRACTION_SYSTEM_PROMPT = `You are an intelligence extraction system. Analyze the conversation and extract business intelligence into structured categories.

## CRITICAL: INDUSTRY vs AUDIENCE DISTINCTION

### INDUSTRY = What YOU do / What business YOU'RE in
Trigger phrases indicating INDUSTRY:
- "we do [X]" → X is industry
- "we're a [X] company/agency/firm" → X is industry
- "we provide [X]" → X is industry
- "we specialize in [X]" → X is industry
- "I run a [X]" → X is industry

### AUDIENCE = WHO you serve / WHO you help  
Trigger phrases indicating AUDIENCE:
- "we help [X]" → X is audience
- "we work with [X]" → X is audience
- "we serve [X]" → X is audience
- "for [X] companies/businesses/brands" → X is audience
- "we mostly help [X]" → X is audience

### KEY RULE: The VERB determines the field
- "do/provide/specialize/run" → INDUSTRY
- "help/serve/work with/target/for" → AUDIENCE

Example: "We do digital marketing for e-commerce brands"
- Industry: "digital marketing" (what they DO)
- Audience: "e-commerce brands" (who they serve)

Example: "We mostly help CBD companies reach their audience"  
- Industry: null (no industry signal)
- Audience: "CBD companies" (who they HELP)

For each category, provide:
- fill: number 0-100 (how confident/complete the information is)
- insight: string (the extracted insight, or "Not yet known" if empty)
- state: "empty" | "emerging" | "developing" | "confirmed"

Categories to extract:
1. industry - Industry & Market (what THEY do, their business type)
2. audience - Target Audience (WHO they serve, not what they do)
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

Be generous with fill percentages when real information is shared. Extract INDUSTRY and AUDIENCE SEPARATELY based on the verb patterns above.`;

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
