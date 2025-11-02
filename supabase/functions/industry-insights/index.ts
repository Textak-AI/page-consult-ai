import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InsightsRequest {
  industry: string;
  serviceType?: string;
  location?: string;
  audience?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { industry, serviceType, location, audience }: InsightsRequest = await req.json();
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

    if (!perplexityApiKey) {
      console.error('PERPLEXITY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating industry insights for:', { industry, serviceType, location });

    // Build contextual query based on industry type
    const query = buildQuery(industry, serviceType, location, audience);

    console.log('Perplexity query:', query);

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a market research expert. Provide concise, data-driven insights with specific statistics and trends. Focus on credible numbers that build trust.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to get industry insights', details: errorText }), 
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const insights = data.choices?.[0]?.message?.content;

    if (!insights) {
      console.error('No insights in response:', data);
      return new Response(
        JSON.stringify({ error: 'No insights generated' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generated insights:', insights);

    // Parse the insights into structured data
    const structuredInsights = parseInsights(insights, industry, serviceType);

    return new Response(
      JSON.stringify({ insights: structuredInsights }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in industry-insights function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildQuery(industry: string, serviceType?: string, location?: string, audience?: string): string {
  const service = serviceType || industry;
  const loc = location || 'United States';
  const target = audience || 'customers';
  
  return `
Research the ${service} industry and provide:

1. Market Size & Growth:
   - Current market size in ${loc}
   - Annual growth rate
   - Demand trends for 2024-2025

2. Customer Statistics:
   - What percentage of ${target} need ${service}
   - Average customer satisfaction rates in the industry
   - Common pain points or problems ${target} face

3. Industry Standards:
   - Typical project timelines or service duration
   - Average cost ranges
   - Important certifications or qualifications that matter

4. Competitive Advantage:
   - Why professional service is better than DIY
   - ROI or value of professional vs amateur work
   - Industry best practices

5. Trust Factors:
   - Key credentials or memberships that build credibility
   - Statistics showing importance of licensing/insurance
   - Industry associations or regulatory bodies

Provide specific numbers, percentages, and dollar amounts where possible. Focus on recent data (2023-2024).
`;
}

function parseInsights(rawInsights: string, industry: string, serviceType?: string): any {
  // Extract key statistics and facts from the response
  const stats: string[] = [];
  const facts: string[] = [];
  const trustSignals: string[] = [];
  
  // Split into lines and categorize
  const lines = rawInsights.split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    const cleaned = line.replace(/^[-*•]\s*/, '').trim();
    if (!cleaned) return;
    
    // Look for lines with percentages or dollar amounts (stats)
    if (cleaned.match(/\d+%|\$[\d,]+|\d+\.\d+[BM]?/)) {
      stats.push(cleaned);
    }
    // Look for lines about certifications, licensing, insurance (trust signals)
    else if (cleaned.match(/certif|licens|insur|accredit|member|standard|regulat/i)) {
      trustSignals.push(cleaned);
    }
    // Everything else is a general fact
    else if (cleaned.length > 20 && cleaned.length < 200) {
      facts.push(cleaned);
    }
  });
  
  return {
    industry: serviceType || industry,
    stats: stats.slice(0, 6),
    facts: facts.slice(0, 6),
    trustSignals: trustSignals.slice(0, 4),
    rawText: rawInsights,
  };
}
