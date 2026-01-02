import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Input validation constants
const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONVERSATION_HISTORY = 20;
const RATE_LIMIT_PER_HOUR = 30;

// Sanitize AI input to prevent prompt injection
function sanitizeAIInput(content: string): string {
  if (typeof content !== 'string') return '';
  
  // Remove control characters
  let sanitized = content.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  
  // Limit length
  sanitized = sanitized.slice(0, MAX_MESSAGE_LENGTH);
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

// Hash IP for rate limiting
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + 'demo-extract-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

const systemPrompt = `You are an intelligence extraction system. Your job is to extract ONLY what the user explicitly stated. Use their ACTUAL WORDS or very close paraphrases.

CRITICAL RULES:
- Extract ONLY what the user explicitly stated - do NOT infer, guess, or add information
- Use the user's actual words whenever possible
- Keep values concise (under 30 characters for clean display)
- If a field isn't clearly mentioned, return null for that field
- Extract MULTIPLE fields from a single message when present
- Do NOT add "AI-powered" or other embellishments unless the user said it

FIELD DEFINITIONS:

1. industry: What business/industry are they in?
   - "I build landing pages" → "Landing pages"
   - "We're a SaaS company" → "SaaS"
   - "I run a consulting firm" → "Consulting"

2. target_audience: Who do they serve/sell to?
   - "We help B2B SaaS founders" → "B2B SaaS founders"
   - "I work with restaurants" → "Restaurants"

3. unique_value: What value do they provide? Use their words.
   - "strategic consultation first" → "Strategic consultation first"
   - "we ask the same questions a $15K agency would" → "$15K agency questions"

4. competitor_differentiator: How are they different from competitors? Use their words.
   - "Unlike Unbounce, we don't give templates" → "Not templates like Unbounce"
   - "Leadpages gives you placeholders" → "No placeholder text"

5. audience_pain_points: What problems do their customers face?
   - "They don't know what to write" → "Don't know what to write"
   - "Templates assume you have messaging" → "Templates assume messaging exists"

6. buyer_objections: What objections or hesitations do buyers have?
   - "People think it's too expensive" → "Price concerns"
   - Only extract if explicitly mentioned

7. proof_elements: What proof, results, or credentials did they mention?
   - "We've worked with 50 companies" → "50 companies served"
   - Only extract if explicitly mentioned

Return ONLY valid JSON:
{
  "industry": "string or null",
  "target_audience": "string or null", 
  "unique_value": "string or null",
  "competitor_differentiator": "string or null",
  "audience_pain_points": "string or null",
  "buyer_objections": "string or null",
  "proof_elements": "string or null"
}`;

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    // Rate limiting by IP
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    const ipHash = await hashIP(ip);

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('demo_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo);

    if (count && count >= RATE_LIMIT_PER_HOUR) {
      console.warn('Rate limit exceeded for IP hash:', ipHash);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', rateLimited: true }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { message, conversationHistory, existingIntelligence } = body;

    // Input validation
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ error: 'Message too long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Sanitize message
    const sanitizedMessage = sanitizeAIInput(message);

    // Build context from conversation history (sanitized)
    const validHistory = Array.isArray(conversationHistory) ? conversationHistory : [];
    const contextMessages = validHistory
      .slice(-Math.min(5, MAX_CONVERSATION_HISTORY))
      .filter((m: any) => m && typeof m.role === 'string' && typeof m.content === 'string')
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: sanitizeAIInput(m.content),
      }));

    // Build existing intelligence context
    let existingContext = '';
    if (existingIntelligence && typeof existingIntelligence === 'object') {
      const fields = [];
      if (existingIntelligence.industry) fields.push(`Industry: ${existingIntelligence.industry}`);
      if (existingIntelligence.audience) fields.push(`Audience: ${existingIntelligence.audience}`);
      if (existingIntelligence.valueProp) fields.push(`Value Prop: ${existingIntelligence.valueProp}`);
      if (existingIntelligence.competitorDifferentiator) fields.push(`Competitive Edge: ${existingIntelligence.competitorDifferentiator}`);
      if (existingIntelligence.painPoints) fields.push(`Pain Points: ${existingIntelligence.painPoints}`);
      if (existingIntelligence.buyerObjections) fields.push(`Objections: ${existingIntelligence.buyerObjections}`);
      if (existingIntelligence.proofElements) fields.push(`Proof: ${existingIntelligence.proofElements}`);
      
      if (fields.length > 0) {
        existingContext = `\n\nALREADY EXTRACTED (do not re-extract, focus on NEW information):\n${fields.map(f => `- ${f}`).join('\n')}`;
      }
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
          { role: 'system', content: systemPrompt + existingContext },
          ...contextMessages,
          { role: 'user', content: `Extract business intelligence from this user message. Use their ACTUAL WORDS - do not infer or add information they didn't say.

User message: "${sanitizedMessage}"

Extract any of these fields that are explicitly mentioned:
- industry: What business/industry?
- target_audience: Who do they serve?
- unique_value: What's their core value/approach?
- competitor_differentiator: How are they different?
- audience_pain_points: What problems do their customers face?
- buyer_objections: Any objections mentioned?
- proof_elements: Any proof/results/credentials?

Return JSON with extracted values (use null for fields not mentioned). Keep values under 30 characters.` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI rate limit exceeded', rateLimited: true }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response with validation
    let extracted = { 
      industry: null, 
      audience: null, 
      valueProp: null, 
      competitorDifferentiator: null,
      painPoints: null,
      buyerObjections: null,
      proofElements: null
    };
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Validate and sanitize extracted fields - map from snake_case to camelCase
        extracted = {
          industry: typeof parsed.industry === 'string' && parsed.industry.trim() ? parsed.industry.slice(0, 100) : null,
          audience: typeof parsed.target_audience === 'string' && parsed.target_audience.trim() ? parsed.target_audience.slice(0, 200) : null,
          valueProp: typeof parsed.unique_value === 'string' && parsed.unique_value.trim() ? parsed.unique_value.slice(0, 200) : null,
          competitorDifferentiator: typeof parsed.competitor_differentiator === 'string' && parsed.competitor_differentiator.trim() ? parsed.competitor_differentiator.slice(0, 200) : null,
          painPoints: typeof parsed.audience_pain_points === 'string' && parsed.audience_pain_points.trim() ? parsed.audience_pain_points.slice(0, 200) : null,
          buyerObjections: typeof parsed.buyer_objections === 'string' && parsed.buyer_objections.trim() ? parsed.buyer_objections.slice(0, 200) : null,
          proofElements: typeof parsed.proof_elements === 'string' && parsed.proof_elements.trim() ? parsed.proof_elements.slice(0, 200) : null,
        };
      }
    } catch (parseError) {
      console.error('Failed to parse extraction:', parseError);
    }

    // Enhanced logging for debugging
    const capturedFields = Object.entries(extracted).filter(([_, v]) => v !== null).map(([k]) => k);
    console.log('📝 User message:', sanitizedMessage);
    console.log('🧠 Raw AI response:', content);
    console.log('🎯 Parsed extraction:', JSON.stringify(extracted, null, 2));
    console.log('✅ Fields captured:', capturedFields);
    console.log(`📊 Total: ${capturedFields.length} fields extracted for IP hash:`, ipHash);

    return new Response(
      JSON.stringify(extracted),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in demo-extract-intelligence:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Processing error',
        industry: null,
        audience: null,
        valueProp: null,
        competitorDifferentiator: null,
        painPoints: null,
        buyerObjections: null,
        proofElements: null,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
