import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

// Request validation schema
const RequestSchema = z.object({
  industry: z.string().min(1).max(200),
  targetAudience: z.string().min(1).max(500),
  serviceType: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  challenge: z.string().max(500).optional(),
});

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

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

    // Build research queries
    const locationContext = location ? ` in ${location}` : '';
    const serviceContext = serviceType ? ` offering ${serviceType}` : '';
    const challengeContext = challenge ? ` Their main challenge is: ${challenge}` : '';
    
    // QUERY 1: Market/Audience Research
    const marketResearchPrompt = `Research the following target audience for a ${industry} business${serviceContext}${locationContext}:

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

    // QUERY 2: Landing Page Best Practices Research
    const landingPagePrompt = `What are the best landing page practices for ${industry} service providers targeting ${targetAudience}?

Provide specific, actionable advice including:

1. HEADLINE FORMULAS: Top 3 most effective headline formulas for this industry (with examples)
2. RECOMMENDED SECTIONS: Which page sections convert best? Rank these by importance:
   - Hero with value proposition
   - Stats/credibility bar
   - Problem/solution
   - Features/benefits
   - Social proof/testimonials
   - Pricing/packages
   - FAQ
   - Final CTA
3. OPTIMAL PAGE STRUCTURE: Best order for sections and why
4. SOCIAL PROOF TYPES: What types of social proof work best for this audience? (testimonials, case studies, badges, numbers, awards)
5. CTA LANGUAGE: Most effective call-to-action phrases for this industry (provide 5 examples)
6. CALCULATOR IDEAS: Interactive calculator concepts that boost conversions for this industry
7. COMMON MISTAKES: Top 5 landing page mistakes to avoid for this industry
8. CONVERSION TIPS: 3-5 quick wins that could boost conversion rate

