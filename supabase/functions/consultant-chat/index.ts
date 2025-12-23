import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, message, consultationData, sections, completeness, history } = await req.json();

    const companyName = consultationData?.companyName || consultationData?.businessName || 'the business';
    const industry = consultationData?.industryCategory || consultationData?.industry || 'business';
    const subindustry = consultationData?.industrySubcategory || '';
    const valueProposition = consultationData?.valueProposition || '';
    const differentiator = consultationData?.differentiator || consultationData?.sharpDifferentiator || '';
    const targetAudience = consultationData?.targetAudience || '';
    const proofPoints = consultationData?.proofPoints || [];
    const testimonials = consultationData?.testimonials || [];
    const pageGoal = consultationData?.pageGoal || 'generate leads';

    // Get current content
    const heroSection = sections?.find((s: any) => s.type === 'hero');
    const currentHeadline = heroSection?.content?.headline || '';
    const currentSubheadline = heroSection?.content?.subheadline || '';

    // What's working vs what's missing
    const strengths: string[] = [];
    const gaps: string[] = [];
    
    if (consultationData?.logoUrl) strengths.push('Brand identity established');
    else gaps.push('logo');
    
    if (valueProposition && valueProposition.length >= 20) strengths.push(`Clear value proposition: "${valueProposition.slice(0, 50)}..."`);
    else gaps.push('compelling value proposition');
    
    if (proofPoints.length >= 3) strengths.push(`${proofPoints.length} proof points (solid credibility)`);
    else gaps.push(`more proof points (${proofPoints.length}/3 minimum)`);
    
    if (differentiator && differentiator.length >= 15) strengths.push(`Defined differentiator: "${differentiator.slice(0, 40)}..."`);
    else gaps.push('unique differentiator');
    
    if (testimonials.length >= 1) strengths.push(`${testimonials.length} testimonial(s) for social proof`);
    else gaps.push('testimonials (huge trust builder)');

    const systemPrompt = `You are a senior landing page strategist working as a CO-PRODUCER with ${companyName}. This is a collaborative partnership, not an AI assistant relationship.

YOUR PHILOSOPHY:
"You're the expert on your business and customers. I'm the expert on what converts. Together, we'll build something neither could create alone."

THE DYNAMIC:
- They know their market, customers, and business intimately
- You know conversion psychology, positioning strategy, and copy craft
- Your role is to bring out THEIR expertise and frame it powerfully
- You propose, they decide. Always.
- When unsure about their context, ASK before prescribing

CONTEXT ON ${companyName.toUpperCase()}:
- Industry: ${industry}${subindustry ? ` (${subindustry})` : ''}
- Target Audience: ${targetAudience || 'Not yet defined'}
- Page Goal: ${pageGoal}
- Value Proposition: ${valueProposition || 'Not yet articulated'}
- Differentiator: ${differentiator || 'Not yet defined'}
- Proof Points: ${proofPoints.length > 0 ? proofPoints.slice(0, 3).join(' • ') : 'None yet'}
- Current Headline: "${currentHeadline || 'None'}"
- Current Subheadline: "${currentSubheadline || 'None'}"
- Page Strength: ${completeness?.score || 0}%

WHAT'S WORKING:
${strengths.length > 0 ? strengths.map(s => `• ${s}`).join('\n') : '• Just getting started'}

GAPS TO ADDRESS:
${gaps.length > 0 ? gaps.map(g => `• ${g}`).join('\n') : '• Looking complete!'}

YOUR VOICE:
- Warm but expert: "This is gold—let's lead with it"
- Specific, not generic: Reference THEIR content, not hypotheticals
- Strategic: Explain the WHY in one sentence
- Collaborative: "What do you think?" "Does this resonate with how your customers talk?"
- Encouraging: Celebrate good instincts, build on what's working

DO NOT:
- Sound like a generic chatbot ("I'd be happy to help!")
- Give vague advice ("Consider making it more compelling")
- Overwhelm with too many suggestions at once
- Prescribe without context ("You should definitely...")
- Ignore what they've already built

WHEN SUGGESTING CHANGES:
Include structured actions they can apply with one click.

For a single suggestion:
[ACTION:section:field:value:Button Label]

For multiple options (when appropriate):
[OPTION:A:section:field:value:Brief preview:Why this works]
[OPTION:B:section:field:value:Brief preview:Why this works]  
[OPTION:C:section:field:value:Brief preview:Why this works]

Sections/fields available:
- hero: headline, subheadline, ctaText, ctaSubtext
- problem-solution: problemHeadline, solutionHeadline, problemDescription
- features: headline, subheadline
- social-proof: headline
- faq: headline
- final-cta: headline, subheadline, ctaText

IMPORTANT: Only include action/option tags when you're making a SPECIFIC suggestion. For general conversation or questions, just respond naturally.`;

    let userPrompt = '';
    
    if (type === 'initial_analysis') {
      userPrompt = `I just opened this conversation. Give me your honest take on the ${companyName} page so far. Keep it to 2-3 paragraphs max:

1. Start with something specific that's working (if anything is)
2. What's the ONE thing that would make the biggest difference right now?
3. Offer ONE specific suggestion with an action button

Be direct, strategic, and warm. End with an open question that invites collaboration.`;
    } else {
      userPrompt = message;
    }

    const conversationHistory = history?.map((m: any) => ({
      role: m.role,
      content: m.content
    })) || [];

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    console.log('Calling Anthropic API for consultant chat...');
    
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
          ...conversationHistory,
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

    console.log('Raw response:', content);

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

    console.log('Parsed actions:', actions.length);
    console.log('Parsed options:', options.length);

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
