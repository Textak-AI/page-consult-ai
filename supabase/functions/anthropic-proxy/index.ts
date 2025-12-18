import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'npm:@anthropic-ai/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation limits
const MAX_SYSTEM_PROMPT_LENGTH = 50000;
const MAX_USER_PROMPT_LENGTH = 50000;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🚀 anthropic-proxy function called');

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Missing authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - missing authorization header' }),
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
        JSON.stringify({ success: false, error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Get API key from Supabase secret
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    console.log('🔑 ANTHROPIC_API_KEY status:', apiKey ? 'FOUND' : 'MISSING');
    
    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY not configured in Supabase secrets');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'ANTHROPIC_API_KEY not configured. Please add it in Supabase secrets.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request
    const body = await req.json();
    const { systemPrompt, userPrompt } = body;
    
    console.log('📥 Request received:', {
      hasSystemPrompt: !!systemPrompt,
      hasUserPrompt: !!userPrompt,
      systemPromptLength: systemPrompt?.length || 0,
      userPromptLength: userPrompt?.length || 0,
    });

    // Validate required fields
    if (!systemPrompt || !userPrompt) {
      console.error('❌ Missing prompts:', { systemPrompt: !!systemPrompt, userPrompt: !!userPrompt });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Missing systemPrompt or userPrompt in request body' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input lengths
    if (typeof systemPrompt !== 'string' || systemPrompt.length > MAX_SYSTEM_PROMPT_LENGTH) {
      console.error('❌ Invalid systemPrompt length:', systemPrompt?.length);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `systemPrompt must be a string with max ${MAX_SYSTEM_PROMPT_LENGTH} characters` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof userPrompt !== 'string' || userPrompt.length > MAX_USER_PROMPT_LENGTH) {
      console.error('❌ Invalid userPrompt length:', userPrompt?.length);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `userPrompt must be a string with max ${MAX_USER_PROMPT_LENGTH} characters` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('📤 Calling Claude API (model: claude-sonnet-4-5)...');
    console.time('⏱️ Claude API duration');

    // Call Claude (simple proxy)
    const anthropic = new Anthropic({ apiKey });
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    console.timeEnd('⏱️ Claude API duration');
    console.log('✅ Claude API response received:', {
      role: response.role,
      contentBlocks: response.content.length,
      stopReason: response.stop_reason,
      usage: response.usage,
    });

    // Extract text content
    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';
    
    console.log('📝 Response content length:', text.length);

    // Return response
    return new Response(
      JSON.stringify({ 
        success: true, 
        content: text 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Edge function error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        errorType: error instanceof Error ? error.name : 'Unknown',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
