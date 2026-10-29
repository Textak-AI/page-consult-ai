import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';
import { getLayoutRecommendation, consultationToIntelligence } from '../_shared/industryLayouts/index.ts';
import { COPY_REGISTER_RULES, PROVENANCE_RULES, logRegisterViolations, logProvenanceViolations } from "../_shared/copyRegister.ts";

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

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
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
          ctaStyle: string;
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
      // Log raw input for debugging
      console.log('[generate-strategy-brief] Raw industry value:', consultationData.industry);
      console.log('[generate-strategy-brief] Raw idealClient:', consultationData.idealClient?.substring(0, 100));
      console.log('[generate-strategy-brief] Raw mainOffer:', consultationData.mainOffer?.substring(0, 100));
      
      const intelligence = consultationToIntelligence(consultationData);
      
      // Log extracted intelligence
      console.log('[generate-strategy-brief] 🔍 Intelligence extracted:', {
        industry: intelligence.industry,
        isLocal: intelligence.isLocal,
        serviceArea: intelligence.serviceArea,
        audience: intelligence.audience?.substring(0, 50)
      });
      
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
            ctaStyle: (result.config.layout as any).ctaStyle || 'button',
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
      
      // Detailed logging for debugging
      console.log('🏗️ [Layout Intelligence] Result:', {
        configName: layoutResult.config.name,
        source: (result as any).source || 'unknown',
        archetype: (result as any).archetype || 'none',
        reasoning: layoutResult.reasoning
      });
      console.log('📊 [Confidence]', Math.round(layoutResult.confidence * 100) + '%');
      console.log('📋 [Sections]', layoutResult.sections);
      console.log('🎨 [Hero Style]', layoutResult.config.layout.heroStyle);
      console.log('📞 [CTA Style]', layoutResult.config.layout.ctaStyle);
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
            ctaStyle: 'button',
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

