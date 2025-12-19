import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const { consultationData } = await req.json();
    
    console.log('[generate-strategy-brief] Generating brief for:', consultationData.businessName);

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const systemPrompt = `You are a strategic landing page consultant. Based on consultation data, you create focused strategy briefs that will guide landing page content generation.

Your brief must be actionable, specific, and derived directly from the client's inputs. Never use generic placeholder text. If information is missing, acknowledge it and make strategic recommendations.

Output the brief in clean markdown format.`;

    const userPrompt = `Create a strategy brief for this landing page project:

## Client Information
- Business Name: ${consultationData.businessName || 'Not specified'}
- Industry: ${consultationData.industry || 'Not specified'}${consultationData.industryOther ? ` (${consultationData.industryOther})` : ''}
- Years in Business: ${consultationData.yearsInBusiness || 'Not specified'}
- Unique Strength: ${consultationData.uniqueStrength || 'Not specified'}

## Target Audience
- Ideal Client: ${consultationData.idealClient || 'Not specified'}
- Their Frustration: ${consultationData.clientFrustration || 'Not specified'}
- Desired Outcome: ${consultationData.desiredOutcome || 'Not specified'}

## Credibility
- Client Count: ${consultationData.clientCount || 'Not specified'}
- Achievements: ${consultationData.achievements || 'None provided'}
- Testimonials: ${consultationData.testimonialText || 'None provided'}

## Offer
- Main Offer: ${consultationData.mainOffer || 'Not specified'}
- Includes: ${consultationData.offerIncludes || 'Not specified'}
- Investment Range: ${consultationData.investmentRange || 'Not specified'}
- Process: ${consultationData.processDescription || 'Not specified'}

## Page Goals
- Primary Goal: ${consultationData.primaryGoal || 'Not specified'}
- CTA Text: ${consultationData.ctaText || 'Not specified'}
- Objections to Address: ${consultationData.objectionsToOvercome || 'None specified'}

${consultationData.websiteIntelligence ? `
## Existing Brand Assets
- Tagline Found: ${consultationData.websiteIntelligence.tagline || 'None'}
- Description: ${consultationData.websiteIntelligence.description || 'None'}
- Existing Testimonials: ${consultationData.websiteIntelligence.testimonials?.join(' | ') || 'None'}
` : ''}

---

Generate a STRATEGY BRIEF with these sections:

1. **Executive Summary** (2-3 sentences on the strategic approach)

2. **Target Audience Profile** (Synthesize who we're speaking to)

3. **Core Value Proposition** (One powerful statement that captures the unique value)

4. **Key Messaging Pillars** (3 main themes/messages to emphasize throughout)

5. **Competitive Differentiation** (What sets this apart)

6. **Proof Points** (Specific credibility elements to feature)

7. **Tone & Voice** (How the copy should sound)

8. **Objection Handling** (How to address concerns)

9. **Recommended Page Structure** (Specific sections in order with purpose of each)

10. **Headline Recommendations** (3 options for the main headline, derived from the value prop)

Be specific. No generic advice. Everything should tie back to the actual consultation data provided.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-strategy-brief] Anthropic API error:', errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const result = await response.json();
    const strategyBrief = result.content[0]?.text || '';

    console.log('[generate-strategy-brief] Brief generated successfully');

    return new Response(JSON.stringify({
      success: true,
      strategyBrief
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[generate-strategy-brief] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate strategy brief';
    const origin = req.headers.get('Origin');
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' }
    });
  }
});
