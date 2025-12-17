import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Request validation schema
const RequestSchema = z.object({
  industry: z.string().min(1).max(200),
  targetAudience: z.string().min(1).max(500),
  serviceType: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  challenge: z.string().max(500).optional(),
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate request
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      console.error('❌ Validation error:', parsed.error);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { industry, targetAudience, serviceType, location, challenge } = parsed.data;
    
    console.log('🔍 Starting market research:', { industry, targetAudience });

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      console.error('❌ PERPLEXITY_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Research service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build research query
    const locationContext = location ? ` in ${location}` : '';
    const serviceContext = serviceType ? ` offering ${serviceType}` : '';
    const challengeContext = challenge ? ` Their main challenge is: ${challenge}` : '';
    
    const researchPrompt = `Research the following target audience for a ${industry} business${serviceContext}${locationContext}:

Target Audience: ${targetAudience}
${challengeContext}

Provide detailed, factual market research including:

1. DEMOGRAPHICS: Age range, income level, location patterns, occupation, family status
2. PAIN POINTS: Top 5 specific problems/frustrations this audience faces (be specific and actionable)
3. MARKET STATISTICS: 3-5 recent statistics with sources about this market/audience (include year and source)
4. BUYING BEHAVIOR: How does this audience typically make purchasing decisions? What do they research?
5. COMPETITOR LANDSCAPE: What alternatives exist? What are common claims competitors make?
6. MARKET GAPS: What are 2-3 underserved needs or opportunities in this market?
7. DECISION FACTORS: Top 5 factors that influence their buying decision (ranked by importance)
8. TRUST SIGNALS: What makes this audience trust a provider?

Format your response as structured data that can be parsed. Focus on ACTIONABLE insights that can inform marketing copy.`;

    console.log('📤 Calling Perplexity API...');
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { 
            role: 'system', 
            content: 'You are a market research analyst. Provide factual, data-driven insights with citations. Focus on actionable information for marketing and sales.'
          },
          { role: 'user', content: researchPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Perplexity API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Research service unavailable' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const researchContent = data.choices?.[0]?.message?.content;
    const citations = data.citations || [];
    
    console.log('📥 Research received, parsing...');

    // Parse the research into structured format
    const research = parseResearchResponse(researchContent, citations);
    
    console.log('✅ Market research complete:', {
      claimsCount: research.claims.length,
      painPointsCount: research.painPoints.length,
      sourcesCount: research.sources.length
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        research 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Market intelligence error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Parse Perplexity response into structured research format
 */
function parseResearchResponse(content: string, citations: string[]): {
  claims: Array<{
    claim: string;
    source: string;
    sourceUrl?: string;
    year?: number;
    confidence: 'high' | 'medium' | 'low';
    category: string;
  }>;
  demographics: {
    ageRange?: string;
    income?: string;
    location?: string;
    buyingBehavior?: string[];
    decisionFactors?: string[];
  };
  competitors: Array<{
    type: string;
    commonClaims: string[];
    marketGaps?: string[];
  }>;
  painPoints: string[];
  trends?: string[];
  researchedAt: string;
  sources: string[];
} {
  const research = {
    claims: [] as any[],
    demographics: {} as any,
    competitors: [] as any[],
    painPoints: [] as string[],
    trends: [] as string[],
    researchedAt: new Date().toISOString(),
    sources: citations
  };

  // Extract statistics/claims with citation patterns
  const statPattern = /(\d+(?:\.\d+)?%|\$[\d,]+(?:\.\d+)?[BMK]?|\d+(?:,\d+)*)\s*([^.]+)/gi;
  let match;
  while ((match = statPattern.exec(content)) !== null) {
    const claim = match[0].trim();
    const yearMatch = claim.match(/20\d{2}/);
    
    research.claims.push({
      claim,
      source: citations[0] || 'Perplexity Research',
      year: yearMatch ? parseInt(yearMatch[0]) : undefined,
      confidence: citations.length > 0 ? 'high' : 'medium',
      category: 'statistic'
    });
  }

  // Extract pain points
  const painPointSection = content.match(/pain points?:?([\s\S]*?)(?=\d\.|market|competitor|demographic|buying|$)/i);
  if (painPointSection) {
    const points = painPointSection[1].match(/[-•*]\s*([^\n-•*]+)/g);
    if (points) {
      research.painPoints = points
        .map(p => p.replace(/^[-•*]\s*/, '').trim())
        .filter(p => p.length > 10)
        .slice(0, 7);
    }
  }

  // Extract demographics
  const ageMatch = content.match(/age[s]?\s*(?:range)?:?\s*(\d+[-–]\d+|\d+\+)/i);
  if (ageMatch) research.demographics.ageRange = ageMatch[1];
  
  const incomeMatch = content.match(/income:?\s*\$?([\d,]+k?[-–]?[\d,]*k?)/i);
  if (incomeMatch) research.demographics.income = incomeMatch[1];

  // Extract decision factors
  const decisionSection = content.match(/decision factors?:?([\s\S]*?)(?=\d\.|trust|market|$)/i);
  if (decisionSection) {
    const factors = decisionSection[1].match(/[-•*\d.]\s*([^\n-•*]+)/g);
    if (factors) {
      research.demographics.decisionFactors = factors
        .map(f => f.replace(/^[-•*\d.]\s*/, '').trim())
        .filter(f => f.length > 5)
        .slice(0, 5);
    }
  }

  // Extract market gaps
  const gapsSection = content.match(/market gaps?:?([\s\S]*?)(?=\d\.|trust|decision|$)/i);
  if (gapsSection) {
    const gaps = gapsSection[1].match(/[-•*\d.]\s*([^\n-•*]+)/g);
    if (gaps) {
      research.competitors.push({
        type: 'market_analysis',
        commonClaims: [],
        marketGaps: gaps
          .map(g => g.replace(/^[-•*\d.]\s*/, '').trim())
          .filter(g => g.length > 10)
          .slice(0, 3)
      });
    }
  }

  // Add trends if found
  const trendsSection = content.match(/trend[s]?:?([\s\S]*?)(?=\d\.|$)/i);
  if (trendsSection) {
    const trends = trendsSection[1].match(/[-•*]\s*([^\n-•*]+)/g);
    if (trends) {
      research.trends = trends
        .map(t => t.replace(/^[-•*]\s*/, '').trim())
        .filter(t => t.length > 10)
        .slice(0, 3);
    }
  }

  // Ensure we have at least some pain points
  if (research.painPoints.length === 0) {
    // Try alternative extraction
    const lines = content.split('\n').filter(l => l.trim().length > 20);
    research.painPoints = lines
      .filter(l => /problem|frustrat|challeng|struggle|concern|worry|fear/i.test(l))
      .map(l => l.replace(/^[-•*\d.]\s*/, '').trim())
      .slice(0, 5);
  }

  return research;
}
