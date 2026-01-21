import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';
import { getLayoutRecommendation } from '../../../src/lib/industryLayouts/index.ts';
import { consultationToIntelligence } from '../../../src/lib/industryLayouts/adapter.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const { consultationData } = await req.json();
    
    console.log('[generate-strategy-brief] Received consultationData:', JSON.stringify(consultationData, null, 2));
    console.log('[generate-strategy-brief] Generating brief for:', consultationData.businessName || 'Unknown business');

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Convert consultation to intelligence format and get layout recommendation
    // With fallback handling in case the industry layouts system fails
    let layoutResult: {
      config: {
        name: string;
        description: string;
        layout: {
          heroStyle: string;
          preferredFeatureLayout: string;
          maxFeatureCards: number;
          socialProofStyle: string;
          ctaPlacement: string;
          pageDensity: string;
        };
        contentGuidance: {
          toneKeywords: string[];
          avoidWords: string[];
          ctaText: { primary: string[]; secondary: string[] };
          proofEmphasis: string;
        };
        trustPriorities: string[];
      };
      confidence: number;
      reasoning: string;
      sections: string[];
    };
    
    try {
      const intelligence = consultationToIntelligence(consultationData);
      const result = getLayoutRecommendation(intelligence);
      
      // Map to simplified structure for prompt injection
      layoutResult = {
        config: {
          name: result.config.name,
          description: result.config.description,
          layout: {
            heroStyle: result.config.layout.heroStyle,
            preferredFeatureLayout: result.config.layout.preferredFeatureLayout,
            maxFeatureCards: result.config.layout.maxFeatureCards,
            socialProofStyle: result.config.layout.socialProofStyle,
            ctaPlacement: result.config.layout.ctaPlacement,
            pageDensity: result.config.layout.pageDensity,
          },
          contentGuidance: {
            toneKeywords: result.config.contentGuidance.toneKeywords,
            avoidWords: result.config.contentGuidance.avoidWords,
            ctaText: result.config.contentGuidance.ctaText,
            proofEmphasis: result.config.contentGuidance.proofEmphasis,
          },
          trustPriorities: result.config.trustPriorities,
        },
        confidence: result.confidence,
        reasoning: result.reasoning,
        sections: result.sections,
      };
      
      // Log for debugging
      console.log('🏗️ [Layout Intelligence]', layoutResult.reasoning);
      console.log('📊 [Confidence]', Math.round(layoutResult.confidence * 100) + '%');
      console.log('📋 [Sections]', layoutResult.sections);
      console.log('🎨 [Hero Style]', layoutResult.config.layout.heroStyle);
    } catch (layoutError) {
      console.warn('⚠️ [Layout Intelligence] Failed to get recommendation, using defaults:', layoutError);
      
      // Provide sensible defaults so brief generation can continue
      layoutResult = {
        config: {
          name: 'default',
          description: 'Default layout configuration',
          layout: {
            heroStyle: 'bold-statement',
            preferredFeatureLayout: '3-col',
            maxFeatureCards: 6,
            socialProofStyle: 'testimonials',
            ctaPlacement: 'hero-and-final',
            pageDensity: 'balanced',
          },
          contentGuidance: {
            toneKeywords: ['professional', 'clear', 'confident'],
            avoidWords: ['maybe', 'try', 'hope'],
            ctaText: {
              primary: ['Get Started', 'Learn More'],
              secondary: ['Schedule a Call', 'Contact Us'],
            },
            proofEmphasis: 'results',
          },
          trustPriorities: ['testimonials', 'credentials', 'case-studies'],
        },
        confidence: 0.5,
        reasoning: 'Using default layout due to configuration error',
        sections: ['hero', 'features', 'social-proof', 'faq', 'cta-final'],
      };
    }

    const systemPrompt = `You are a strategic landing page consultant. Based on consultation data, you create focused strategy briefs that will guide landing page content generation.

LAYOUT INTELLIGENCE:
${layoutResult.reasoning}
Confidence: ${Math.round(layoutResult.confidence * 100)}%

SECTIONS TO GENERATE (in this exact order):
${layoutResult.sections.map((s, i) => `${i+1}. ${s}`).join('\n')}

LAYOUT RULES TO APPLY:
- Hero style: ${layoutResult.config.layout.heroStyle}
- Feature layout: ${layoutResult.config.layout.preferredFeatureLayout}
- Max features: ${layoutResult.config.layout.maxFeatureCards}
- Social proof style: ${layoutResult.config.layout.socialProofStyle}
- CTA placement: ${layoutResult.config.layout.ctaPlacement}
- Page density: ${layoutResult.config.layout.pageDensity}

CONTENT GUIDANCE:
- Tone keywords: ${layoutResult.config.contentGuidance.toneKeywords.slice(0, 5).join(', ')}
- Avoid words: ${layoutResult.config.contentGuidance.avoidWords.slice(0, 3).join(', ')}
- Primary CTA: ${layoutResult.config.contentGuidance.ctaText.primary[0]}
- Proof emphasis: ${layoutResult.config.contentGuidance.proofEmphasis}

TOP TRUST PRIORITIES:
${layoutResult.config.trustPriorities.slice(0, 3).map((t, i) => `${i+1}. ${t}`).join('\n')}

Your brief must be actionable, specific, and derived directly from the client's inputs. Never use generic placeholder text. If information is missing, acknowledge it and make strategic recommendations.

CRITICAL: Your output will be used as the LITERAL BLUEPRINT for page generation. Every section you recommend will be built exactly as specified.

Output the brief in clean markdown format with a STRUCTURED JSON block at the end for the page generator to parse.`;

    // Extract creative direction artifacts if available
    const artifacts = consultationData.artifacts || {};
    const hasSelectedHeadline = !!artifacts.selectedHeadline?.content;
    const hasSelectedCTA = !!artifacts.selectedCTA?.content;
    const alternativeHeadlines = artifacts.alternativeHeadlines || [];
    
    console.log('[generate-strategy-brief] Creative artifacts:', {
      hasSelectedHeadline,
      hasSelectedCTA,
      alternativeCount: alternativeHeadlines.length,
      userFeedback: artifacts.userFeedback?.substring(0, 50),
    });

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

