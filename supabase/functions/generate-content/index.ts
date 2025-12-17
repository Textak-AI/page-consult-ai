import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.30.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Request validation
const ConsultationDataSchema = z.object({
  industry: z.string().optional(),
  serviceType: z.string().optional(),
  goal: z.string().optional(),
  targetAudience: z.string().optional(),
  challenge: z.string().optional(),
  uniqueValue: z.string().optional(),
  offer: z.string().optional(),
});

const PersonaContextSchema = z.object({
  name: z.string(),
  primaryPain: z.string(),
  primaryDesire: z.string(),
  keyObjections: z.array(z.string()),
  languagePatterns: z.array(z.string()),
  emotionalTriggers: z.array(z.string()),
  demographics: z.record(z.string()).optional(),
  psychographics: z.record(z.any()).optional(),
});

const MarketContextSchema = z.object({
  topPainPoints: z.array(z.string()),
  keyStatistics: z.array(z.string()),
  competitorGaps: z.array(z.string()),
  audienceLanguage: z.array(z.string()),
});

const RequestSchema = z.object({
  action: z.enum(['generate_content', 'synthesize_persona', 'regenerate_section']),
  consultationData: ConsultationDataSchema.optional(),
  intelligenceContext: z.object({
    persona: PersonaContextSchema.partial(),
    market: MarketContextSchema.partial(),
  }).optional().nullable(),
  inputs: z.any().optional(),
  marketResearch: z.any().optional(),
  sectionType: z.string().optional(),
  currentContent: z.any().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      console.error('❌ Validation error:', parsed.error);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, consultationData, intelligenceContext, inputs, marketResearch, sectionType, currentContent } = parsed.data;
    
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    if (action === 'synthesize_persona') {
      return await handlePersonaSynthesis(anthropic, inputs, marketResearch, corsHeaders);
    }

    if (action === 'generate_content') {
      return await handleContentGeneration(anthropic, consultationData, intelligenceContext, corsHeaders);
    }

    if (action === 'regenerate_section') {
      return await handleSectionRegeneration(anthropic, sectionType!, consultationData, intelligenceContext, currentContent, corsHeaders);
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Generate content error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Synthesize persona from market research
 */
async function handlePersonaSynthesis(
  anthropic: Anthropic,
  inputs: any,
  marketResearch: any,
  corsHeaders: Record<string, string>
) {
  console.log('🧠 Synthesizing persona from research');

  const systemPrompt = `You are an expert customer persona analyst. Your job is to synthesize raw market research into a detailed, actionable customer persona.

Focus on:
1. Creating a vivid, named persona archetype (e.g., "The Overwhelmed Homeowner", "The Skeptical Executive")
2. Extracting specific pain points with intensity levels
3. Identifying desires and their emotional benefits
4. Understanding objections and how to counter them
5. Mapping their buying journey

Be specific and actionable. Every insight should inform marketing copy.`;

  const userPrompt = `Based on this market research, create a detailed customer persona:

TARGET AUDIENCE: ${inputs?.targetAudience || 'Not specified'}
INDUSTRY: ${inputs?.industry || 'Not specified'}
SERVICE: ${inputs?.serviceType || 'Not specified'}

MARKET RESEARCH DATA:
${JSON.stringify(marketResearch, null, 2)}

Create a comprehensive persona with:
1. A memorable archetype name
2. Demographics (age, income, location, occupation)
3. Psychographics (values, fears, aspirations, decision style)
4. Language patterns they use when describing their problems
5. 3-5 specific pain points with intensity (critical/high/moderate) and triggers
6. 3-5 desires with priority (must_have/nice_to_have/aspirational)
7. 3-5 common objections with counter-arguments
8. Buying journey stages with questions at each stage

Return ONLY valid JSON in this exact format:
{
  "name": "Archetype Name",
  "demographics": {
    "primaryAge": "35-50",
    "income": "$75,000-$150,000",
    "location": "Suburban areas",
    "occupation": "Professional/Manager",
    "familyStatus": "Married with children"
  },
  "psychographics": {
    "values": ["reliability", "family", "quality"],
    "fears": ["making wrong decision", "wasting money"],
    "aspirations": ["peace of mind", "expert solution"],
    "decisionStyle": "Research-driven, seeks recommendations",
    "trustSignals": ["reviews", "referrals", "credentials"]
  },
  "languagePatterns": ["I need someone who...", "I'm looking for..."],
  "painPoints": [
    {
      "pain": "Specific pain point",
      "intensity": "critical",
      "trigger": "What triggers this pain",
      "languageUsed": ["How they express it"]
    }
  ],
  "desires": [
    {
      "desire": "What they want",
      "priority": "must_have",
      "emotionalBenefit": "How it makes them feel"
    }
  ],
  "objections": [
    {
      "objection": "Common objection",
      "likelihood": "common",
      "counterArgument": "How to address it"
    }
  ],
  "buyingJourney": [
    {
      "stage": "awareness",
      "questions": ["What questions they ask"],
      "concerns": ["What concerns they have"],
      "triggers": ["What triggers this stage"]
    }
  ]
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const persona = parseJSON(content.text);
    
    console.log('✅ Persona synthesized:', persona.name);

    return new Response(
      JSON.stringify({ success: true, persona }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Persona synthesis error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Synthesis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Generate content with intelligence context
 */
async function handleContentGeneration(
  anthropic: Anthropic,
  consultationData: any,
  intelligenceContext: any,
  corsHeaders: Record<string, string>
) {
  console.log('✍️ Generating content with intelligence');
  console.log('Intelligence available:', !!intelligenceContext);

  let systemPrompt = `You are an expert landing page copywriter who creates high-converting content.`;
  
  // Enhance system prompt with intelligence if available
  if (intelligenceContext?.persona) {
    const { persona, market } = intelligenceContext;
    
    systemPrompt = `You are an expert landing page copywriter creating content for: "${persona.name}"

═══════════════════════════════════════════════════════════
PERSONA INTELLIGENCE
═══════════════════════════════════════════════════════════

PRIMARY PAIN: ${persona.primaryPain}
PRIMARY DESIRE: ${persona.primaryDesire}

KEY OBJECTIONS TO ADDRESS:
${persona.keyObjections.map((o: string) => `• ${o}`).join('\n')}

LANGUAGE PATTERNS THEY USE:
${persona.languagePatterns.map((l: string) => `• "${l}"`).join('\n')}

EMOTIONAL TRIGGERS:
${persona.emotionalTriggers.map((t: string) => `• ${t}`).join('\n')}

═══════════════════════════════════════════════════════════
MARKET INTELLIGENCE
═══════════════════════════════════════════════════════════

TOP PAIN POINTS IN MARKET:
${market.topPainPoints.map((p: string) => `• ${p}`).join('\n')}

KEY STATISTICS (use sparingly, only if highly relevant):
${market.keyStatistics.map((s: string) => `• ${s}`).join('\n')}

COMPETITOR GAPS (opportunities to differentiate):
${market.competitorGaps.map((g: string) => `• ${g}`).join('\n')}

═══════════════════════════════════════════════════════════
CONTENT GENERATION RULES
═══════════════════════════════════════════════════════════

1. HEADLINE: Address the primary pain point using their language patterns
2. SUBHEADLINE: Promise the primary desire with emotional benefit
3. FEATURES: Solve the top pain points and address objections
4. PROBLEM STATEMENT: Use their exact language to describe the pain
5. SOLUTION: Position around competitor gaps and emotional triggers
6. CTA: Remove friction around the most common objection

CRITICAL:
• Use ONLY user-provided credentials (no fabrication)
• Mirror their language patterns naturally
• Address objections proactively in copy
• Focus on emotional benefits over features`;
  }

  const userPrompt = buildUserPrompt(consultationData);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const generated = parseJSON(content.text);
    
    console.log('✅ Content generated:', {
      headline: generated.headline?.substring(0, 50),
      features: generated.features?.length
    });

    return new Response(
      JSON.stringify({ success: true, content: generated }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Content generation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Build user prompt from consultation data
 */
function buildUserPrompt(consultationData: any): string {
  return `Generate landing page content for this consultation:

CONSULTATION DATA:
- Industry: ${consultationData?.industry || 'Not specified'}
- Service Type: ${consultationData?.serviceType || 'Not specified'}
- Goal: ${consultationData?.goal || 'Not specified'}
- Target Audience: ${consultationData?.targetAudience || 'Not specified'}
- Challenge/Problem: ${consultationData?.challenge || 'Not specified'}
- Unique Value: ${consultationData?.uniqueValue || 'Not specified'}
- Offer: ${consultationData?.offer || 'Not specified'}

INSTRUCTIONS:
1. Create compelling, conversion-focused copy
2. Use industry-appropriate language and tone
3. Address the audience's pain points directly
4. Include ONLY verifiable credentials from consultation (no fabrication)
5. Generate exactly 5 relevant features
6. Create a clear, benefit-driven CTA

Return ONLY valid JSON in this exact format:
{
  "headline": "Compelling headline addressing primary pain",
  "subheadline": "Supporting statement with emotional benefit",
  "features": [
    {"title": "Feature 1", "description": "Benefit-focused description", "icon": "✓"},
    {"title": "Feature 2", "description": "Benefit-focused description", "icon": "✓"},
    {"title": "Feature 3", "description": "Benefit-focused description", "icon": "✓"},
    {"title": "Feature 4", "description": "Benefit-focused description", "icon": "✓"},
    {"title": "Feature 5", "description": "Benefit-focused description", "icon": "✓"}
  ],
  "problemStatement": "Problem as a question they ask themselves",
  "solutionStatement": "Solution with clear benefits",
  "socialProof": "Professional credential statement (only if provided)",
  "ctaText": "Action-oriented CTA",
  "sections": ["hero", "features", "problem_solution", "final_cta"],
  "images": {
    "hero": "Unsplash search query for hero image",
    "gallery": [],
    "features": "Background image search query",
    "background": "Pattern/texture search query"
  }
}`;
}

/**
 * Parse JSON from Claude response
 */
function parseJSON(text: string): any {
  let jsonText = text.trim();
  
  // Remove markdown code blocks if present
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '');
  }
  
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    // Try to extract JSON from the text
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse JSON response');
  }
}

/**
 * Handle section-specific regeneration
 */
async function handleSectionRegeneration(
  anthropic: Anthropic,
  sectionType: string,
  consultationData: any,
  intelligenceContext: any,
  currentContent: any,
  corsHeaders: Record<string, string>
) {
  console.log('🔄 Regenerating section:', sectionType);

  // Section-specific prompts
  const sectionPrompts: Record<string, string> = {
    'hero': `Generate a NEW compelling headline and subheadline for the hero section.
Return ONLY valid JSON: { "headline": "...", "subheadline": "...", "ctaText": "..." }`,
    
    'features': `Generate 5 NEW benefit-focused features.
Return ONLY valid JSON: { "features": [{ "title": "...", "description": "...", "icon": "star" }, ...] }`,
    
    'problem-solution': `Generate a NEW problem statement and solution.
Return ONLY valid JSON: { "problem": "...", "solution": "..." }`,
    
    'social-proof': `Generate NEW social proof content.
Return ONLY valid JSON: { "stats": [{ "label": "...", "value": "..." }] }`,
    
    'final-cta': `Generate a NEW call-to-action section.
Return ONLY valid JSON: { "headline": "...", "ctaText": "..." }`,
    
    'photo-gallery': `Generate a NEW gallery title.
Return ONLY valid JSON: { "title": "..." }`,
  };
  
  const sectionPrompt = sectionPrompts[sectionType] || 
    `Regenerate content for the ${sectionType} section. Return appropriate JSON only.`;
  
  // Build context from intelligence if available
  let contextInfo = '';
  if (intelligenceContext?.persona) {
    contextInfo = `
TARGET PERSONA: ${intelligenceContext.persona.name || 'Target Customer'}
Primary Pain: ${intelligenceContext.persona.primaryPain || 'Not specified'}
Primary Desire: ${intelligenceContext.persona.primaryDesire || 'Not specified'}
Key Objections: ${(intelligenceContext.persona.keyObjections || []).join(', ') || 'None specified'}
Language Patterns: ${(intelligenceContext.persona.languagePatterns || []).slice(0, 5).join(', ') || 'Standard professional'}
`;
  }
  
  const systemPrompt = `You are an expert landing page copywriter specializing in high-converting copy.
Generate fresh, compelling content for a ${sectionType.replace(/-/g, ' ')} section.

BUSINESS CONTEXT:
Industry: ${consultationData?.industry || 'General'}
Target Audience: ${consultationData?.target_audience || consultationData?.targetAudience || 'General audience'}
Service/Product: ${consultationData?.service_type || consultationData?.serviceType || consultationData?.challenge || 'Not specified'}
Unique Value: ${consultationData?.unique_value || consultationData?.uniqueValue || 'Quality service'}
Goal: ${consultationData?.goal || 'Generate leads'}
${contextInfo}

CRITICAL RULES:
1. Write benefit-focused copy, not feature-focused
2. Use specific numbers and outcomes when possible
3. Mirror the target audience's language patterns
4. Address their primary pain point directly
5. Create something COMPLETELY DIFFERENT from the current content
6. Return ONLY valid JSON, no markdown, no explanation

CURRENT CONTENT (for reference - DO NOT copy or closely paraphrase):
${JSON.stringify(currentContent || {}, null, 2)}

${sectionPrompt}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ 
        role: 'user', 
        content: 'Generate completely fresh, different content for this section. Return only JSON.' 
      }],
      system: systemPrompt,
    });
    
    const textContent = response.content.find((c: any) => c.type === 'text');
    const rawText = (textContent as any)?.text || '{}';
    
    console.log('📝 Raw section response:', rawText.substring(0, 200));
    
    // Extract JSON from response (handle potential markdown wrapping)
    let content = {};
    try {
      // Try to find JSON in the response
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Return error if we can't parse
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to parse generated content',
          raw: rawText.substring(0, 500)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('✅ Parsed section content:', content);
    
    return new Response(
      JSON.stringify({ success: true, content, sectionType }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ Section regeneration error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
