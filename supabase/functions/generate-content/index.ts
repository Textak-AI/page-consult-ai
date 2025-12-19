import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.30.1";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

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
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

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
    const origin = req.headers.get('Origin');
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
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
  console.log('Intelligence context:', JSON.stringify(intelligenceContext, null, 2));

  let systemPrompt = `You are an expert landing page copywriter who creates high-converting content.`;
  let statisticsToInclude: any[] = [];
  
  // Enhance system prompt with intelligence if available
  if (intelligenceContext?.persona || intelligenceContext?.market) {
    const persona = intelligenceContext.persona || {};
    const market = intelligenceContext.market || {};
    
    // Extract real statistics to include
    if (market.keyStatistics?.length > 0) {
      statisticsToInclude = market.keyStatistics.slice(0, 3).map((s: any) => {
        if (typeof s === 'string') {
          // Parse statistic string to extract value
          const numMatch = s.match(/(\d[\d,]*(?:\.\d+)?%?|\$[\d,]+(?:\.\d+)?[BMK]?)/);
          return {
            value: numMatch ? numMatch[1] : s.split(' ')[0],
            label: s.replace(/^\d[\d,]*(?:\.\d+)?%?\s*/, '').substring(0, 50),
            source: 'Industry Research'
          };
        }
        return {
          value: s.claim?.match(/(\d[\d,]*(?:\.\d+)?%?|\$[\d,]+(?:\.\d+)?[BMK]?)/)?.[1] || s.claim?.split(' ')[0] || 'N/A',
          label: s.claim?.replace(/^\d[\d,]*(?:\.\d+)?%?\s*/, '').substring(0, 50) || 'Industry statistic',
          source: s.source || 'Industry Research'
        };
      });
    }
    
    systemPrompt = `You are an expert landing page copywriter creating content for: "${persona.name || 'Target Customer'}"

═══════════════════════════════════════════════════════════
PERSONA INTELLIGENCE
═══════════════════════════════════════════════════════════

PRIMARY PAIN: ${persona.primaryPain || 'Finding reliable service'}
PRIMARY DESIRE: ${persona.primaryDesire || 'Peace of mind and quality results'}

KEY OBJECTIONS TO ADDRESS:
${(persona.keyObjections || ['Is this worth the cost?', 'Can I trust them?']).map((o: string) => `• ${o}`).join('\n')}

LANGUAGE PATTERNS THEY USE (mirror these in copy):
${(persona.languagePatterns || ['I need someone reliable', 'I want quality']).map((l: string) => `• "${l}"`).join('\n')}

EMOTIONAL TRIGGERS:
${(persona.emotionalTriggers || ['trust', 'reliability', 'professionalism']).map((t: string) => `• ${t}`).join('\n')}

═══════════════════════════════════════════════════════════
MARKET INTELLIGENCE
═══════════════════════════════════════════════════════════

TOP PAIN POINTS IN MARKET:
${(market.topPainPoints || []).slice(0, 5).map((p: string) => `• ${p}`).join('\n') || '• No specific pain points provided'}

REAL STATISTICS TO USE IN CONTENT (include 2-3 in the stats section):
${(market.keyStatistics || []).slice(0, 5).map((s: any) => {
  if (typeof s === 'string') return `• ${s}`;
  return `• ${s.claim} (Source: ${s.source || 'Industry Research'})`;
}).join('\n') || '• No statistics available'}

COMPETITOR GAPS (opportunities to differentiate):
${(market.competitorGaps || []).slice(0, 3).map((g: string) => `• ${g}`).join('\n') || '• No competitor gaps identified'}

═══════════════════════════════════════════════════════════
CONTENT GENERATION RULES
═══════════════════════════════════════════════════════════

1. HEADLINE: Address the primary pain point using their exact language patterns
2. SUBHEADLINE: Promise the primary desire with emotional benefit
3. FEATURES: Each feature should solve a specific pain point and address an objection. Write COMPLETE sentences (no truncation).
4. PROBLEM STATEMENT: Use their exact language to describe the pain - make them feel understood
5. SOLUTION: Position around competitor gaps and emotional triggers
6. STATISTICS: Include 3 real statistics with sources in the stats array
7. CTA: Remove friction around the most common objection

CRITICAL RULES:
• Use ONLY user-provided credentials (no fabrication of reviews, years, or numbers)
• Mirror their language patterns naturally in headlines and copy
• Address objections proactively in feature descriptions
• Focus on emotional benefits over technical features
• Write COMPLETE sentences - never truncate mid-sentence
• Include the real statistics provided above in the output`;
  }

  const userPrompt = buildUserPrompt(consultationData, intelligenceContext, statisticsToInclude);

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
    
    // Ensure statistics are included even if AI didn't generate them
    if (!generated.statistics || generated.statistics.length === 0) {
      generated.statistics = statisticsToInclude;
    }
    
    console.log('✅ Content generated:', {
      headline: generated.headline?.substring(0, 50),
      features: generated.features?.length,
      statistics: generated.statistics?.length
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
function buildUserPrompt(consultationData: any, intelligenceContext?: any, statisticsToInclude?: any[]): string {
  const statsInstructions = statisticsToInclude && statisticsToInclude.length > 0
    ? `\n7. Include these EXACT statistics in the statistics array:\n${statisticsToInclude.map(s => `   - Value: "${s.value}", Label: "${s.label}", Source: "${s.source}"`).join('\n')}`
    : '';

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
5. Generate exactly 5 relevant features with COMPLETE sentences (no truncation)
6. Create a clear, benefit-driven CTA${statsInstructions}

Return ONLY valid JSON in this exact format:
{
  "headline": "Compelling headline addressing primary pain",
  "subheadline": "Supporting statement with emotional benefit",
  "features": [
    {"title": "Feature 1", "description": "Complete benefit-focused description sentence.", "icon": "star"},
    {"title": "Feature 2", "description": "Complete benefit-focused description sentence.", "icon": "shield"},
    {"title": "Feature 3", "description": "Complete benefit-focused description sentence.", "icon": "check"},
    {"title": "Feature 4", "description": "Complete benefit-focused description sentence.", "icon": "heart"},
    {"title": "Feature 5", "description": "Complete benefit-focused description sentence.", "icon": "trophy"}
  ],
  "statistics": [
    {"value": "21,714", "label": "Wedding businesses nationwide", "source": "Zippia"},
    {"value": "85%", "label": "Couples who hire professional DJs", "source": "The Knot"},
    {"value": "$1,200", "label": "Average DJ booking value", "source": "WeddingWire"}
  ],
  "problemStatement": "Problem as a question they ask themselves",
  "solutionStatement": "Solution with clear benefits",
  "socialProof": "Professional credential statement (only if provided)",
  "ctaText": "Action-oriented CTA",
  "sections": ["hero", "features", "problem_solution", "stats", "final_cta"],
  "images": {
    "hero": "Unsplash search query for hero image",
    "gallery": [],
    "features": "Background image search query",
    "background": "Pattern/texture search query"
  }
}`;
}

/**
 * Handle section regeneration
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

  const systemPrompt = `You are an expert landing page copywriter. Regenerate ONLY the ${sectionType} section content while maintaining brand consistency.

Current content for reference:
${JSON.stringify(currentContent, null, 2)}

Generate fresh, improved content for the ${sectionType} section only.`;

  const userPrompt = `Regenerate the ${sectionType} section for:

Industry: ${consultationData?.industry || 'Not specified'}
Target Audience: ${consultationData?.targetAudience || 'Not specified'}
Unique Value: ${consultationData?.uniqueValue || 'Not specified'}

Return ONLY the JSON for this specific section type.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const sectionContent = parseJSON(content.text);
    
    console.log('✅ Section regenerated:', sectionType);

    return new Response(
      JSON.stringify({ success: true, content: sectionContent, sectionType }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Section regeneration error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Regeneration failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
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
    throw new Error('Failed to parse JSON from response');
  }
}