ZERO FABRICATION: Never invent testimonials, quotes, named people, job titles, companies, ratings, or statistics. Only use testimonials and numbers that appear verbatim in the client's inputs. If none were provided, return "testimonials": [] and leave proof stats empty.

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

    const campaignContextPrompt = buildCampaignContextPrompt(consultationData);
    
    const userPrompt = `Create a strategy brief for this landing page project:

${campaignContextPrompt}

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

3. **Core Value Proposition** (One plain, specific statement that captures the unique value - this becomes the hero subheadline)

4. **Key Messaging Pillars** (3-4 main themes to emphasize - these become FEATURE CARDS)
   - For each pillar: Title, Benefit Description, Icon suggestion (Zap, Target, Shield, Award, TrendingUp, Users, CheckCircle, Clock, Heart, Star)

5. **Competitive Differentiation** (What sets this apart - use for problem/solution section)

6. **Proof Points** (Specific credibility elements to feature - numbers, years, achievements)
   - Extract specific numbers: "X+ clients", "Y years experience", etc.

7. **Tone & Voice** (How the copy should sound - professional, friendly, authoritative, etc.)

8. **Objection Handling** (3-5 common objections with rebuttals - these become FAQ items)

9. **Recommended Page Structure** (USE EXACTLY THE SECTIONS BELOW)
   Based on layout intelligence, use THESE EXACT sections in this order:
   ${layoutResult.sections.map(s => `- ${s}`).join('\n   ')}
   
   Provide a brief purpose statement for each section in the list.

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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 8192,
        temperature: 0.7,
        system: `${systemPrompt}\n\n${COPY_REGISTER_RULES}\n\n${PROVENANCE_RULES}`,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-strategy-brief] Anthropic API error:', errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again.');
      }
      if (response.status === 402) {
        throw new Error('AI credits depleted. Please add credits.');
      }
      
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const result = await response.json();
    const strategyBrief = (result.content || [])
      .filter((block: { type: string; text?: string }) => block.type === 'text')
      .map((block: { text?: string }) => block.text || '')
      .join('');

    console.log('[generate-strategy-brief] Brief generated successfully');

    // Extract the structured JSON from the brief
    let structuredBrief = null;
    // Mirror src/lib/extractStructuredBrief.ts: prefer a ```json fence, fall
    // back to the first bare ``` fence so applyBriefGuards always runs on
    // anything the client could recover.
    const candidates: string[] = [];
    const jsonMatch = strategyBrief.match(/```json\s*([\s\S]*?)\s*```/i);
    if (jsonMatch) candidates.push(jsonMatch[1]);
    const bareMatch = strategyBrief.match(/```\s*\n([\s\S]*?)```/);
    if (bareMatch) candidates.push(bareMatch[1]);
    for (const candidate of candidates) {
      try {
        const parsed = JSON.parse(candidate.trim());
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          structuredBrief = parsed;
          console.log('[generate-strategy-brief] Extracted structured brief');
          break;
        }
      } catch (e) {
        // try next candidate
      }
    }
    if (!structuredBrief) {
      console.warn('[generate-strategy-brief] Could not parse structured JSON from brief');
    }

    if (structuredBrief && typeof structuredBrief === 'object') {
      applyBriefGuards(structuredBrief, consultationData);
      logRegisterViolations('generate-strategy-brief', structuredBrief);
    logProvenanceViolations('generate-strategy-brief', structuredBrief, JSON.stringify(consultationData));
    }

    return new Response(JSON.stringify({
      success: true,
      strategyBrief,
      structuredBrief,
      layoutIntelligence: {
        reasoning: layoutResult.reasoning,
        confidence: layoutResult.confidence,
        sections: layoutResult.sections,
        ctaStyle: layoutResult.config.layout.ctaStyle,
        config: {
          name: layoutResult.config.name,
          heroStyle: layoutResult.config.layout.heroStyle,
          ctaStyle: layoutResult.config.layout.ctaStyle,
          featureLayout: layoutResult.config.layout.preferredFeatureLayout,
          socialProofStyle: layoutResult.config.layout.socialProofStyle,
          pageDensity: layoutResult.config.layout.pageDensity,
          trustPriorities: layoutResult.config.trustPriorities,
        }
      },
      // Industry classification can be enhanced client-side with AI when keyword matching fails
      industryClassificationHint: {
        detectedFromKeyword: layoutResult.config.name !== 'default',
        suggestAIClassification: layoutResult.config.name === 'default',
        rawIndustry: consultationData.industry || 'Unknown'
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

function buildCampaignContextPrompt(data: any): string {
  if (!data.pagePurpose) return '';
  
  const purposeDirectives: Record<string, string> = {
    'outbound-campaign': `
## CAMPAIGN CONTEXT: OUTBOUND CAMPAIGN PAGE (cold traffic)
- Visitors did NOT ask for this — they received a cold email/LinkedIn message
- Lead with a pattern-interrupt headline that earns attention
- Establish relevance and credibility in the first 2 sentences
- Keep the page focused: 4-5 sections maximum
- CTA should be low-friction (assessment/consultation, not purchase)
- Proof should emphasize results relevant to the target segment
${data.campaignAudienceSegment ? `- Targeting: ${data.campaignAudienceSegment}` : ''}
${data.trafficSource ? `- Traffic source: ${data.trafficSource}` : ''}
- Do NOT build a comprehensive homepage — this is a focused conversion page`,

    'service-spotlight': `
## CAMPAIGN CONTEXT: SERVICE SPOTLIGHT PAGE
- Focus exclusively on: ${data.spotlightService || 'the featured service'}
- Do NOT spread across the full portfolio
- Go deeper on this one service: how it works, who it's for, specific results
- Use a full 6-8 section layout to thoroughly present the offering
- CTA should be specific to this service (demo, consultation, trial)`,

    'event-conference': `
## CAMPAIGN CONTEXT: CONFERENCE/EVENT PAGE
${data.campaignTrigger ? `- Event: ${data.campaignTrigger}` : ''}
${data.eventGoal ? `- Goal: ${data.eventGoal}` : ''}
- Reference the event by name in the headline or subheadline
- Create time-bound urgency ("See us at Booth #X" or "Limited meeting slots")
- Keep the page SHORT: 2-3 sections maximum
- CTA should match the event goal (book meeting, visit booth, register)
- Lead with what makes this company worth their time AT THIS EVENT`,

    'retargeting': `
## CAMPAIGN CONTEXT: RETARGETING PAGE (warm traffic)
- These visitors already know the company — skip the introduction
- Lead with the strongest offer or most compelling case study
- Keep it SHORT: 2-4 sections maximum
- CTA should be direct and specific (start trial, book call, buy now)
- Use proof to push past the final hesitation, not to build awareness`,

    'lead-magnet': `
## CAMPAIGN CONTEXT: LEAD MAGNET DOWNLOAD PAGE
${data.campaignTrigger ? `- Resource: ${data.campaignTrigger}` : ''}
- The exchange is clear: their email for valuable content
- Keep it SHORT: 2-3 sections maximum
- Headline should name the specific resource and its value
- Social proof should focus on authority (why trust this content)
- CTA is "Download" or "Get the Guide" — not a sales action`,

    'webinar-registration': `
## CAMPAIGN CONTEXT: WEBINAR/EVENT REGISTRATION PAGE
${data.campaignTrigger ? `- Topic: ${data.campaignTrigger}` : ''}
- Lead with what attendees will learn or gain
- Include speaker credentials as social proof
- Show the date, time, and duration prominently
- Create urgency with "limited spots" or "live only" language
- Keep it focused: 3-4 sections maximum
- CTA is "Register Now" or "Save Your Spot"`,

    'ab-test': `
## CAMPAIGN CONTEXT: A/B TEST VARIANT
- Generate messaging that takes a DIFFERENT ANGLE than typical positioning
- If the user's current site leads with features, try leading with outcomes
- If current messaging is professional/corporate, try a more direct/bold approach
- Match the same general page length and CTA as their existing page
- The goal is a meaningfully different approach to test against current`,

    'primary-site': `
## CAMPAIGN CONTEXT: PRIMARY WEB PRESENCE
- Build comprehensive: 6-8 sections covering the full story
- Include: hero, problem/solution, features, process, proof, FAQ, CTA
- This needs to serve multiple audience segments
- Balance depth with scanability
- Include navigation-worthy sections that cover the full business`,
  };
  
  console.log('🎯 [Intelligence] Campaign context detected:', data.pagePurpose);
  return purposeDirectives[data.pagePurpose] || '';
}

// ---------------------------------------------------------------------------
// Zero-fabrication guards: deterministic, applied after parse, before return.
// ---------------------------------------------------------------------------
function collectUserInputText(data: any): string {
  const parts: string[] = [];
  const walk = (v: unknown, depth: number) => {
    if (v == null || depth > 4) return;
    if (typeof v === 'string' || typeof v === 'number') { parts.push(String(v)); return; }
    if (Array.isArray(v)) { v.forEach((x) => walk(x, depth + 1)); return; }
    if (typeof v === 'object') Object.values(v as Record<string, unknown>).forEach((x) => walk(x, depth + 1));
  };
  walk(data, 0);
  return parts.join(' ');
}

function extractNumbers(text: string): string[] {
  return (text.match(/\d[\d,]*(?:\.\d+)?/g) || []).map((n) => n.replace(/,/g, ''));
}

function applyBriefGuards(brief: any, data: any): void {
  // 1. Testimonials: only the user's own text, verbatim.
  const userTestimonial = typeof data?.testimonialText === 'string' ? data.testimonialText.trim() : '';
  const modelCount = Array.isArray(brief.testimonials) ? brief.testimonials.length : 0;
  if (userTestimonial) {
    brief.testimonials = [{ quote: userTestimonial, author: null, title: null }];
    if (modelCount > 0) console.log('🛡️ [brief-guard] Removed fabricated testimonials — replaced model output with user-supplied testimonialText verbatim');
  } else {
    if (modelCount > 0) console.log(`🛡️ [brief-guard] Removed fabricated testimonials — ${modelCount} model-generated entr${modelCount === 1 ? 'y' : 'ies'}, no user testimonial supplied`);
    brief.testimonials = [];
  }

  // 2. proofPoints.otherStats: drop entries whose numbers aren't in user inputs.
  const pp = brief.proofPoints;
  if (pp && typeof pp === 'object' && Array.isArray(pp.otherStats)) {
    const userNumbers = new Set(extractNumbers(collectUserInputText(data)));
    pp.otherStats = pp.otherStats.filter((stat: unknown) => {
      if (typeof stat !== 'string') {
        console.log('🛡️ [brief-guard] Removed fabricated proofPoints.otherStats — non-string entry');
        return false;
      }
      const nums = extractNumbers(stat);
      const unknown = nums.filter((n) => !userNumbers.has(n));
      if (unknown.length > 0) {
        console.log(`🛡️ [brief-guard] Removed fabricated proofPoints.otherStats — "${stat.slice(0, 60)}" contains numbers not in user inputs: ${unknown.join(', ')}`);
        return false;
      }
      return true;
    });
  }
}
