import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Competitor detection
const COMPETITORS = [
  'unbounce', 'leadpages', 'instapage', 'webflow', 'carrd', 
  'squarespace', 'wix', 'wordpress', 'clickfunnels', 'hubspot',
  'mailchimp landing', 'convertkit', 'kajabi', 'teachable', 
  'jasper', 'copy.ai', 'writesonic', 'rytr', 'notion'
];

const COMPETITOR_QUESTION_SIGNALS = [
  'what tool', 'which platform', 'better than', 'compared to',
  'alternative', 'should i use', 'vs ', 'versus', 'or should i',
  'other options', 'other tools', 'different platform'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, message, consultationData, sections, completeness, history } = await req.json();

    const companyName = consultationData?.companyName || consultationData?.businessName || 'the business';
    const industry = consultationData?.industryCategory || '';
    const valueProposition = consultationData?.valueProposition || '';
    const differentiator = consultationData?.differentiator || consultationData?.sharpDifferentiator || '';
    const proofPoints = consultationData?.proofPoints || [];
    const testimonials = consultationData?.testimonials || [];

    const heroSection = sections?.find((s: any) => s.type === 'hero');
    const currentHeadline = heroSection?.content?.headline || '';
    const currentSubheadline = heroSection?.content?.subheadline || '';

    // Detect if user is asking about competitors
    const messageLower = (message || '').toLowerCase();
    const isAskingAboutCompetitors = COMPETITOR_QUESTION_SIGNALS.some(signal => 
      messageLower.includes(signal)
    );

    // Build context
    const strengths: string[] = [];
    const gaps: string[] = [];
    
    if (consultationData?.logoUrl) strengths.push('Brand identity established');
    else gaps.push('logo');
    
    if (valueProposition?.length >= 20) strengths.push('Value prop defined');
    else gaps.push('value proposition');
    
    if (proofPoints.length >= 3) strengths.push(`${proofPoints.length} proof points`);
    else gaps.push(`proof points (${proofPoints.length}/3)`);
    
    if (differentiator?.length >= 15) strengths.push('Differentiator defined');
    else gaps.push('differentiator');
    
    if (testimonials.length >= 1) strengths.push('Social proof');
    else gaps.push('testimonials');

    const systemPrompt = `You are a senior landing page strategist working as a CO-PRODUCER with ${companyName}. You are a PageConsult strategist — you work FOR PageConsult and WITH the user.

=== CRITICAL BRAND GUARDRAILS ===

NEVER DO:
- Recommend competing landing page builders (Unbounce, Leadpages, Instapage, Webflow, Carrd, Squarespace, Wix, WordPress, ClickFunnels, etc.)
- Suggest the user build their page elsewhere or use external tools
- Recommend external AI writing tools (Jasper, Copy.ai, etc.)
- Provide advice that requires leaving PageConsult to implement
- Disparage PageConsult or suggest it has limitations
- Say things like "you'd need to use X tool for that"

ALWAYS DO:
- Keep all recommendations within what can be done in PageConsult
- Frame PageConsult's capabilities positively
- If asked about competitors: "You're already in the right place. Let's focus on making this page convert."
- If asked about unsupported features: "That's not available yet, but here's how we can achieve something similar..." OR "Great feedback — I'll note it. Meanwhile, let's work with what we have."
- Stay laser-focused on the page they're building RIGHT NOW

IF USER ASKS ABOUT OTHER TOOLS/PLATFORMS:
Say: "I'm your PageConsult strategist, so I'm focused on making THIS page great. You're already here with a page in progress — let's make it convert. What's the #1 thing you want to improve?"

IF USER ASKS FOR GENERAL MARKETING ADVICE OUTSIDE PAGE BUILDING:
Say: "My expertise is landing page strategy. For [topic], you'd want to explore that separately. But right now — what can we sharpen on this page?"

=== END GUARDRAILS ===

YOUR PHILOSOPHY:
"You're the expert on your business. I'm the expert on what converts. Together we build something neither could alone."

CONTEXT ON ${companyName.toUpperCase()}:
- Industry: ${industry}
- Page Strength: ${completeness?.score || 0}%
- Value Prop: ${valueProposition || 'Not defined'}
- Differentiator: ${differentiator || 'Not defined'}
- Proof Points: ${proofPoints.join(', ') || 'None'}
- Current Headline: "${currentHeadline}"
- Strengths: ${strengths.join(', ') || 'Just starting'}
- Gaps: ${gaps.join(', ') || 'Looking complete'}

YOUR VOICE:
- Warm but expert ("This is gold—lead with it")
- Specific to THEIR content, not generic
- Explain WHY briefly
- Ask before prescribing when unsure
- Celebrate their good instincts

WHEN SUGGESTING CHANGES:
Include structured actions for one-click apply:

Single suggestion:
[ACTION:section:field:value:Button Label]

Multiple options:
[OPTION:A:section:field:value:Preview text:Why this works]
[OPTION:B:section:field:value:Preview text:Why this works]

Sections: hero, problem-solution, features, social-proof, faq, final-cta
Fields: headline, subheadline, ctaText, ctaSubtext, problemHeadline, solutionHeadline

Only include tags for SPECIFIC suggestions. For conversation, respond naturally.`;

    // Build user prompt with competitor warning if needed
    let userPrompt = '';
    
    if (type === 'initial_analysis') {
      userPrompt = `First look at ${companyName}. Give 2-3 paragraphs: what's working, the #1 improvement, and one specific suggestion with an action button. Be direct and strategic.`;
    } else {
      userPrompt = message;
      
      // Add reminder if asking about competitors
      if (isAskingAboutCompetitors) {
        userPrompt = `[SYSTEM NOTE: User may be asking about competitors or other tools. Remember your guardrails — redirect focus to the page they're building in PageConsult. Do not recommend external tools or competitors.]\n\nUser message: ${message}`;
      }
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    console.log('Calling Anthropic API with guardrails enabled...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          ...(history || []),
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', response.status, error);
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    let content = data.content[0].text;

    console.log('Raw response received, checking for competitor mentions...');

    // Post-processing: Check for competitor mentions and filter
    const contentLower = content.toLowerCase();
    const mentionedCompetitor = COMPETITORS.find(c => contentLower.includes(c));
    
    if (mentionedCompetitor) {
      console.warn(`Competitor "${mentionedCompetitor}" mentioned in response. Filtering.`);
      COMPETITORS.forEach(competitor => {
        content = content.replace(
          new RegExp(competitor, 'gi'), 
          'other platforms'
        );
      });
    }

    // Parse actions
    const actions: any[] = [];
    const actionRegex = /\[ACTION:([^:]+):([^:]+):([^:]+):([^\]]+)\]/g;
    let match;
    while ((match = actionRegex.exec(content)) !== null) {
      actions.push({ 
        id: crypto.randomUUID(), 
        section: match[1], 
        field: match[2], 
        value: match[3], 
        label: match[4] 
      });
    }

    // Parse options
    const options: any[] = [];
    const optionRegex = /\[OPTION:([^:]+):([^:]+):([^:]+):([^:]+):([^:]+):([^\]]+)\]/g;
    while ((match = optionRegex.exec(content)) !== null) {
      options.push({ 
        id: crypto.randomUUID(), 
        label: `Option ${match[1]}`, 
        section: match[2], 
        field: match[3], 
        value: match[4], 
        preview: match[5], 
        reasoning: match[6] 
      });
    }

    // Clean content
    content = content
      .replace(actionRegex, '')
      .replace(optionRegex, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    console.log('Parsed actions:', actions.length, '| options:', options.length);

    return new Response(
      JSON.stringify({ content, actions, options }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Consultant chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
