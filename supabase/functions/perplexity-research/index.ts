import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const ResearchRequestSchema = z.object({
  service: z.string().trim().min(2).max(200),
  location: z.string().trim().max(200).optional(),
  industry: z.string().trim().max(100),
  concerns: z.union([
    z.string().max(500),
    z.array(z.string().max(500)).max(10)
  ]).optional(),
});

interface ResearchRequest {
  service: string;
  location?: string;
  industry: string;
  concerns?: string | string[];
}

interface CitedClaim {
  statistic: string;
  claim: string;
  source: string;
  year: number;
  fullCitation: string;
  context: 'hero' | 'problem' | 'solution' | 'general';
}

interface MarketInsights {
  claims: CitedClaim[];
  fullText: string;
}

function parseMarketData(text: string): MarketInsights {
  const claims: CitedClaim[] = [];
  const currentYear = new Date().getFullYear();
  
  // Split into sentences and paragraphs
  const sentences = text.split(/[.!?]+\s+/);
  
  for (const sentence of sentences) {
    // Match patterns with full context preservation
    const patterns = [
      // "According to [Source] (Year), [full claim]"
      /according to ([^(,]+)(?:\s*\((\d{4})\)|,?\s*(\d{4}))[,:]?\s*(.+)/i,
      // "[Full claim] - [Source], Year"
      /([^-]+)\s*-\s*([^,]+),?\s*(\d{4})/i,
      // More flexible pattern for embedded citations
      /(.+?)\s*\(([^,)]+),?\s*(\d{4})\)/i,
    ];
    
    for (const pattern of patterns) {
      const match = sentence.match(pattern);
      if (match) {
        let source, year, claim, statistic;
        
        if (pattern.source.includes('according to')) {
          source = match[1].trim();
          year = parseInt(match[2] || match[3]);
          claim = match[4].trim();
        } else if (pattern.source.includes('-')) {
          claim = match[1].trim();
          source = match[2].trim();
          year = parseInt(match[3]);
        } else {
          claim = match[1].trim();
          source = match[2].trim();
          year = parseInt(match[3]);
        }
        
        // Extract statistic - preserve ranges, percentages, dollar amounts
        const statMatches = claim.match(/\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?%|\$[\d,]+(?:-\$[\d,]+)?[KMB]?|\d+(?:,\d{3})*(?:\.\d+)?(?:-\d+(?:,\d{3})*(?:\.\d+)?)?x?/g);
        statistic = statMatches ? statMatches[0] : '';
        
        // Ensure percentage symbol is included
        if (statistic && !statistic.includes('%') && claim.toLowerCase().includes('percent')) {
          statistic = statistic + '%';
        }
        
        // Only include recent sources (2023+)
        if (year >= 2023 && year <= currentYear && claim.length > 10) {
          // Determine context based on keywords
          let context: CitedClaim['context'] = 'general';
          const lowerClaim = claim.toLowerCase();
          
          if (lowerClaim.includes('bounce') || lowerClaim.includes('leave') || lowerClaim.includes('abandon')) {
            context = 'hero';
          } else if (lowerClaim.includes('cost') || lowerClaim.includes('price') || lowerClaim.includes('investment')) {
            context = 'problem';
          } else if (lowerClaim.includes('lead') || lowerClaim.includes('more') || lowerClaim.includes('increase') || lowerClaim.includes('conversion')) {
            context = 'solution';
          }
          
          claims.push({
            statistic: statistic || claim.match(/\d+(?:\.\d+)?(?:-\d+)?%|\$[\d,]+[KMB]?/)?.[0] || '',
            claim: claim.trim(),
            source: source.trim(),
            year,
            fullCitation: `${source.trim()}, ${year}`,
            context,
          });
        }
        break;
      }
    }
  }
  
  // Remove duplicates and ensure we have quality data
  const uniqueClaims = claims.filter((claim, index, self) => 
    index === self.findIndex(c => 
      c.claim.toLowerCase() === claim.claim.toLowerCase() || 
      (c.statistic === claim.statistic && c.source === claim.source)
    )
  );
  
  return {
    claims: uniqueClaims,
    fullText: text
  };
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
        JSON.stringify({ success: false, error: 'Unauthorized' }),
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
        JSON.stringify({ success: false, error: 'Unauthorized' }),
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
        JSON.stringify({ success: false, error: 'API rate limit exceeded. Please upgrade your plan or wait for the next billing cycle.' }),
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
    const validation = ResearchRequestSchema.safeParse(requestBody);
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters', details: 'Request validation failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { service, location, industry, concerns }: ResearchRequest = validation.data;
    
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }
    
    const currentYear = new Date().getFullYear();
    const locationContext = location ? `in ${location}` : '';
    
    // Build comprehensive query with citation requirements
    const query = `Find specific statistics with sources about ${service} businesses ${locationContext}. 

CRITICAL REQUIREMENTS:
- Every statistic MUST include: source name, year (2023-${currentYear}), and the claim
- Format: "According to [Source Name] (Year), [specific claim with numbers]"
- Only use reputable sources: Gartner, Forrester, McKinsey, HubSpot, industry reports, academic studies
- Include specific percentages, dollar amounts, and multipliers (e.g., "3.2x")

Find data for these specific angles:
1. ABANDONMENT/FRICTION: What % of potential customers leave or never return? (For hero impact)
2. COST OF INACTION: How much money/time do businesses lose without this solution? (For problem section)
3. ROI/IMPROVEMENT: What conversion rate increase, revenue growth, or efficiency gain does the solution provide? (For solution section)
4. ${location ? `MARKET DEMAND: Local market size and demand for ${service} in ${location}` : `Market size for ${service} industry`}

Example format: "According to HubSpot (2024), 73% of website visitors never return after leaving a site."`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{
          role: 'user',
          content: query
        }],
        temperature: 0.2,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    
    const insights = data.choices[0].message.content;
    const parsedData = parseMarketData(insights);

    // Separate claims by context for strategic placement
    const heroClaim = parsedData.claims.find(c => c.context === 'hero');
    const problemClaim = parsedData.claims.find(c => c.context === 'problem');
    const solutionClaim = parsedData.claims.find(c => c.context === 'solution');
    
    // Decrement API calls for the user
    if (userPlan) {
      await supabaseClient
        .from('user_plans')
        .update({ api_calls_remaining: userPlan.api_calls_remaining - 1 })
        .eq('user_id', user.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        insights: parsedData,
        strategicPlacements: {
          hero: heroClaim || parsedData.claims[0],
          problem: problemClaim || parsedData.claims[1],
          solution: solutionClaim || parsedData.claims[2],
        },
        allClaims: parsedData.claims,
        raw: insights
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        fallback: true
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
