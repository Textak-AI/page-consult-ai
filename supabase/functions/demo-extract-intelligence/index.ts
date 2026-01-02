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

// Generic/vague terms that should NOT be extracted (low confidence)
const GENERIC_AUDIENCE_TERMS = [
  'businesses', 'business', 'companies', 'company', 'people', 'clients', 
  'customers', 'organizations', 'everyone', 'anyone', 'users', 'folks',
  'teams', 'individuals', 'professionals', 'entrepreneurs'
];

const GENERIC_INDUSTRY_TERMS = [
  'services', 'consulting', 'marketing', 'sales', 'business', 'tech',
  'technology', 'software', 'digital', 'online', 'professional services'
];

const GENERIC_VALUE_TERMS = [
  'grow', 'help', 'improve', 'solutions', 'growth', 'success', 'better',
  'more', 'results', 'value', 'quality', 'service', 'support', 'assist'
];

// Check if a term is too generic
function isGenericTerm(value: string | null, genericList: string[]): boolean {
  if (!value) return true;
  const normalized = value.toLowerCase().trim();
  
  // Check if it's a single generic word
  const words = normalized.split(/\s+/);
  if (words.length === 1 && genericList.includes(normalized)) {
    return true;
  }
  
  // Check if the entire phrase is too short and generic
  if (normalized.length < 8 && genericList.some(term => normalized.includes(term))) {
    return true;
  }
  
  return false;
}

// Calculate confidence score for extraction
function calculateConfidence(value: string | null, field: string, originalMessage: string): number {
  if (!value) return 0;
  
  const normalized = value.toLowerCase().trim();
  const messageLower = originalMessage.toLowerCase();
  
  // Base confidence starts at 50
  let confidence = 50;
  
  // Check if the extracted value appears verbatim in the message
  if (messageLower.includes(normalized) || normalized.split(' ').some(w => w.length > 4 && messageLower.includes(w))) {
    confidence += 20;
  }
  
  // Length bonus - longer, more specific answers get higher confidence
  if (normalized.length > 15) confidence += 10;
  if (normalized.length > 25) confidence += 10;
  
  // Penalize generic terms based on field type
  if (field === 'audience' && isGenericTerm(value, GENERIC_AUDIENCE_TERMS)) {
    confidence -= 40;
  }
  if (field === 'industry' && isGenericTerm(value, GENERIC_INDUSTRY_TERMS)) {
    confidence -= 40;
  }
  if (field === 'valueProp' && isGenericTerm(value, GENERIC_VALUE_TERMS)) {
    confidence -= 40;
  }
  
  // Bonus for specific patterns
  // Audience: contains role, title, or specific descriptor
  if (field === 'audience') {
    if (/\b(founder|ceo|cfo|cto|owner|manager|director|vp|head of)\b/i.test(value)) {
      confidence += 15;
    }
    if (/\b(at|in|for|who)\b/i.test(value)) {
      confidence += 10; // e.g., "CFOs at mid-market companies"
    }
  }
  
  // Industry: contains specific qualifier
  if (field === 'industry') {
    if (/\b(b2b|b2c|saas|ecommerce|healthcare|fintech|real estate|manufacturing)\b/i.test(value)) {
      confidence += 15;
    }
  }
  
  // Value prop: contains measurable outcome
  if (field === 'valueProp') {
    if (/\d+%|\$\d+|reduce|increase|save|eliminate|transform/i.test(value)) {
      confidence += 20;
    }
  }
  
  return Math.max(0, Math.min(100, confidence));
}

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

