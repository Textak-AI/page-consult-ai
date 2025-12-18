import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation limits
const MAX_MESSAGE_LENGTH = 5000;
const MAX_MESSAGES_COUNT = 50;

const SYSTEM_PROMPT = `You are an AI Associate at PageConsult. You're having a natural, friendly conversation to learn about a potential client before preparing their market research brief.

Your goal is to naturally gather through conversation:
1. Their name (first name is fine)
2. Their business/industry and what they offer
3. What they're trying to accomplish (more leads, sales, bookings, etc.)
4. Their email (to send the research brief)

Guidelines:
- Be warm, curious, and conversational - like a smart colleague, not a form
- NEVER use bullet points, numbered lists, or structured formats
- Ask ONE thing at a time, naturally woven into conversation
- Acknowledge what they share before asking more
- If they mention challenges or pain points, explore those
- Keep responses to 2-3 sentences max
- Sound human - use casual language, contractions

When you have all 4 pieces of information (name, business, goal, email), end with:
"Perfect, [name]! I've got everything I need. I'm going to dig into your market now and prepare a detailed research brief. Give me a moment to analyze your industry..."

Important: Do NOT ask for information you already have. Track what's been shared and only ask for what's missing.`;


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
    
    // Validate messages array exists and is array
    if (!messages || !Array.isArray(messages)) {
      console.error('❌ Messages array is required');
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate messages count
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
        console.error('❌ Invalid message role:', msg.role);
        return new Response(
          JSON.stringify({ error: 'Invalid message role' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (typeof msg.content !== 'string' || msg.content.length > MAX_MESSAGE_LENGTH) {
        console.error('❌ Invalid message content length:', msg.content?.length);
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
        temperature: 0.7,
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
    const message = data.choices?.[0]?.message?.content || 'I apologize, but I encountered an issue. Could you please repeat that?';

    console.log('✅ Response generated successfully');

    return new Response(
      JSON.stringify({ message }),
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