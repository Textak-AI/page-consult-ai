import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

// Validation schemas
const MessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(50000),
});

const PageContentSchema = z.object({
  headline: z.string().max(500).optional(),
  subheadline: z.string().max(1000).optional(),
  features: z.array(z.object({
    title: z.string().max(200),
    description: z.string().max(1000),
  })).max(20).optional(),
  cta: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  serviceType: z.string().max(200).optional(),
  targetAudience: z.string().max(500).optional(),
}).optional();

const ConsultRequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(100),
  pageContent: PageContentSchema,
  action: z.enum(['analyze', 'improve_headline', 'improve_features', 'improve_cta', 'add_social_proof', 'general_review']).optional(),
});

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ConsultRequest {
  messages: Message[];
  pageContent?: {
    headline?: string;
    subheadline?: string;
    features?: Array<{ title: string; description: string }>;
    cta?: string;
    industry?: string;
    serviceType?: string;
    targetAudience?: string;
  };
  action?: 'analyze' | 'improve_headline' | 'improve_features' | 'improve_cta' | 'add_social_proof' | 'general_review';
}

serve(async (req) => {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
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

    // Check user's API usage limit
    const { data: userPlan, error: planError } = await supabaseClient
      .from('user_plans')
      .select('plan_name, api_calls_remaining')
      .eq('user_id', user.id)
      .maybeSingle();

    if (planError) {
      console.error('Error fetching user plan:', planError);
    }

    if (userPlan && userPlan.api_calls_remaining <= 0) {
      return new Response(
        JSON.stringify({ error: 'API rate limit exceeded. Please upgrade your plan or wait for the next billing cycle.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('JSON parse error:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate request body against schema
    const validation = ConsultRequestSchema.safeParse(requestBody);
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters', details: 'Request validation failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages, pageContent, action }: ConsultRequest = validation.data;
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build system prompt based on action and page content
    const systemPrompt = buildSystemPrompt(action, pageContent);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 8192,
        system: [
          { type: 'text', text: systemPrompt },
          ...messages.filter((m) => m.role === 'system').map((m) => ({ type: 'text', text: m.content })),
        ],
        messages: messages.filter((m) => m.role !== 'system'),
        stream: true,
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
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decrement API calls for the user
    if (userPlan) {
      await supabaseClient
        .from('user_plans')
        .update({ api_calls_remaining: userPlan.api_calls_remaining - 1 })
        .eq('user_id', user.id);
    }

    // Translate Anthropic text blocks into the existing OpenAI-style SSE contract.
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let buffer = '';
    let finished = false;
    const transport = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const event = JSON.parse(line.slice(6));
          const text = event.type === 'content_block_start' && event.content_block?.type === 'text'
            ? event.content_block.text
            : event.type === 'content_block_delta' && event.delta?.type === 'text_delta'
              ? event.delta.text
              : '';
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`));
          }
          if (event.type === 'error') {
            controller.error(new Error(event.error?.message || 'AI service error'));
            return;
          }
          if (event.type === 'message_stop') {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            finished = true;
          }
        }
      },
      flush(controller) {
        if (!finished) controller.error(new Error('AI stream ended before message_stop'));
      },
    });
    return new Response(response.body?.pipeThrough(transport), {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Error in ai-consultant function:', error);
    const origin = req.headers.get('Origin');
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
    );
  }
});

function buildSystemPrompt(action?: string, pageContent?: any): string {
  const basePrompt = `You are an expert copywriting consultant specializing in landing page optimization and conversion psychology. You help improve landing pages through conversational guidance.

Your approach:
- Be conversational and friendly, not robotic
- Explain WHY suggestions work (psychology, data, examples)
- Give specific, actionable options with clear reasoning
- Reference the user's industry, audience, and service type
- Use emojis sparingly for emphasis (✅ ⚠️ 📊 🔴 🟡 🟢)
- Provide 2-3 concrete options, not vague advice
- Ask clarifying questions when needed

Key principles:
1. Features → Benefits (people buy outcomes, not features)
2. Specificity beats generality (numbers, timelines, guarantees)
3. Emotion > Logic (connect to pain/pleasure first)
4. Local relevance matters (use location when available)
5. Social proof builds trust (specific testimonials > generic)
6. Urgency drives action (scarcity, timing, opportunity cost)`;

  if (!pageContent) {
    return basePrompt + `\n\nThe user hasn't shared their page content yet. Ask what they'd like help with.`;
  }

  const contextPrompt = `\n\nCURRENT PAGE CONTEXT:
${pageContent.industry ? `Industry: ${pageContent.industry}` : ''}
${pageContent.serviceType ? `Service Type: ${pageContent.serviceType}` : ''}
${pageContent.targetAudience ? `Target Audience: ${pageContent.targetAudience}` : ''}
${pageContent.headline ? `Headline: "${pageContent.headline}"` : ''}
${pageContent.subheadline ? `Subheadline: "${pageContent.subheadline}"` : ''}
${pageContent.cta ? `CTA: "${pageContent.cta}"` : ''}
${pageContent.features ? `Features: ${pageContent.features.map((f: any) => `"${f.title}"`).join(', ')}` : ''}`;

  switch (action) {
    case 'analyze':
      return basePrompt + contextPrompt + `\n\nAnalyze this page and provide:
1. What's working well (1-2 items)
2. What could improve (2-3 items with priority)
3. What's missing (1-2 critical elements)

End with: "What would you like me to help improve first?" and suggest quick action buttons: [Headline] [Features] [CTA] [Add Social Proof] [General Review]`;

    case 'improve_headline':
      return basePrompt + contextPrompt + `\n\nThe user wants to improve their headline. Analyze the current headline and:
1. Explain what's weak about it (be specific)
2. Identify what angle would work best for this industry/audience
3. Provide 3 distinct headline options with clear reasoning
4. Format as: "Option A: [headline]" then explain WHY it works

Focus on emotional connection, specificity, and local relevance.`;

    case 'improve_features':
      return basePrompt + contextPrompt + `\n\nThe user wants to improve their features section. For each feature:
1. Show current feature
2. Explain why it's weak (probably lists facts, not benefits)
3. Provide benefit-focused alternative
4. Explain the psychology

Ask if they want to update all at once or review one by one.`;

    case 'improve_cta':
      return basePrompt + contextPrompt + `\n\nThe user wants to improve their CTA. Analyze the current CTA and:
1. Explain what's passive or weak about it
2. Provide 3 stronger CTA options:
   - One with urgency/scarcity
   - One with specific value/benefit
   - One with social proof angle
3. Explain what makes each work psychologically`;

    case 'add_social_proof':
      return basePrompt + contextPrompt + `\n\nThe user wants to add social proof. Suggest:
1. What types of social proof fit their industry (stats, testimonials, case studies)
2. Specific data points that would be credible for their service
3. Where to place them for maximum impact
4. How to frame them compellingly

Be specific to their industry and service type.`;

    case 'general_review':
      return basePrompt + contextPrompt + `\n\nProvide a comprehensive page review:
1. Message clarity (5-second test)
2. Emotional triggers (pain/pleasure connection)
3. Trust signals (credibility elements)
4. Flow logic (section progression)
5. Conversion elements (urgency, social proof, CTAs)

Use priority markers: 🔴 Critical, 🟡 Important, 🟢 Nice to have
Ask which issue they want to tackle first.`;

    default:
      return basePrompt + contextPrompt + `\n\nReady to help improve this page. What aspect should we focus on?`;
  }
}