${hasSelectedHeadline || hasSelectedCTA || alternativeHeadlines.length > 0 ? `
## Creative Direction (User-Selected)
${hasSelectedHeadline ? `- Selected Headline: "${artifacts.selectedHeadline.content}"` : ''}
${hasSelectedCTA ? `- Selected CTA: "${artifacts.selectedCTA.content}"` : ''}
${alternativeHeadlines.length > 0 ? `- Alternative Headlines Considered:
${alternativeHeadlines.slice(0, 3).map((h: any, i: number) => `  ${i + 1}. "${h.content}"`).join('\n')}` : ''}
${artifacts.userFeedback ? `- User's Reasoning: "${artifacts.userFeedback}"` : ''}
` : ''}

---

Generate a STRATEGY BRIEF with these sections:

1. **Executive Summary** (2-3 sentences on the strategic approach)

2. **Target Audience Profile** (Synthesize who we're speaking to - their role, frustrations, desires)

3. **Core Value Proposition** (One powerful statement that captures the unique value - this becomes the hero subheadline)

4. **Key Messaging Pillars** (3-4 main themes to emphasize - these become FEATURE CARDS)
   - For each pillar: Title, Benefit Description, Icon suggestion (Zap, Target, Shield, Award, TrendingUp, Users, CheckCircle, Clock, Heart, Star)

5. **Competitive Differentiation** (What sets this apart - use for problem/solution section)

6. **Proof Points** (Specific credibility elements to feature - numbers, years, achievements)
   - Extract specific numbers: "X+ clients", "Y years experience", etc.

7. **Tone & Voice** (How the copy should sound - professional, friendly, authoritative, etc.)

8. **Objection Handling** (3-5 common objections with rebuttals - these become FAQ items)

9. **Recommended Page Structure** (EXACT sections in order with purpose)
   List ONLY sections that make sense for this business. Choose from:
   - hero: Opening with headline, subheadline, CTA
   - stats-bar: Key numbers/proof points (only if we have real stats)
   - problem-solution: Pain point → Our solution
   - features: Service/benefit cards from messaging pillars
   - how-it-works: Step-by-step process (only if process is defined)
   - social-proof: Testimonial + trust signals (only if we have real testimonials)
   - faq: Address objections
   - final-cta: Closing call to action

10. **Headline Recommendations** (3 options for the main headline, derived from the value prop)
    - Option A (Direct benefit)
    - Option B (Problem-focused)
    - Option C (Outcome-focused)
${hasSelectedHeadline ? `
    IMPORTANT: The user has already selected their preferred headline direction: "${artifacts.selectedHeadline.content}"
    Use this as Option A and create 2 variations that maintain the same strategic angle.
` : ''}

---

After the markdown brief, include a JSON block that the page generator will parse directly:

\`\`\`json
{
  "headlines": {
    "optionA": "Direct benefit headline",
    "optionB": "Problem-focused headline", 
    "optionC": "Outcome-focused headline"
  },
  "subheadline": "Core value proposition as 1-2 sentence subheadline",
  "messagingPillars": [
    {
      "title": "Pillar title",
      "description": "Benefit-focused description (1 sentence)",
      "icon": "IconName"
    }
  ],
  "proofPoints": {
    "clientCount": "X+ clients" or null,
    "yearsInBusiness": "Y years" or null,
    "achievements": "Achievement text" or null,
    "otherStats": ["Additional stat 1", "Additional stat 2"]
  },
  "problemStatement": "2 sentences describing the pain/frustration",
  "solutionStatement": "2-3 sentences describing how we solve it",
  "tone": "One word: professional | friendly | authoritative | warm | confident",
  "objections": [
    {
      "question": "Common objection as question",
      "answer": "Rebuttal/answer"
    }
  ],
  "pageStructure": ["hero", "stats-bar", "problem-solution", "features", "faq", "final-cta"],
  "processSteps": [
    {
      "step": 1,
      "title": "Step title",
      "description": "What happens in this step"
    }
  ] or null,
  "testimonials": [
    {
      "quote": "Actual testimonial text or [Testimonial will be added]",
      "author": "Real name or [Client Name]",
      "title": "Role/Company or [Their Role]"
    }
  ],
  "ctaText": "CTA button text",
  "layoutIntelligence": {
    "heroStyle": "${layoutResult.config.layout.heroStyle}",
    "featureLayout": "${layoutResult.config.layout.preferredFeatureLayout}",
    "socialProofStyle": "${layoutResult.config.layout.socialProofStyle}",
    "pageDensity": "${layoutResult.config.layout.pageDensity}",
    "recommendedSections": ${JSON.stringify(layoutResult.sections)},
    "confidence": ${layoutResult.confidence}
  }
}
\`\`\`

Be specific. No generic advice. Everything should tie back to the actual consultation data provided.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-strategy-brief] AI Gateway error:', errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again.');
      }
      if (response.status === 402) {
        throw new Error('AI credits depleted. Please add credits.');
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const result = await response.json();
    const strategyBrief = result.choices?.[0]?.message?.content || '';

    console.log('[generate-strategy-brief] Brief generated successfully');

    // Extract the structured JSON from the brief
    let structuredBrief = null;
    const jsonMatch = strategyBrief.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        structuredBrief = JSON.parse(jsonMatch[1]);
        console.log('[generate-strategy-brief] Extracted structured brief');
      } catch (e) {
        console.warn('[generate-strategy-brief] Could not parse structured JSON from brief');
      }
    }

    return new Response(JSON.stringify({
      success: true,
      strategyBrief,
      structuredBrief,
      layoutIntelligence: {
        reasoning: layoutResult.reasoning,
        confidence: layoutResult.confidence,
        sections: layoutResult.sections,
        config: {
          name: layoutResult.config.name,
          heroStyle: layoutResult.config.layout.heroStyle,
          featureLayout: layoutResult.config.layout.preferredFeatureLayout,
          socialProofStyle: layoutResult.config.layout.socialProofStyle,
          pageDensity: layoutResult.config.layout.pageDensity,
        }
      }
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
