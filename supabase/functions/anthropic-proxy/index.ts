import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Anthropic from 'npm:@anthropic-ai/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🚀 anthropic-proxy function called');

  try {
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

    // Parse request
    const body = await req.json();
    const { systemPrompt, userPrompt } = body;
    
    console.log('📥 Request received:', {
      hasSystemPrompt: !!systemPrompt,
      hasUserPrompt: !!userPrompt,
      systemPromptLength: systemPrompt?.length || 0,
      userPromptLength: userPrompt?.length || 0,
    });

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