Be specific to the ${industry} industry. Include real examples where possible.`;

    console.log('📤 Calling Perplexity API for both queries...');
    
    // Execute both queries in parallel
    const [marketResponse, landingPageResponse] = await Promise.all([
      fetch('https://api.perplexity.ai/chat/completions', {
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
            { role: 'user', content: marketResearchPrompt }
          ],
        }),
      }),
      fetch('https://api.perplexity.ai/chat/completions', {
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
              content: 'You are a conversion rate optimization expert specializing in landing pages. Provide specific, actionable recommendations backed by industry best practices.'
            },
            { role: 'user', content: landingPagePrompt }
          ],
        }),
      })
    ]);

    if (!marketResponse.ok) {
      const errorText = await marketResponse.text();
      console.error('❌ Perplexity API error (market):', marketResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Research service unavailable' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const marketData = await marketResponse.json();
    const marketContent = marketData.choices?.[0]?.message?.content;
    const marketCitations = marketData.citations || [];
    
    console.log('📥 Market research received, parsing...');

    // Parse market research
    const research = parseResearchResponse(marketContent, marketCitations);
    
    // Parse landing page research if successful
    let landingPageBestPractices = null;
    if (landingPageResponse.ok) {
      const lpData = await landingPageResponse.json();
      const lpContent = lpData.choices?.[0]?.message?.content;
      const lpCitations = lpData.citations || [];
      
      console.log('📥 Landing page research received, parsing...');
      landingPageBestPractices = parseLandingPageResponse(lpContent, lpCitations);
    } else {
      console.warn('⚠️ Landing page research failed, continuing without it');
    }
    
    console.log('✅ Market research complete:', {
      claimsCount: research.claims.length,
      painPointsCount: research.painPoints.length,
      sourcesCount: research.sources.length,
      hasLandingPageResearch: !!landingPageBestPractices
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        research,
        landingPageBestPractices
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Market intelligence error:', error);
    const origin = req.headers.get('Origin');
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
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

/**
 * Parse landing page best practices response
 */
function parseLandingPageResponse(content: string, citations: string[]): {
  headlineFormulas: Array<{ formula: string; example?: string }>;
  recommendedSections: Array<{ name: string; importance: number; reason?: string }>;
  optimalOrder: string[];
  socialProofTypes: Array<{ type: string; effectiveness: string }>;
  ctaExamples: string[];
  calculatorIdeas: Array<{ idea: string; description?: string }>;
  commonMistakes: string[];
  conversionTips: string[];
  sources: string[];
} {
  const result = {
    headlineFormulas: [] as any[],
    recommendedSections: [] as any[],
    optimalOrder: [] as string[],
    socialProofTypes: [] as any[],
    ctaExamples: [] as string[],
    calculatorIdeas: [] as any[],
    commonMistakes: [] as string[],
    conversionTips: [] as string[],
    sources: citations
  };

  // Extract headline formulas
  const headlineSection = content.match(/headline[s]?\s*formula[s]?:?([\s\S]*?)(?=\d\.\s*[A-Z]|recommended|optimal|$)/i);
  if (headlineSection) {
    const formulas = headlineSection[1].match(/[-•*\d.]\s*([^\n]+)/g);
    if (formulas) {
      result.headlineFormulas = formulas
        .map(f => {
          const text = f.replace(/^[-•*\d.]\s*/, '').trim();
          const exampleMatch = text.match(/(?:example|e\.g\.)[:\s]*[""']?([^""'\n]+)[""']?/i);
          return {
            formula: text.replace(/(?:example|e\.g\.)[:\s]*[""']?([^""'\n]+)[""']?/i, '').trim(),
            example: exampleMatch ? exampleMatch[1].trim() : undefined
          };
        })
        .filter(f => f.formula.length > 5)
        .slice(0, 5);
    }
  }

  // Extract recommended sections with importance
  const sectionsSection = content.match(/(?:recommended\s*)?section[s]?:?([\s\S]*?)(?=\d\.\s*[A-Z]|optimal|social|$)/i);
  if (sectionsSection) {
    const sectionNames = ['hero', 'stats', 'problem', 'solution', 'features', 'benefits', 'social proof', 'testimonials', 'pricing', 'faq', 'cta'];
    const sectionText = sectionsSection[1].toLowerCase();
    
    sectionNames.forEach((name, idx) => {
      if (sectionText.includes(name)) {
        result.recommendedSections.push({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          importance: 10 - idx,
          reason: undefined
        });
      }
    });
  }

  // Extract optimal order
  const orderSection = content.match(/optimal\s*(?:page\s*)?(?:structure|order):?([\s\S]*?)(?=\d\.\s*[A-Z]|social|cta|$)/i);
  if (orderSection) {
    const items = orderSection[1].match(/[-•*\d.]\s*([^\n]+)/g);
    if (items) {
      result.optimalOrder = items
        .map(i => i.replace(/^[-•*\d.]\s*/, '').trim())
        .filter(i => i.length > 3)
        .slice(0, 8);
    }
  }

  // Extract social proof types
  const socialSection = content.match(/social\s*proof[^:]*:?([\s\S]*?)(?=\d\.\s*[A-Z]|cta|calculator|$)/i);
  if (socialSection) {
    const types = socialSection[1].match(/[-•*\d.]\s*([^\n]+)/g);
    if (types) {
      result.socialProofTypes = types
        .map(t => ({
          type: t.replace(/^[-•*\d.]\s*/, '').trim(),
          effectiveness: 'high'
        }))
        .filter(t => t.type.length > 3)
        .slice(0, 5);
    }
  }

  // Extract CTA examples
  const ctaSection = content.match(/cta[^:]*:?([\s\S]*?)(?=\d\.\s*[A-Z]|calculator|mistake|$)/i);
  if (ctaSection) {
    const ctas = ctaSection[1].match(/[""][^""]+[""]|[-•*\d.]\s*([^\n]+)/g);
    if (ctas) {
      result.ctaExamples = ctas
        .map(c => c.replace(/^[-•*\d.]\s*/, '').replace(/[""]/g, '').trim())
        .filter(c => c.length > 3 && c.length < 50)
        .slice(0, 7);
    }
  }

  // Extract calculator ideas
  const calcSection = content.match(/calculator[^:]*:?([\s\S]*?)(?=\d\.\s*[A-Z]|mistake|common|$)/i);
  if (calcSection) {
    const ideas = calcSection[1].match(/[-•*\d.]\s*([^\n]+)/g);
    if (ideas) {
      result.calculatorIdeas = ideas
        .map(i => ({
          idea: i.replace(/^[-•*\d.]\s*/, '').trim(),
          description: undefined
        }))
        .filter(i => i.idea.length > 5)
        .slice(0, 5);
    }
  }

  // Extract common mistakes
  const mistakesSection = content.match(/(?:common\s*)?mistake[s]?[^:]*:?([\s\S]*?)(?=\d\.\s*[A-Z]|conversion|tip|$)/i);
  if (mistakesSection) {
    const mistakes = mistakesSection[1].match(/[-•*\d.]\s*([^\n]+)/g);
    if (mistakes) {
      result.commonMistakes = mistakes
        .map(m => m.replace(/^[-•*\d.]\s*/, '').trim())
        .filter(m => m.length > 10)
        .slice(0, 5);
    }
  }

  // Extract conversion tips
  const tipsSection = content.match(/(?:conversion\s*)?tip[s]?[^:]*:?([\s\S]*?)$/i);
  if (tipsSection) {
    const tips = tipsSection[1].match(/[-•*\d.]\s*([^\n]+)/g);
    if (tips) {
      result.conversionTips = tips
        .map(t => t.replace(/^[-•*\d.]\s*/, '').trim())
        .filter(t => t.length > 10)
        .slice(0, 5);
    }
  }

  return result;
}
