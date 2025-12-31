import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.24.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateProspectPageRequest {
  sourceDemoSessionId?: string;
  sourceLandingPageId?: string;
  prospectName: string;
  prospectCompany: string;
  prospectEmail?: string;
  prospectTitle?: string;
  prospectIndustry?: string;
  prospectCompanySize?: string;
  dealStage: 'cold' | 'warm' | 'proposal' | 'negotiation';
  knownPainPoints?: string[];
  competitiveSituation?: string;
  specificUseCase?: string;
  customInstructions?: string;
}

function generateSlug(company: string, name: string): string {
  const sanitize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 20);

  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${sanitize(company)}-${sanitize(name.split(' ')[0])}-${randomSuffix}`;
}

function buildPersonalizationPrompt(data: {
  sourceBrief: any;
  prospectName: string;
  prospectCompany: string;
  prospectTitle?: string;
  prospectIndustry?: string;
  prospectCompanySize?: string;
  dealStage: string;
  knownPainPoints?: string[];
  competitiveSituation?: string;
  specificUseCase?: string;
  customInstructions?: string;
}): string {
  const {
    sourceBrief,
    prospectName,
    prospectCompany,
    prospectTitle,
    prospectIndustry,
    prospectCompanySize,
    dealStage,
    knownPainPoints,
    competitiveSituation,
    specificUseCase,
    customInstructions,
  } = data;

  const ctaByStage: Record<string, string[]> = {
    cold: ["See if there's a fit", 'Learn more', 'Get the details'],
    warm: ['Schedule a call', 'Book a demo', "Let's talk"],
    proposal: ['Review your proposal', 'See your custom plan', 'Get started'],
    negotiation: ['Lock in your rate', 'Finalize today', 'Secure your spot'],
  };

  return `You are personalizing a landing page for a specific prospect.

# SOURCE BRIEF
${JSON.stringify(sourceBrief, null, 2)}

# PROSPECT INFORMATION
- Name: ${prospectName}
- Company: ${prospectCompany}
${prospectTitle ? `- Title: ${prospectTitle}` : ''}
${prospectIndustry ? `- Industry: ${prospectIndustry}` : ''}
${prospectCompanySize ? `- Company Size: ${prospectCompanySize}` : ''}

# TARGETING CONTEXT
- Deal Stage: ${dealStage}
${knownPainPoints?.length ? `- Known Pain Points: ${knownPainPoints.join(', ')}` : ''}
${competitiveSituation ? `- Competitive Situation: ${competitiveSituation}` : ''}
${specificUseCase ? `- Specific Use Case: ${specificUseCase}` : ''}
${customInstructions ? `- Custom Instructions: ${customInstructions}` : ''}

# PERSONALIZATION RULES
1. Headline: Weave the company name naturally into the headline. Make it feel like this page was built specifically for them.
2. Proof Points: If the prospect's industry is known, prioritize proof points, case studies, or testimonials from that industry. If not, use the strongest universal proof.
3. CTA Text: Adjust based on deal stage:
   - Cold: "${ctaByStage.cold.join('" or "')}"
   - Warm: "${ctaByStage.warm.join('" or "')}"
   - Proposal: "${ctaByStage.proposal.join('" or "')}"
   - Negotiation: "${ctaByStage.negotiation.join('" or "')}"
4. Pain Points: If known pain points are provided, lead with those. Restructure the problem/solution section to address their specific challenges.
5. Competitive Situation: If they're using a competitor, subtly address switching concerns and emphasize differentiators.
6. Tone: Match the formality to the company size and industry. Enterprise = more formal. Startup = more casual.

# OUTPUT FORMAT
Return a JSON object with this structure:
{
  "headline": "Personalized headline for ${prospectCompany}",
  "subheadline": "Supporting subheadline",
  "sections": [
    {
      "type": "hero",
      "content": { "headline": "...", "subheadline": "...", "cta": "..." }
    },
    {
      "type": "problem-solution",
      "content": { "problem": "...", "solution": "..." }
    },
    {
      "type": "social-proof",
      "content": { "testimonials": [...] }
    },
    {
      "type": "features",
      "content": { "features": [...] }
    },
    {
      "type": "cta",
      "content": { "headline": "...", "cta": "..." }
    }
  ],
  "brief": { ... }
}

Make the personalization feel natural and thoughtful, not forced. The goal is for ${prospectName} to feel like this page was created specifically for ${prospectCompany}.

