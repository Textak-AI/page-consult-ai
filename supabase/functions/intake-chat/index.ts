import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation limits
const MAX_MESSAGE_LENGTH = 5000;
const MAX_MESSAGES_COUNT = 100;

const SYSTEM_PROMPT = `You are an AI Associate at PageConsult — a strategic colleague helping a potential client prepare for their landing page.

## YOUR CORE MISSION
Have a REAL discovery conversation. This is strategy, not a form. You need to truly understand their business before you can create an effective landing page.

## INFORMATION TO GATHER (through natural conversation)
Track what you've learned. Only ask for what's missing:
1. NAME - Their first name (just naturally in conversation)
2. BUSINESS - What they do, their industry, what they offer
3. GOAL - What they want this landing page to accomplish (leads, sales, bookings, etc.)
4. AUDIENCE - Who specifically they serve (job titles, demographics, situations)
5. DIFFERENTIATOR - What makes them different from competitors
6. ASPIRATION - What level of market/success they're aiming for
7. EMAIL - Where to send the research brief (ask this LAST, only after you have items 1-6)

## CONVERSATION RULES

### Ask ONE question at a time
Never bundle questions. Never use bullet points or numbered lists.

### Go DEEP on what they share
If they say "I'm a consultant" - ask what KIND of consultant.
If they mention a challenge - explore it.
If they mention success - ask what made it work.
Every answer should lead to a natural follow-up.

### Be genuinely curious
React to what they say. Show you're listening.
"Interesting..." "That's a tough space..." "Got it..." "Makes sense..."

### Sound human
Use contractions. Keep responses to 2-3 sentences MAX.
Sound like a smart colleague at a coffee shop, not an AI form.

### Minimum conversation depth
You MUST have at least 5-8 exchanges with meaningful discovery before moving to research.
Don't rush. Quality > speed.

## EXAMPLE OF GOOD FLOW
User: "I need a landing page for my business"
You: "Nice! What's your business all about?"
User: "Management consulting for manufacturers"
You: "Consulting for manufacturing — interesting space. Lots going on there with automation and supply chain shifts. What kind of consulting specifically? Operations, strategy, digital transformation?"
User: "Mostly operations and process optimization"
You: "Got it. And when a manufacturer brings you in, what's usually broken? What problem are they trying to solve?"
[Continue exploring...]

## PHASE TRANSITIONS

### When you have ALL info (1-7) AND at least 5-8 exchanges:
End with exactly this (replace [name] with their actual name):

"Perfect, [name]! I've got a solid picture of your business. I'm going to research your market now — competitors, what's working in your space, audience psychology. This takes about 30 seconds. Hang tight..."

IMPORTANT: Include the exact phrase "[PHASE:RESEARCH_START]" at the END of this message (this triggers the research phase).

### If they try to rush:
Gently redirect: "Before we dive into building, I want to make sure I really understand your business. Tell me more about..."

## WHAT NOT TO DO
- Never use bullet points or lists
- Never ask multiple questions at once
- Never jump to building without thorough discovery
- Never sound robotic or form-like
- Never skip exploring an interesting answer
- Never ask for info you already have

Remember: A great landing page starts with great discovery. Take your time.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🚀 intake-chat function called');

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client and verify user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError?.message || 'No user found');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User authenticated:', user.id);

    const { messages } = await req.json();
    
    // Validate messages array
    if (!messages || !Array.isArray(messages)) {
      console.error('❌ Messages array is required');
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (messages.length > MAX_MESSAGES_COUNT) {
      console.error('❌ Too many messages:', messages.length);
      return new Response(
        JSON.stringify({ error: `Maximum ${MAX_MESSAGES_COUNT} messages allowed` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate each message
    for (const msg of messages) {
      if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
        return new Response(
          JSON.stringify({ error: 'Invalid message role' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (typeof msg.content !== 'string' || msg.content.length > MAX_MESSAGE_LENGTH) {
        return new Response(
          JSON.stringify({ error: `Message content must be a string with max ${MAX_MESSAGE_LENGTH} characters` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('✅ Input validated, processing', messages.length, 'messages');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('❌ LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Count user messages to track conversation depth
    const userMessageCount = messages.filter((m: any) => m.role === 'user').length;
    console.log('📊 Conversation depth:', userMessageCount, 'user messages');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    let message = data.choices?.[0]?.message?.content || 'I apologize, but I encountered an issue. Could you please repeat that?';

    // Check if research phase should start
    const shouldStartResearch = message.includes('[PHASE:RESEARCH_START]');
    
    // Clean the phase marker from the visible message
    message = message.replace('[PHASE:RESEARCH_START]', '').trim();

    console.log('✅ Response generated, research phase:', shouldStartResearch);

    return new Response(
      JSON.stringify({ 
        message,
        phase: shouldStartResearch ? 'research_start' : 'intake',
        conversationDepth: userMessageCount
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
