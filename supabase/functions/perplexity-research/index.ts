import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResearchRequest {
  service: string;
  location?: string;
  industry: string;
  concerns?: string;
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
  
  // Split into sentences
  const sentences = text.split(/[.!?]+\s+/);
  
  for (const sentence of sentences) {
    // Match patterns like "According to [Source] (Year), [claim]"
    // or "[Claim] - [Source], Year" or similar variations
    const patterns = [
      /according to ([^(,]+)(?:\s*\((\d{4})\)|,\s*(\d{4}))[,:]?\s*(.+)/i,
      /([^-]+)\s*-\s*([^,]+),?\s*(\d{4})/i,
      /([\d.]+%|[\d,]+|[\$][\d,]+(?:[KMB])?)[^(]*\(([^,)]+),?\s*(\d{4})\)/i,
    ];
    
    for (const pattern of patterns) {
      const match = sentence.match(pattern);
      if (match) {
        let source, year, claim, statistic;
        
        if (pattern.source.includes('according to')) {
          source = match[1].trim();
          year = parseInt(match[2] || match[3]);
          claim = match[4].trim();
          statistic = claim.match(/\d+(?:\.\d+)?%|\$[\d,]+[KMB]?|\d+(?:,\d{3})*(?:\.\d+)?x?/)?.[0] || '';
        } else if (pattern.source.includes('-')) {
          claim = match[1].trim();
          source = match[2].trim();
          year = parseInt(match[3]);
          statistic = claim.match(/\d+(?:\.\d+)?%|\$[\d,]+[KMB]?|\d+(?:,\d{3})*(?:\.\d+)?x?/)?.[0] || '';
        } else {
          statistic = match[1].trim();
          source = match[2].trim();
          year = parseInt(match[3]);
          claim = sentence.trim();
        }
        
        // Only include recent sources (2023+)
        if (year >= 2023 && year <= currentYear) {
          // Determine context based on keywords
          let context: CitedClaim['context'] = 'general';
          const lowerClaim = claim.toLowerCase();
          
          if (lowerClaim.includes('never') || lowerClaim.includes('leave') || lowerClaim.includes('abandon')) {
            context = 'hero';
          } else if (lowerClaim.includes('cost') || lowerClaim.includes('loss') || lowerClaim.includes('lose') || lowerClaim.includes('problem')) {
            context = 'problem';
          } else if (lowerClaim.includes('roi') || lowerClaim.includes('increase') || lowerClaim.includes('improve') || lowerClaim.includes('conversion')) {
            context = 'solution';
          }
          
          claims.push({
            statistic: statistic || claim.match(/\d+(?:\.\d+)?%|\$[\d,]+[KMB]?/)?.[0] || '',
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
  
  return {
    claims: claims.filter((claim, index, self) => 
      index === self.findIndex(c => c.statistic === claim.statistic && c.source === claim.source)
    ),
    fullText: text
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { service, location, industry, concerns }: ResearchRequest = await req.json();
    
    console.log('Research request:', { service, location, industry, concerns });
    
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


    console.log('Calling Perplexity API with query:', query);

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
      console.error('Perplexity API error:', response.status, errorText);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Perplexity response:', data);
    
    const insights = data.choices[0].message.content;
    const parsedData = parseMarketData(insights);

    // Separate claims by context for strategic placement
    const heroClaim = parsedData.claims.find(c => c.context === 'hero');
    const problemClaim = parsedData.claims.find(c => c.context === 'problem');
    const solutionClaim = parsedData.claims.find(c => c.context === 'solution');
    
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
    console.error('Error in perplexity-research function:', error);
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