const systemPrompt = `You are a STRICT extraction system. Only extract SPECIFIC, CONCRETE business information.

CRITICAL: DO NOT EXTRACT VAGUE OR GENERIC TERMS!

REJECTION RULES - Return null for these:

AUDIENCE - REJECT if too vague:
❌ REJECT: "businesses", "companies", "people", "clients", "customers", "organizations", "entrepreneurs"
✅ ACCEPT: "restaurant owners", "CFOs at mid-market companies", "first-time SaaS founders", "e-commerce store owners doing $1M+"

INDUSTRY - REJECT if too vague:
❌ REJECT: "services", "consulting", "marketing", "tech", "business"
✅ ACCEPT: "B2B SaaS", "manufacturing consulting", "healthcare IT", "luxury real estate"

VALUE PROPOSITION - REJECT if too vague:
❌ REJECT: Single words like "grow", "help", "improve", "solutions", "success"
✅ ACCEPT: "reduce employee turnover by 30%", "find hidden production capacity", "close deals 2x faster"

If the input is vague like "we help businesses grow", return ALL NULLS. We need specifics.

FIELD DEFINITIONS (only extract if SPECIFIC):

INDUSTRY: The specific business sector or niche.
AUDIENCE: WHO specifically they help (role + context).
VALUE PROPOSITION: What SPECIFIC outcome they deliver.
COMPETITIVE EDGE: How they're DIFFERENT (look for "unlike", "not like", "problem with").
PAIN POINTS: Specific frustrations their buyers experience.
BUYER OBJECTIONS: What makes buyers hesitate.
PROOF ELEMENTS: Specific results, credentials, numbers.

For each field, also provide a confidence score (0-100):
- Below 50 = too vague, should not display
- 50-75 = somewhat specific, display with caution
- Above 75 = specific enough, display confidently

OUTPUT FORMAT - JSON with MAX 14 CHARACTER short values:
{
  "industry": "max 14 chars or null",
  "industryConfidence": 0-100,
  "industrySummary": "1-2 sentences or null",
  "audience": "max 14 chars or null",
  "audienceConfidence": 0-100,
  "audienceSummary": "1-2 sentences or null",
  "valueProp": "max 14 chars or null",
  "valuePropConfidence": 0-100,
  "valuePropSummary": "1-2 sentences or null",
  "competitiveEdge": "max 14 chars or null",
  "edgeConfidence": 0-100,
  "edgeSummary": "1-2 sentences or null",
  "painPoints": "max 14 chars or null",
  "painConfidence": 0-100,
  "painSummary": "1-2 sentences or null",
  "buyerObjections": "max 14 chars or null",
  "objectionsConfidence": 0-100,
  "objectionsSummary": "1-2 sentences or null",
  "proofElements": "max 14 chars or null",
  "proofConfidence": 0-100,
  "proofSummary": "1-2 sentences or null",
  "inputQuality": "thin" | "adequate" | "rich"
}

INPUT QUALITY ASSESSMENT:
- "thin": Vague, generic, needs clarification (e.g., "we help businesses grow")
- "adequate": Some specifics but could use more detail
- "rich": Clear, specific, actionable information

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

Extract only SPECIFIC information. If the input is vague, return null for those fields and set inputQuality to "thin".` },
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
    interface ExtractedResult {
      industry: string | null;
      industryConfidence: number;
      industrySummary: string | null;
      audience: string | null;
      audienceConfidence: number;
      audienceSummary: string | null;
      valueProp: string | null;
      valuePropConfidence: number;
      valuePropSummary: string | null;
      competitorDifferentiator: string | null;
      edgeConfidence: number;
      edgeSummary: string | null;
      painPoints: string | null;
      painConfidence: number;
      painSummary: string | null;
      buyerObjections: string | null;
      objectionsConfidence: number;
      objectionsSummary: string | null;
      proofElements: string | null;
      proofConfidence: number;
      proofSummary: string | null;
      inputQuality: 'thin' | 'adequate' | 'rich';
    }

    let extracted: ExtractedResult = { 
      industry: null, 
      industryConfidence: 0,
      industrySummary: null,
      audience: null, 
      audienceConfidence: 0,
      audienceSummary: null,
      valueProp: null, 
      valuePropConfidence: 0,
      valuePropSummary: null,
      competitorDifferentiator: null,
      edgeConfidence: 0,
      edgeSummary: null,
      painPoints: null,
      painConfidence: 0,
      painSummary: null,
      buyerObjections: null,
      objectionsConfidence: 0,
      objectionsSummary: null,
      proofElements: null,
      proofConfidence: 0,
      proofSummary: null,
      inputQuality: 'thin',
    };
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate and format extracted fields
        const formatShort = (val: any) => {
          if (typeof val !== 'string' || !val.trim()) return null;
          // Limit to 14 chars for display
          return val.trim().slice(0, 14);
        };
        
        const formatSummary = (val: any) => {
          if (typeof val !== 'string' || !val.trim()) return null;
          // Limit summary to 150 chars
          return val.trim().slice(0, 150);
        };

        const getConfidence = (val: any, fallback: number = 0) => {
          if (typeof val === 'number') return Math.max(0, Math.min(100, val));
          return fallback;
        };
        
        // Extract values
        let industry = formatShort(parsed.industry);
        let audience = formatShort(parsed.audience);
        let valueProp = formatShort(parsed.valueProp);
        let competitiveEdge = formatShort(parsed.competitiveEdge);
        let painPoints = formatShort(parsed.painPoints);
        
        // Calculate confidence scores (combine AI's score with our validation)
        let industryConfidence = getConfidence(parsed.industryConfidence, 60);
        let audienceConfidence = getConfidence(parsed.audienceConfidence, 60);
        let valuePropConfidence = getConfidence(parsed.valuePropConfidence, 60);
        let edgeConfidence = getConfidence(parsed.edgeConfidence, 60);
        let painConfidence = getConfidence(parsed.painConfidence, 60);
        
        // Apply our own confidence adjustments based on generic term detection
        if (industry && isGenericTerm(industry, GENERIC_INDUSTRY_TERMS)) {
          industryConfidence = Math.min(industryConfidence, 30);
          industry = null; // Don't display generic terms
        }
        if (audience && isGenericTerm(audience, GENERIC_AUDIENCE_TERMS)) {
          audienceConfidence = Math.min(audienceConfidence, 30);
          audience = null;
        }
        if (valueProp && isGenericTerm(valueProp, GENERIC_VALUE_TERMS)) {
          valuePropConfidence = Math.min(valuePropConfidence, 30);
          valueProp = null;
        }
        
        // Additional confidence calculation based on original message
        if (industry) {
          industryConfidence = Math.round((industryConfidence + calculateConfidence(industry, 'industry', sanitizedMessage)) / 2);
        }
        if (audience) {
          audienceConfidence = Math.round((audienceConfidence + calculateConfidence(audience, 'audience', sanitizedMessage)) / 2);
        }
        if (valueProp) {
          valuePropConfidence = Math.round((valuePropConfidence + calculateConfidence(valueProp, 'valueProp', sanitizedMessage)) / 2);
        }
        
        // Only keep values with confidence >= 50
        const CONFIDENCE_THRESHOLD = 50;
        
        extracted = {
          industry: industryConfidence >= CONFIDENCE_THRESHOLD ? industry : null,
          industryConfidence,
          industrySummary: industryConfidence >= CONFIDENCE_THRESHOLD ? formatSummary(parsed.industrySummary) : null,
          audience: audienceConfidence >= CONFIDENCE_THRESHOLD ? audience : null,
          audienceConfidence,
          audienceSummary: audienceConfidence >= CONFIDENCE_THRESHOLD ? formatSummary(parsed.audienceSummary) : null,
          valueProp: valuePropConfidence >= CONFIDENCE_THRESHOLD ? valueProp : null,
          valuePropConfidence,
          valuePropSummary: valuePropConfidence >= CONFIDENCE_THRESHOLD ? formatSummary(parsed.valuePropSummary) : null,
          competitorDifferentiator: edgeConfidence >= CONFIDENCE_THRESHOLD ? competitiveEdge : null,
          edgeConfidence,
          edgeSummary: edgeConfidence >= CONFIDENCE_THRESHOLD ? formatSummary(parsed.edgeSummary) : null,
          painPoints: painConfidence >= CONFIDENCE_THRESHOLD ? painPoints : null,
          painConfidence,
          painSummary: painConfidence >= CONFIDENCE_THRESHOLD ? formatSummary(parsed.painSummary) : null,
          buyerObjections: formatShort(parsed.buyerObjections),
          objectionsConfidence: getConfidence(parsed.objectionsConfidence, 60),
          objectionsSummary: formatSummary(parsed.objectionsSummary),
          proofElements: formatShort(parsed.proofElements),
          proofConfidence: getConfidence(parsed.proofConfidence, 60),
          proofSummary: formatSummary(parsed.proofSummary),
          inputQuality: parsed.inputQuality === 'rich' ? 'rich' : parsed.inputQuality === 'adequate' ? 'adequate' : 'thin',
        };
      }
    } catch (parseError) {
      console.error('Failed to parse extraction:', parseError);
    }

    // Enhanced logging for debugging
    const capturedFields = Object.entries(extracted)
      .filter(([k, v]) => v !== null && !k.includes('Summary') && !k.includes('Confidence') && k !== 'inputQuality')
      .map(([k]) => k);
    console.log('📝 User message:', sanitizedMessage);
    console.log('📊 Input quality:', extracted.inputQuality);
    console.log('🧠 Raw AI response:', content);
    console.log('🎯 Parsed extraction with confidence:', JSON.stringify(extracted, null, 2));
    console.log('✅ Fields captured (conf >= 50):', capturedFields);
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
        industryConfidence: 0,
        industrySummary: null,
        audience: null,
        audienceConfidence: 0,
        audienceSummary: null,
        valueProp: null,
        valuePropConfidence: 0,
        valuePropSummary: null,
        competitorDifferentiator: null,
        edgeConfidence: 0,
        edgeSummary: null,
        painPoints: null,
        painConfidence: 0,
        painSummary: null,
        buyerObjections: null,
        objectionsConfidence: 0,
        objectionsSummary: null,
        proofElements: null,
        proofConfidence: 0,
        proofSummary: null,
        inputQuality: 'thin',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
