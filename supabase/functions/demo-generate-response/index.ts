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
  const data = encoder.encode(ip + 'demo-response-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

// Determine which field we should be trying to extract next
function determineExtractionTarget(extractedIntelligence: any): 'industry' | 'audience' | 'valueProp' | 'proof' {
  if (!extractedIntelligence) return 'industry';
  
  // Check in order: industry → audience → valueProp → proof
  if (!extractedIntelligence.industry) return 'industry';
  if (!extractedIntelligence.audience) return 'audience';
  if (!extractedIntelligence.valueProp) return 'valueProp';
  return 'proof';
}

// Get GUIDE options based on what we're trying to extract
function getGuideOptions(target: 'industry' | 'audience' | 'valueProp' | 'proof'): string {
  if (target === 'industry') {
    return `Which of these best describes your services?

• Marketing, advertising & lead generation
• Sales consulting or training
• Operations & process improvement
• Technology, software & IT services
• Financial, accounting or legal advisory
• HR, recruiting & talent services
• Strategy & management consulting
• Creative services (design, content, video)
• Something else entirely`;
  }
  
  if (target === 'audience') {
    return `And who typically hires you?

• Founders & CEOs
• Department heads (Marketing, Sales, Ops, etc.)
• Mid-level managers
• Procurement / purchasing teams
• Technical specialists (IT, Engineering)
• Small business owners
• Enterprise companies
• Other`;
  }
  
  if (target === 'valueProp') {
    return `What's the main outcome you deliver for clients?

• Increase revenue / sales
• Reduce costs / save money
• Save time / improve efficiency
• Reduce risk / improve compliance
• Improve quality / performance
• Strategic clarity / better decisions
• Something else`;
  }
  
  // proof
  return `What proof points do you have?

• Client results with numbers
• Years of experience
• Number of clients served
• Industry certifications
• Published work or case studies
• Notable client logos
• None yet — just getting started`;
}

const buildSystemPrompt = (
  messageCount: number, 
  inputQuality: string, 
  consecutiveThinInputs: number,
  extractionTarget: 'industry' | 'audience' | 'valueProp' | 'proof',
  hasAnyIntelligence: boolean
) => {
  const basePrompt = `You are a senior strategist conducting a focused intake interview at PageConsult. This is a live demo — your job is to gather intelligence quickly and efficiently.

YOUR ROLE: Strategist gathering intel — NOT a research assistant sharing findings.

## RESPONSE FORMAT (MANDATORY)
Every response must be EXACTLY:
1. Brief acknowledgment (1 sentence max, or skip entirely)
2. One follow-up question that moves forward

That's it. 2-3 sentences MAXIMUM. No exceptions.

## STRICT PROHIBITIONS
- NO insight paragraphs or market research mid-conversation
- NO "Here's what I found..." or "Research shows..."
- NO multi-paragraph responses
- NO lecturing about landing pages
- NO bullet points or numbered lists
- NO explaining methodology
- NO unsolicited advice
- NO sycophantic language ("Great question!", "That's fascinating!")
- NEVER dump information the user didn't ask for

## ACKNOWLEDGMENT HANDLING
When user says "ok", "sure", "got it", "I see", "yes", etc.:
→ Treat as "ready for next question"
→ Simply ask the next question
→ Do NOT share more info

## HOW TO USE INTELLIGENCE
Research informs your QUESTIONS, not separate deliverables.
Wrong: "Research shows 67% of buyers want X..."
Right: "You're in a crowded space — what actually makes you different?"`;

  // THIN INPUT HANDLING
  if (inputQuality === 'thin') {
    
    // GUIDE MODE: After 2+ consecutive thin inputs, offer multiple choice options
    if (consecutiveThinInputs >= 2) {
      const guideOptions = getGuideOptions(extractionTarget);
      
      return basePrompt + `

THE USER HAS GIVEN VAGUE INPUTS. Switch to GUIDE MODE.

RESPONSE MUST BE EXACTLY:
"Let me make this easier.

${guideOptions}"

Nothing else.`;
    }
    
    // PROBE MODE: First thin input — ask a clarifying question
    if (extractionTarget === 'industry') {
      return basePrompt + `

INPUT IS VAGUE about their business/service type.

Ask ONE specific question to understand what they do. Keep it to 1-2 sentences.

Example: "Services to companies covers a lot of ground. What kind specifically?"`;
    }
    
    if (extractionTarget === 'audience') {
      return basePrompt + `

INPUT IS VAGUE about their target audience/buyer.

Ask ONE specific question about WHO buys. Keep it to 1-2 sentences.

Example: "Who's the actual buyer — founders, department heads, procurement?"`;
    }
    
    if (extractionTarget === 'valueProp') {
      return basePrompt + `

INPUT IS VAGUE about their value proposition.

Ask ONE specific question about the OUTCOME they deliver. Keep it to 1-2 sentences.

Example: "What's the specific outcome — more revenue, lower costs, faster delivery?"`;
    }
    
    // proof target
    return basePrompt + `

INPUT IS VAGUE about proof/credibility.

Ask ONE specific question about results or credentials. Keep it to 1-2 sentences.

Example: "What results can you point to — numbers, client logos, years of experience?"`;
  }

  // NORMAL CONVERSATION FLOW
  if (messageCount === 1) {
    return basePrompt + `

FIRST MESSAGE RESPONSE:
1. Brief acknowledgment of what they do (half sentence)
2. One smart follow-up question

Example:
Input: "I run a bookkeeping service for restaurants"
Output: "Bookkeeping for restaurants — got it. What's the biggest headache they're trying to escape when they call you?"

NO insights. NO research. Just gather intel.`;
  }
  
  if (messageCount === 2) {
    return basePrompt + `

SECOND MESSAGE RESPONSE:
1. Brief acknowledgment (half sentence)
2. One follow-up about differentiation or proof

Example:
Input: "They're drowning in receipts and have no idea if they made money"
Output: "That chaos is visceral. What makes you different from other bookkeepers they could hire?"

NO insights. NO research. NO "I've found something interesting..."`;
  }
  
  if (messageCount >= 3 && messageCount <= 5) {
    return basePrompt + `

MESSAGE ${messageCount} RESPONSE:
1. Brief acknowledgment
2. Continue gathering: differentiator, proof points, or specific audience details

Keep it tight. One question at a time.`;
  }
  
  // After 5+ messages, can offer to proceed
  return basePrompt + `

You have enough intel. Your response should be:
"Got what I need. Ready for me to pull together a strategy brief?"

Do NOT mention research, market analysis, or what you'll "dig into."
Just offer to proceed.`;
};

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
        JSON.stringify({ error: 'Rate limit exceeded', response: "I'm getting a lot of interest right now. Please try again in a bit." }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { userMessage, extractedIntelligence, marketResearch, conversationHistory, messageCount, inputQuality } = body;

    // Input validation
    if (!userMessage || typeof userMessage !== 'string') {
      return new Response(
        JSON.stringify({ error: 'User message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (userMessage.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ error: 'Message too long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Sanitize user message
    const sanitizedMessage = sanitizeAIInput(userMessage);

    // Calculate conversation state
    const validHistory = Array.isArray(conversationHistory) ? conversationHistory : [];
    
    // Use the explicit thin count passed from the frontend (more reliable than inferring)
    // The frontend tracks this properly: increments on thin input, resets on adequate/rich
    const thinCount = typeof body.consecutiveThinInputs === 'number' 
      ? body.consecutiveThinInputs 
      : (inputQuality === 'thin' ? 1 : 0);
    
    // Determine what field we're trying to extract
    const extractionTarget = determineExtractionTarget(extractedIntelligence);
    
    // Check if we have any intelligence at all
    const hasAnyIntelligence = extractedIntelligence && (
      extractedIntelligence.industry || 
      extractedIntelligence.audience || 
      extractedIntelligence.valueProp
    );

    console.log('🎯 Extraction target:', extractionTarget);
    console.log('📊 Input quality:', inputQuality);
    console.log('🔄 Consecutive thin inputs (from frontend):', thinCount);
    console.log('📈 Has any intelligence:', hasAnyIntelligence);

    // Build context with sanitized data (only if we have real intelligence)
    let context = '';
    
    if (hasAnyIntelligence) {
      context += '\n\nEXTRACTED INTELLIGENCE:';
      if (extractedIntelligence.industry) context += `\n- Industry: ${sanitizeAIInput(String(extractedIntelligence.industry)).slice(0, 100)}`;
      if (extractedIntelligence.audience) context += `\n- Audience: ${sanitizeAIInput(String(extractedIntelligence.audience)).slice(0, 200)}`;
      if (extractedIntelligence.valueProp) context += `\n- Value Prop: ${sanitizeAIInput(String(extractedIntelligence.valueProp)).slice(0, 200)}`;
    }

    if (marketResearch && typeof marketResearch === 'object' && !marketResearch.isLoading) {
      context += '\n\nMARKET RESEARCH:';
      if (marketResearch.buyerPersona) context += `\n- Buyer Persona: ${sanitizeAIInput(String(marketResearch.buyerPersona)).slice(0, 300)}`;
      if (Array.isArray(marketResearch.commonObjections) && marketResearch.commonObjections.length > 0) {
        const sanitizedObjections = marketResearch.commonObjections
          .slice(0, 3)
          .map((o: unknown) => sanitizeAIInput(String(o)).slice(0, 100))
          .join('; ');
        context += `\n- Common Objections: ${sanitizedObjections}`;
      }
    }

    // Build system prompt based on input quality and state
    const currentInputQuality = inputQuality || 'adequate';
    const systemPrompt = buildSystemPrompt(
      messageCount || 1, 
      currentInputQuality, 
      thinCount,
      extractionTarget,
      hasAnyIntelligence
    );
    
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt + context },
    ];

    // Add sanitized conversation history (last 6 messages for context)
    const historyToInclude = validHistory
      .slice(-Math.min(6, MAX_CONVERSATION_HISTORY))
      .filter((msg: any) => msg && typeof msg.role === 'string' && typeof msg.content === 'string');
    
    for (const msg of historyToInclude) {
      messages.push({ 
        role: msg.role === 'assistant' ? 'assistant' : 'user', 
        content: sanitizeAIInput(msg.content) 
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded', response: "I'm getting a lot of interest right now. Give me a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I'd love to learn more about your business. What specific problem do you solve, and for whom?";

    console.log('✅ Generated response for IP hash:', ipHash);
    console.log('📝 Response preview:', aiResponse.slice(0, 100) + '...');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        extractionTarget, // Return for frontend tracking if needed
        consecutiveThinInputs: thinCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in demo-generate-response:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Processing error',
        response: "I'd love to learn more about your business. What specific problem do you solve, and for whom?",
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
