import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Priority 1 Security Fix: Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 20; // 20 requests per minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Priority 1 Security Fix: Rate limiting check
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), 
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages, pageContent, action }: ConsultRequest = await req.json();
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build system prompt based on action and page content
    const systemPrompt = buildSystemPrompt(action, pageContent);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
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

    // Return the stream directly
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Error in ai-consultant function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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