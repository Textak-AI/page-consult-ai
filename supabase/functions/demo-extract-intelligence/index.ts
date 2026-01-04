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

const systemPrompt = `You are a STRICT extraction system. Extract SPECIFIC business intelligence while CAREFULLY separating INDUSTRY from AUDIENCE.

## CRITICAL DISTINCTION: INDUSTRY vs AUDIENCE

### INDUSTRY = What YOU do / What business YOU'RE in
Trigger phrases that indicate INDUSTRY:
- "we do [X]" → X is industry
- "we're a [X] company/agency/firm" → X is industry
- "we provide [X]" → X is industry
- "we specialize in [X]" → X is industry
- "we're in the [X] space/industry" → X is industry
- "I run a [X]" → X is industry
- "our business is [X]" → X is industry

Examples: "digital marketing", "SaaS", "law firm", "manufacturing consulting", "SEO services"

### AUDIENCE = WHO you serve / WHO you help
Trigger phrases that indicate AUDIENCE:
- "we help [X]" → X is audience
- "we work with [X]" → X is audience  
- "we serve [X]" → X is audience
- "our clients are [X]" → X is audience
- "we target [X]" → X is audience
- "targeting [X]" → X is audience
- "for [X] companies/businesses/brands" → X is audience
- "[X] is our target market" → X is audience
- "we mostly help [X]" → X is audience

Examples: "e-commerce brands", "CBD companies", "tech startups", "manufacturers", "small businesses"

### EXTRACTION PRIORITY RULES
1. The VERB before the noun phrase determines the field:
   - "do/provide/specialize/run" → INDUSTRY
   - "help/serve/work with/target/for" → AUDIENCE

2. If "for [X]" appears AFTER an industry statement, [X] is AUDIENCE:
   - "We do digital marketing for e-commerce brands" → Industry: "digital marketing", Audience: "e-commerce brands"

3. If a single message contains BOTH signals, extract BOTH separately.

4. "CBD companies" in "help CBD companies" = AUDIENCE, not Industry.

### REJECTION RULES - Return null for generic terms:

AUDIENCE REJECT: "businesses", "companies", "people", "clients", "customers", "organizations", "entrepreneurs"
AUDIENCE ACCEPT: "e-commerce brands", "CBD companies", "tech startups", "restaurant owners", "manufacturers"

INDUSTRY REJECT: "services", "consulting", "marketing", "tech", "business" (alone)
INDUSTRY ACCEPT: "B2B SaaS", "digital marketing", "manufacturing consulting", "SEO agency"

VALUE PROP REJECT: Single words like "grow", "help", "improve", "solutions"
VALUE PROP ACCEPT: "reduce downtime by 30%", "find hidden capacity", "close deals faster"

## OTHER FIELDS TO EXTRACT
- VALUE PROPOSITION: What SPECIFIC outcome they deliver
- COMPETITIVE EDGE: How they're DIFFERENT (look for "unlike", "not like", "problem with")
- PAIN POINTS: Specific frustrations their buyers experience
- BUYER OBJECTIONS: What makes buyers hesitate
- PROOF ELEMENTS: Specific results, credentials, numbers

## CONFIDENCE SCORING (0-100)
- Below 50 = too vague, should not display
- 50-75 = somewhat specific, display with caution
- Above 75 = specific enough, display confidently
- BONUS: Add +10 confidence for specific numbers ($X, X%, Xx results)
- BONUS: Add +10 confidence for detailed phrases (>30 chars)

## OUTPUT FORMAT - JSON with COMPLETE phrases (up to 60 chars):
IMPORTANT: Capture the FULL meaningful phrase, not just keywords. 
For example: "leadership pipeline insurance" NOT "pipeline insur"
For example: "succession gaps costing millions" NOT "succession gap"
For example: "doubt coaching delivers measurable ROI" NOT "doubt ROI"

{
  "industry": "full phrase up to 60 chars or null",
  "industryConfidence": 0-100,
  "industrySummary": "2-3 sentences with full context",
  "audience": "full phrase up to 60 chars or null",
  "audienceConfidence": 0-100,
  "audienceSummary": "2-3 sentences with full context",
  "valueProp": "full phrase up to 60 chars or null",
  "valuePropConfidence": 0-100,
  "valuePropSummary": "2-3 sentences with specific outcomes/numbers",
  "competitiveEdge": "full phrase up to 60 chars or null",
  "edgeConfidence": 0-100,
  "edgeSummary": "2-3 sentences explaining differentiation",
  "painPoints": "full phrase up to 60 chars or null",
  "painConfidence": 0-100,
  "painSummary": "2-3 sentences with specific costs/impacts",
  "buyerObjections": "full phrase up to 60 chars or null",
  "objectionsConfidence": 0-100,
  "objectionsSummary": "2-3 sentences detailing hesitations",
  "proofElements": "full phrase up to 60 chars or null",
  "proofConfidence": 0-100,
  "proofSummary": "2-3 sentences with specific metrics/results",
  "inputQuality": "thin" | "adequate" | "rich"
}

## TEST YOUR EXTRACTION:
| Input | Industry | Audience |
| "We do digital marketing for e-commerce brands" | "digital mktg" | "e-commerce" |
| "We mostly help CBD companies reach their audience" | null | "CBD companies" |
| "I run a SaaS company that serves small businesses" | "SaaS" | "small business" |
| "We're a law firm working with tech startups" | "law firm" | "tech startups" |

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

    // Build existing intelligence context - only list what's already captured, but ENCOURAGE extraction of missing fields
    let existingContext = '';
    if (existingIntelligence && typeof existingIntelligence === 'object') {
      const capturedFields = [];
      const missingFields = [];
      
      if (existingIntelligence.industry) capturedFields.push(`Industry: ${existingIntelligence.industry}`);
      else missingFields.push('industry');
      
      if (existingIntelligence.audience) capturedFields.push(`Audience: ${existingIntelligence.audience}`);
      else missingFields.push('audience');
      
      if (existingIntelligence.valueProp) capturedFields.push(`Value Prop: ${existingIntelligence.valueProp}`);
      else missingFields.push('valueProp');
      
      if (existingIntelligence.competitorDifferentiator) capturedFields.push(`Competitive Edge: ${existingIntelligence.competitorDifferentiator}`);
      else missingFields.push('competitiveEdge');
      
      if (existingIntelligence.painPoints) capturedFields.push(`Pain Points: ${existingIntelligence.painPoints}`);
      else missingFields.push('painPoints');
      
      if (existingIntelligence.buyerObjections) capturedFields.push(`Objections: ${existingIntelligence.buyerObjections}`);
      else missingFields.push('buyerObjections');
      
      if (existingIntelligence.proofElements) capturedFields.push(`Proof: ${existingIntelligence.proofElements}`);
      else missingFields.push('proofElements');
      
      // Build context that encourages finding MISSING fields
      existingContext = '\n\n';
      if (capturedFields.length > 0) {
        existingContext += `ALREADY CAPTURED (skip unless new message has MORE SPECIFIC info):\n${capturedFields.map(f => `- ${f}`).join('\n')}\n\n`;
      }
      if (missingFields.length > 0) {
        existingContext += `STILL NEEDED (prioritize extracting these from the new message):\n${missingFields.map(f => `- ${f}`).join('\n')}\n`;
        existingContext += `\nIMPORTANT: The user may provide info about MULTIPLE fields in one message. Extract ALL relevant fields, especially those marked as "STILL NEEDED" above.`;
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
      // Short display values (max 14 chars for sidebar)
      industry: string | null;
      industryConfidence: number;
      industryFull: string | null; // Full value for Hero/CTA (max 50 chars)
      industrySummary: string | null;
      audience: string | null;
      audienceConfidence: number;
      audienceFull: string | null;
      audienceSummary: string | null;
      valueProp: string | null;
      valuePropConfidence: number;
      valuePropFull: string | null;
      valuePropSummary: string | null;
      competitorDifferentiator: string | null;
      edgeConfidence: number;
      competitorDifferentiatorFull: string | null;
      edgeSummary: string | null;
      painPoints: string | null;
      painConfidence: number;
      painPointsFull: string | null;
      painSummary: string | null;
      buyerObjections: string | null;
      objectionsConfidence: number;
      buyerObjectionsFull: string | null;
      objectionsSummary: string | null;
      proofElements: string | null;
      proofConfidence: number;
      proofElementsFull: string | null;
      proofSummary: string | null;
      inputQuality: 'thin' | 'adequate' | 'rich';
    }

    let extracted: ExtractedResult = { 
      industry: null, 
      industryConfidence: 0,
      industryFull: null,
      industrySummary: null,
      audience: null, 
      audienceConfidence: 0,
      audienceFull: null,
      audienceSummary: null,
      valueProp: null, 
      valuePropConfidence: 0,
      valuePropFull: null,
      valuePropSummary: null,
      competitorDifferentiator: null,
      edgeConfidence: 0,
      competitorDifferentiatorFull: null,
      edgeSummary: null,
      painPoints: null,
      painConfidence: 0,
      painPointsFull: null,
      painSummary: null,
      buyerObjections: null,
      objectionsConfidence: 0,
      buyerObjectionsFull: null,
      objectionsSummary: null,
      proofElements: null,
      proofConfidence: 0,
      proofElementsFull: null,
      proofSummary: null,
      inputQuality: 'thin',
    };
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate and format extracted fields
        // Short value for sidebar display (up to 40 chars - enough for meaningful phrases)
        const formatShort = (val: any) => {
          if (typeof val !== 'string' || !val.trim()) return null;
          return val.trim().slice(0, 40);
        };
        
        // Full value for Hero/CTA generation (up to 150 chars for complete context)
        const formatFull = (val: any) => {
          if (typeof val !== 'string' || !val.trim()) return null;
          return val.trim().slice(0, 150);
        };
        
        const formatSummary = (val: any) => {
          if (typeof val !== 'string' || !val.trim()) return null;
          // Limit summary to 300 chars for rich context
          return val.trim().slice(0, 300);
        };

        const getConfidence = (val: any, fallback: number = 0) => {
          if (typeof val === 'number') return Math.max(0, Math.min(100, val));
          return fallback;
        };
        
        // Extract values - short for display, full for content generation
        let industry = formatShort(parsed.industry);
        let industryFull = formatFull(parsed.industry);
        let audience = formatShort(parsed.audience);
        let audienceFull = formatFull(parsed.audience);
        let valueProp = formatShort(parsed.valueProp);
        let valuePropFull = formatFull(parsed.valueProp);
        let competitiveEdge = formatShort(parsed.competitiveEdge);
        let competitiveEdgeFull = formatFull(parsed.competitiveEdge);
        let painPoints = formatShort(parsed.painPoints);
        let painPointsFull = formatFull(parsed.painPoints);
        
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
          industryFull = null;
        }
        if (audience && isGenericTerm(audience, GENERIC_AUDIENCE_TERMS)) {
          audienceConfidence = Math.min(audienceConfidence, 30);
          audience = null;
          audienceFull = null;
        }
        if (valueProp && isGenericTerm(valueProp, GENERIC_VALUE_TERMS)) {
          valuePropConfidence = Math.min(valuePropConfidence, 30);
          valueProp = null;
          valuePropFull = null;
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
          // Short values for sidebar display (max 14 chars)
          industry: industryConfidence >= CONFIDENCE_THRESHOLD ? industry : null,
          industryConfidence,
          // Full values for Hero/CTA generation (max 50 chars)
          industryFull: industryConfidence >= CONFIDENCE_THRESHOLD ? industryFull : null,
          industrySummary: industryConfidence >= CONFIDENCE_THRESHOLD ? formatSummary(parsed.industrySummary) : null,
          
          audience: audienceConfidence >= CONFIDENCE_THRESHOLD ? audience : null,
          audienceConfidence,
          audienceFull: audienceConfidence >= CONFIDENCE_THRESHOLD ? audienceFull : null,
          audienceSummary: audienceConfidence >= CONFIDENCE_THRESHOLD ? formatSummary(parsed.audienceSummary) : null,
          
          valueProp: valuePropConfidence >= CONFIDENCE_THRESHOLD ? valueProp : null,
          valuePropConfidence,
          valuePropFull: valuePropConfidence >= CONFIDENCE_THRESHOLD ? valuePropFull : null,
          valuePropSummary: valuePropConfidence >= CONFIDENCE_THRESHOLD ? formatSummary(parsed.valuePropSummary) : null,
          
          competitorDifferentiator: edgeConfidence >= CONFIDENCE_THRESHOLD ? competitiveEdge : null,
          edgeConfidence,
          competitorDifferentiatorFull: edgeConfidence >= CONFIDENCE_THRESHOLD ? competitiveEdgeFull : null,
          edgeSummary: edgeConfidence >= CONFIDENCE_THRESHOLD ? formatSummary(parsed.edgeSummary) : null,
          
          painPoints: painConfidence >= CONFIDENCE_THRESHOLD ? painPoints : null,
          painConfidence,
          painPointsFull: painConfidence >= CONFIDENCE_THRESHOLD ? painPointsFull : null,
          painSummary: painConfidence >= CONFIDENCE_THRESHOLD ? formatSummary(parsed.painSummary) : null,
          
          buyerObjections: formatShort(parsed.buyerObjections),
          objectionsConfidence: getConfidence(parsed.objectionsConfidence, 60),
          buyerObjectionsFull: formatFull(parsed.buyerObjections),
          objectionsSummary: formatSummary(parsed.objectionsSummary),
          
          proofElements: formatShort(parsed.proofElements),
          proofConfidence: getConfidence(parsed.proofConfidence, 60),
          proofElementsFull: formatFull(parsed.proofElements),
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
        industryFull: null,
        industrySummary: null,
        audience: null,
        audienceConfidence: 0,
        audienceFull: null,
        audienceSummary: null,
        valueProp: null,
        valuePropConfidence: 0,
        valuePropFull: null,
        valuePropSummary: null,
        competitorDifferentiator: null,
        edgeConfidence: 0,
        competitorDifferentiatorFull: null,
        edgeSummary: null,
        painPoints: null,
        painConfidence: 0,
        painPointsFull: null,
        painSummary: null,
        buyerObjections: null,
        objectionsConfidence: 0,
        buyerObjectionsFull: null,
        objectionsSummary: null,
        proofElements: null,
        proofConfidence: 0,
        proofElementsFull: null,
        proofSummary: null,
        inputQuality: 'thin',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
