import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Input validation constants
const MAX_INPUT_LENGTH = 200;
const RATE_LIMIT_PER_HOUR = 20;

// Sanitize input
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    .replace(/[<>\"'&]/g, '')
    .slice(0, MAX_INPUT_LENGTH)
    .trim();
}

// Hash IP for rate limiting
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + 'demo-market-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Rate limiting by IP
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
    const { industry, audience } = body;

    // Input validation
    if (!industry || typeof industry !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Industry is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs
    const sanitizedIndustry = sanitizeInput(industry);
    const sanitizedAudience = audience ? sanitizeInput(audience) : 'general';

    if (sanitizedIndustry.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Industry must be at least 2 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check cache first (internal access only - not exposed via RLS)
    const cacheKey = `${sanitizedIndustry.toLowerCase()}_${sanitizedAudience.toLowerCase()}`.replace(/\s+/g, '_').slice(0, 100);
    
    const { data: cached } = await supabase
      .from('demo_market_cache')
      .select('data')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (cached?.data) {
      console.log('Cache hit for:', cacheKey, 'IP hash:', ipHash);
      return new Response(
        JSON.stringify(cached.data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Cache miss, fetching from Perplexity for:', cacheKey);

    if (!PERPLEXITY_API_KEY) {
      console.warn('PERPLEXITY_API_KEY not configured, returning mock data');
      return new Response(
        JSON.stringify({
          marketSize: `The ${sanitizedIndustry} market is substantial and growing`,
          buyerPersona: `Typical buyers are decision-makers in ${sanitizedAudience}`,
          commonObjections: [
            'Concerns about implementation time and complexity',
            'Questions about ROI and measurable outcomes',
            'Need for proof from similar businesses',
          ],
          industryInsights: [
            `${sanitizedIndustry} businesses are increasingly looking for differentiation`,
            'Digital presence is becoming critical for competitive advantage',
          ],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Perplexity API with sanitized inputs
    const query = `For ${sanitizedIndustry} businesses targeting ${sanitizedAudience}:
1. Approximate market size
2. Typical buyer persona (age, role, priorities, decision factors)
3. Top 3 objections/concerns prospects have
4. 2-3 specific insights about their buying behavior

Be specific and concise. Return factual information.`;

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: 'You are a market research analyst. Provide concise, factual insights.' },
          { role: 'user', content: query },
        ],
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error('Perplexity API error:', perplexityResponse.status, errorText);
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
    }

    const perplexityData = await perplexityResponse.json();
    const researchContent = perplexityData.choices?.[0]?.message?.content || '';

    // Helper to strip citation brackets
    const stripCitations = (text: string): string => {
      return text
        .replace(/\[\d+(?:,\s*\d+)*\]/g, '')
        .replace(/\[\d+\]\[\d+\]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    // Parse the research into structured format
    const result = {
      marketSize: stripCitations(extractSection(researchContent, 'market size') || `The ${sanitizedIndustry} market continues to grow`),
      buyerPersona: stripCitations(extractSection(researchContent, 'buyer persona') || `Decision-makers in ${sanitizedAudience}`),
      commonObjections: extractList(researchContent, 'objections').map(stripCitations),
      industryInsights: extractList(researchContent, 'insights').map(stripCitations),
    };

    // Ensure we have at least some objections and insights
    if (result.commonObjections.length === 0) {
      result.commonObjections = [
        'Concerns about implementation complexity',
        'Questions about return on investment',
        'Need for proven results',
      ];
    }
    if (result.industryInsights.length === 0) {
      result.industryInsights = [
        `${sanitizedIndustry} is seeing increased digital transformation`,
        'Buyers are looking for differentiated solutions',
      ];
    }

    // Cache the result (only accessible via this function, not publicly)
    await supabase.from('demo_market_cache').upsert({
      cache_key: cacheKey,
      data: result,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: 'cache_key' });

    console.log('Research completed and cached for:', cacheKey, 'IP hash:', ipHash);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in demo-market-research:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Processing error',
        marketSize: null,
        buyerPersona: null,
        commonObjections: [],
        industryInsights: [],
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractSection(text: string, keyword: string): string | null {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(keyword)) {
      let result = lines[i].replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();
      if (lines[i + 1] && !lines[i + 1].match(/^\d+\./)) {
        result += ' ' + lines[i + 1].replace(/\*\*/g, '').trim();
      }
      return result.slice(0, 200);
    }
  }
  return null;
}

function extractList(text: string, keyword: string): string[] {
  const results: string[] = [];
  const lines = text.split('\n');
  let inSection = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes(keyword)) {
      inSection = true;
      continue;
    }
    
    if (inSection) {
      const cleaned = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();
      if (cleaned.length > 10 && cleaned.length < 150) {
        results.push(cleaned);
      }
      if (results.length >= 3) break;
      if (line.match(/^\d+\./) && !line.toLowerCase().includes(keyword)) {
        inSection = false;
      }
    }
  }
  
  return results.slice(0, 3);
}
