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

const systemPrompt = `You are an extraction system. Analyze the user message and extract ONLY explicitly stated information.
Use the user's ACTUAL words — do not infer or paraphrase.

Return JSON with SHORT values (max 15 characters, no truncation needed) and summaries (1-2 sentences):

{
  "industry": "SaaS/Strategy",
  "industrySummary": "Strategy and landing page tools for SaaS companies",
  
  "audience": "B2B Founders", 
  "audienceSummary": "Founders, agency owners, and marketing directors",
  
  "valueProp": "Strategy first",
  "valuePropSummary": "Same questions a $15K agency would ask",
  
  "competitiveEdge": "Not templates",
  "edgeSummary": "Unlike Unbounce/Leadpages which assume you know what to say",
  
  "painPoints": "Low conversion",
  "painSummary": "Landing pages look good but don't convert because templates skip strategy",
  
  "buyerObjections": null,
  "objectionsSummary": null,
  
  "proofElements": null,
  "proofSummary": null
}

CRITICAL RULES:
- Short values: MAX 15 characters, must fit on one line
- Shorten phrases: "B2B SaaS founders" → "B2B Founders", "Strategic consultation" → "Strategy first"
- Industry = WHAT they do/sell (SaaS, Coaching, Real estate), NOT their approach (AI-powered is an approach, not an industry)
- Pain Points = the problem (e.g. "Low conversion", "No leads"), NOT a description
- Use their actual words when possible, but condense
- Return null for fields not explicitly mentioned
- Summaries synthesize what they said (1-2 sentences)
- Do NOT infer or guess - only extract explicit statements

Return ONLY valid JSON.`;

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
          { role: 'user', content: `User message: "${sanitizedMessage}"

Extract only what they explicitly stated. Return JSON with null for unmentioned fields.` },
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
    let extracted: {
      industry: string | null;
      industrySummary: string | null;
      audience: string | null;
      audienceSummary: string | null;
      valueProp: string | null;
      valuePropSummary: string | null;
      competitorDifferentiator: string | null;
      edgeSummary: string | null;
      painPoints: string | null;
      painSummary: string | null;
      buyerObjections: string | null;
      objectionsSummary: string | null;
      proofElements: string | null;
      proofSummary: string | null;
    } = { 
      industry: null, 
      industrySummary: null,
      audience: null, 
      audienceSummary: null,
      valueProp: null, 
      valuePropSummary: null,
      competitorDifferentiator: null,
      edgeSummary: null,
      painPoints: null,
      painSummary: null,
      buyerObjections: null,
      objectionsSummary: null,
      proofElements: null,
      proofSummary: null,
    };
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate and format extracted fields
        const formatShort = (val: any) => {
          if (typeof val !== 'string' || !val.trim()) return null;
          // Limit to 15 chars for display - no ellipsis needed
          return val.trim().slice(0, 15);
        };
        
        const formatSummary = (val: any) => {
          if (typeof val !== 'string' || !val.trim()) return null;
          // Limit summary to 150 chars
          return val.trim().slice(0, 150);
        };
        
        extracted = {
          industry: formatShort(parsed.industry),
          industrySummary: formatSummary(parsed.industrySummary),
          audience: formatShort(parsed.audience),
          audienceSummary: formatSummary(parsed.audienceSummary),
          valueProp: formatShort(parsed.valueProp),
          valuePropSummary: formatSummary(parsed.valuePropSummary),
          competitorDifferentiator: formatShort(parsed.competitiveEdge),
          edgeSummary: formatSummary(parsed.edgeSummary),
          painPoints: formatShort(parsed.painPoints),
          painSummary: formatSummary(parsed.painSummary),
          buyerObjections: formatShort(parsed.buyerObjections),
          objectionsSummary: formatSummary(parsed.objectionsSummary),
          proofElements: formatShort(parsed.proofElements),
          proofSummary: formatSummary(parsed.proofSummary),
        };
      }
    } catch (parseError) {
      console.error('Failed to parse extraction:', parseError);
    }

    // Enhanced logging for debugging
    const capturedFields = Object.entries(extracted)
      .filter(([k, v]) => v !== null && !k.includes('Summary'))
      .map(([k]) => k);
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
        industrySummary: null,
        audience: null,
        audienceSummary: null,
        valueProp: null,
        valuePropSummary: null,
        competitorDifferentiator: null,
        edgeSummary: null,
        painPoints: null,
        painSummary: null,
        buyerObjections: null,
        objectionsSummary: null,
        proofElements: null,
        proofSummary: null,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});