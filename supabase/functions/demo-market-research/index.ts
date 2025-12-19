import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { industry, audience } = await req.json();

    if (!industry) {
      return new Response(
        JSON.stringify({ error: 'Industry is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check cache first
    const cacheKey = `${industry.toLowerCase()}_${(audience || 'general').toLowerCase()}`.replace(/\s+/g, '_').slice(0, 100);
    
    const { data: cached } = await supabase
      .from('demo_market_cache')
      .select('data')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (cached?.data) {
      console.log('Cache hit for:', cacheKey);
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
          marketSize: `The ${industry} market is substantial and growing`,
          buyerPersona: `Typical buyers are decision-makers in ${audience || 'target organizations'}`,
          commonObjections: [
            'Concerns about implementation time and complexity',
            'Questions about ROI and measurable outcomes',
            'Need for proof from similar businesses',
          ],
          industryInsights: [
            `${industry} businesses are increasingly looking for differentiation`,
            'Digital presence is becoming critical for competitive advantage',
          ],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Perplexity API
    const query = `For ${industry} businesses targeting ${audience || 'general audience'}:
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

    // Parse the research into structured format
    const result = {
      marketSize: extractSection(researchContent, 'market size') || `The ${industry} market continues to grow`,
      buyerPersona: extractSection(researchContent, 'buyer persona') || `Decision-makers in ${audience || 'the target market'}`,
      commonObjections: extractList(researchContent, 'objections'),
      industryInsights: extractList(researchContent, 'insights'),
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
        `${industry} is seeing increased digital transformation`,
        'Buyers are looking for differentiated solutions',
      ];
    }

    // Cache the result
    await supabase.from('demo_market_cache').upsert({
      cache_key: cacheKey,
      data: result,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: 'cache_key' });

    console.log('Research completed and cached for:', cacheKey);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in demo-market-research:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
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
      // Return this line and potentially the next if it's a continuation
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