IMPORTANT: Return ONLY valid JSON, no markdown or other formatting.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[generate-prospect-page] Starting...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[generate-prospect-page] No auth header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('[generate-prospect-page] Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[generate-prospect-page] User authenticated:', user.id);

    const body: GenerateProspectPageRequest = await req.json();
    const {
      sourceDemoSessionId,
      sourceLandingPageId,
      prospectName,
      prospectCompany,
      prospectEmail,
      prospectTitle,
      prospectIndustry,
      prospectCompanySize,
      dealStage,
      knownPainPoints,
      competitiveSituation,
      specificUseCase,
      customInstructions,
    } = body;

    // Validate required fields
    if (!prospectName || !prospectCompany) {
      return new Response(
        JSON.stringify({ error: 'Prospect name and company are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!sourceDemoSessionId && !sourceLandingPageId) {
      return new Response(
        JSON.stringify({ error: 'Source demo session or landing page is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch source brief
    let sourceBrief: any = null;

    if (sourceDemoSessionId) {
      console.log('[generate-prospect-page] Fetching demo session:', sourceDemoSessionId);
      const { data, error } = await supabase
        .from('demo_sessions')
        .select('extracted_intelligence, market_research, brand_assets')
        .eq('id', sourceDemoSessionId)
        .maybeSingle();

      if (error) {
        console.error('[generate-prospect-page] Error fetching demo session:', error);
      }

      if (data) {
        sourceBrief = {
          ...data.extracted_intelligence,
          ...data.market_research,
          brandAssets: data.brand_assets,
        };
      }
    } else if (sourceLandingPageId) {
      console.log('[generate-prospect-page] Fetching landing page:', sourceLandingPageId);
      const { data, error } = await supabase
        .from('landing_pages')
        .select('consultation_data, website_intelligence')
        .eq('id', sourceLandingPageId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[generate-prospect-page] Error fetching landing page:', error);
      }

      if (data) {
        sourceBrief = data.consultation_data || data.website_intelligence;
      }
    }

    if (!sourceBrief) {
      console.error('[generate-prospect-page] Source brief not found');
      return new Response(
        JSON.stringify({ error: 'Source brief not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[generate-prospect-page] Source brief found, generating personalized content...');

    // Generate personalized content using Claude
    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
    });

    const personalizationPrompt = buildPersonalizationPrompt({
      sourceBrief,
      prospectName,
      prospectCompany,
      prospectTitle,
      prospectIndustry,
      prospectCompanySize,
      dealStage,
      knownPainPoints,
      competitiveSituation,
      specificUseCase,
      customInstructions,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: personalizationPrompt }],
    });

    let personalizedContent: any = {};
    try {
      const textContent = response.content.find((c) => c.type === 'text');
      if (textContent && textContent.type === 'text') {
        personalizedContent = JSON.parse(textContent.text);
      }
    } catch (parseError) {
      console.error('[generate-prospect-page] Error parsing AI response:', parseError);
      // Use fallback content
      personalizedContent = {
        headline: `How ${prospectCompany} Can Transform Their Business`,
        subheadline: `Personalized solutions for ${prospectName}`,
        sections: [],
        brief: sourceBrief,
      };
    }

    console.log('[generate-prospect-page] Personalized content generated');

    // Generate unique slug
    const slug = generateSlug(prospectCompany, prospectName);

    // Insert prospect page
    const { data: prospectPage, error: insertError } = await supabase
      .from('prospect_pages')
      .insert({
        user_id: user.id,
        source_demo_session_id: sourceDemoSessionId || null,
        source_landing_page_id: sourceLandingPageId || null,
        prospect_name: prospectName,
        prospect_company: prospectCompany,
        prospect_email: prospectEmail,
        prospect_title: prospectTitle,
        prospect_industry: prospectIndustry,
        prospect_company_size: prospectCompanySize,
        deal_stage: dealStage,
        known_pain_points: knownPainPoints,
        competitive_situation: competitiveSituation,
        specific_use_case: specificUseCase,
        custom_instructions: customInstructions,
        personalized_headline: personalizedContent.headline,
        personalized_subheadline: personalizedContent.subheadline,
        personalized_sections: personalizedContent.sections,
        personalized_brief: personalizedContent.brief,
        unique_slug: slug,
        status: 'draft',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[generate-prospect-page] Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create prospect page' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[generate-prospect-page] Prospect page created:', prospectPage.id);

    const publicUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}/p/${prospectPage.unique_slug}`;

    return new Response(
      JSON.stringify({
        success: true,
        prospectPage: {
          id: prospectPage.id,
          slug: prospectPage.unique_slug,
          url: publicUrl,
          status: prospectPage.status,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[generate-prospect-page] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
