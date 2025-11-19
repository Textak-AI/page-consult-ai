import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const InsightsRequestSchema = z.object({
  industry: z.string().trim().min(2).max(100),
  serviceType: z.string().trim().max(200).optional(),
  location: z.string().trim().max(200).optional(),
  audience: z.string().trim().max(500).optional(),
});

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
    const validation = InsightsRequestSchema.safeParse(requestBody);
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters', details: 'Request validation failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { industry, serviceType, location, audience }: InsightsRequest = validation.data;
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

    if (!perplexityApiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build contextual query based on industry type
    const query = buildQuery(industry, serviceType, location, audience);

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
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
      return new Response(
        JSON.stringify({ error: 'Failed to get industry insights', details: errorText }), 
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const insights = data.choices?.[0]?.message?.content;

    if (!insights) {
      return new Response(
        JSON.stringify({ error: 'No insights generated' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the insights into structured data
    const structuredInsights = parseInsights(insights, industry, serviceType);

    // Decrement API calls for the user
    if (userPlan) {
      await supabaseClient
        .from('user_plans')
        .update({ api_calls_remaining: userPlan.api_calls_remaining - 1 })
        .eq('user_id', user.id);
    }

    return new Response(
      JSON.stringify({ insights: structuredInsights }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
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
Provide specific market data for ${service} in ${loc}:

MARKET SIZE & GROWTH (with exact numbers):
- Total market size in dollars (e.g., "$8.5 billion")
- Annual growth rate as percentage (e.g., "4.2% annually")
- Number of projects/customers per year in ${loc}
- Recent demand trends (2024-2025)

CUSTOMER PAIN POINTS (with statistics):
- What percentage of ${target} delay or avoid ${service}
- Cost of delaying professional service (specific dollar amounts)
- Common problems ${target} face (with percentages of how many experience each)
- Average time wasted or money lost due to DIY attempts

PROJECT COSTS & VALUE:
- Average project cost range for ${service}
- Property value increase from professional ${service} (if applicable)
- Cost comparison: professional vs DIY over 5-10 years
- ROI statistics (if available)

INDUSTRY CREDENTIALS & STANDARDS:
- Key certifications that matter (name specific ones)
- Percentage of professionals with proper licensing/insurance
- Industry associations that provide credibility
- Required qualifications or training

COMPETITIVE LANDSCAPE:
- Number of service providers in ${loc} area
- Market concentration (few big players vs many small ones)
- Average business age/experience in the market
- Customer satisfaction rates (industry average)

ONLY include specific numbers, dollar amounts, and percentages. Cite recent data from 2023-2024. Be precise and quantitative.
`;
}

function parseInsights(rawInsights: string, industry: string, serviceType?: string): any {
  // Extract key statistics and facts from the response
  const marketStats: string[] = [];
  const painPoints: string[] = [];
  const valueProps: string[] = [];
  const credentials: string[] = [];
  
  // Split into lines and categorize
  const lines = rawInsights.split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    const cleaned = line.replace(/^[-*•#]\s*/, '').replace(/^\d+\.\s*/, '').trim();
    if (!cleaned || cleaned.length < 10) return;
    
    // Market size & growth stats (with dollar amounts or percentages)
    if (cleaned.match(/market size|\$[\d,.]+\s*(billion|million|[BM])|growth rate|\d+\.?\d*%\s*annual/i)) {
      marketStats.push(cleaned);
    }
    // Customer pain points (delays, problems, costs of not using service)
    else if (cleaned.match(/delay|avoid|problem|pain point|cost of|wasted|lost|DIY|amateur/i) && cleaned.match(/\d+%|\$[\d,]+/)) {
      painPoints.push(cleaned);
    }
    // Value propositions (ROI, property value, cost savings, longevity)
    else if (cleaned.match(/value|ROI|return|increase|save|savings|professional|lasts?|durability|vs\.?\s*DIY/i) && cleaned.match(/\d+%|\$[\d,]+|\d+[x×]/i)) {
      valueProps.push(cleaned);
    }
    // Credentials and trust factors
    else if (cleaned.match(/certif|licens|insur|accredit|member|association|standard|qualif|trained/i)) {
      credentials.push(cleaned);
    }
    // Any other line with specific numbers
    else if (cleaned.match(/\d+%|\$[\d,]+|[\d,]+\s*(projects|customers|homes|businesses)/i) && cleaned.length < 200) {
      // Categorize based on context
      if (cleaned.match(/market|industry|demand|area|annually/i)) {
        marketStats.push(cleaned);
      } else if (cleaned.match(/property|value|cost|price|investment/i)) {
        valueProps.push(cleaned);
      } else {
        painPoints.push(cleaned);
      }
    }
  });
  
  // Extract specific numbers for better formatting
  const extractedStats = {
    marketSize: extractMarketSize(rawInsights),
    growthRate: extractGrowthRate(rawInsights),
    customerCount: extractCustomerCount(rawInsights),
  };
  
  return {
    industry: serviceType || industry,
    stats: marketStats.slice(0, 5),
    facts: painPoints.slice(0, 5),
    valueProps: valueProps.slice(0, 4),
    credentials: credentials.slice(0, 3),
    extractedStats,
    rawText: rawInsights,
  };
}

function extractMarketSize(text: string): string | null {
  // Look for market size patterns like "$8.5 billion", "$2.3B", "8.5 billion dollars"
  const patterns = [
    /\$[\d,.]+\s*(billion|million|[BM])\s*(market|industry)?/i,
    /(market|industry)\s*(size|value)\s*:?\s*\$?[\d,.]+\s*(billion|million|[BM])?/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}

function extractGrowthRate(text: string): string | null {
  // Look for growth rate patterns like "4.2% annually", "growing at 8%"
  const patterns = [
    /\d+\.?\d*%\s*(annual|yearly|per year|growth)/i,
    /(growing|growth|increasing)\s*(at|by)?\s*\d+\.?\d*%/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}

function extractCustomerCount(text: string): string | null {
  // Look for customer/project counts like "2,400+ projects annually", "45,000 homes"
  const patterns = [
    /[\d,]+\+?\s*(projects|customers|homes|businesses|properties)\s*(annually|per year|in|area)?/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}
