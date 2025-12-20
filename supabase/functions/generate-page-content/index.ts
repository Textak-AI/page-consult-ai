import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

// Validation schema - updated to support both old and new consultation flows
const GenerateContentRequestSchema = z.object({
  // Legacy fields
  industry: z.string().trim().min(2).max(100).optional(),
  specificService: z.string().trim().min(2).max(200).optional(),
  service_type: z.string().trim().min(2).max(200).optional(),
  goal: z.string().trim().min(2).max(200).optional(),
  targetAudience: z.string().trim().min(5).max(500).optional(),
  target_audience: z.string().trim().min(5).max(500).optional(),
  challenge: z.string().trim().min(10).max(1000).optional(),
  uniqueValue: z.string().trim().min(10).max(1000).optional(),
  unique_value: z.string().trim().min(10).max(1000).optional(),
  credentials: z.string().trim().max(500).optional(),
  insights: z.string().max(10000).optional(),
  marketInsights: z.any().optional(),
  // NEW: Strategy brief from strategic consultation
  strategyBrief: z.string().max(50000).optional(),
  // NEW: Structured brief JSON from strategy generation
  structuredBrief: z.any().optional(),
  // NEW: Page type for beta/IR sections
  pageType: z.string().optional(),
  // NEW: Full consultation data from strategic consultation
  strategicConsultation: z.object({
    businessName: z.string().optional(),
    industry: z.string().optional(),
    industryOther: z.string().optional(),
    yearsInBusiness: z.string().optional(),
    uniqueStrength: z.string().optional(),
    idealClient: z.string().optional(),
    clientFrustration: z.string().optional(),
    desiredOutcome: z.string().optional(),
    clientCount: z.string().optional(),
    achievements: z.string().optional(),
    testimonialText: z.string().optional(),
    mainOffer: z.string().optional(),
    offerIncludes: z.string().optional(),
    investmentRange: z.string().optional(),
    processDescription: z.string().optional(),
    primaryGoal: z.string().optional(),
    ctaText: z.string().optional(),
    objectionsToOvercome: z.string().optional(),
    pageType: z.string().optional(),
  }).optional(),
});

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const bodyText = await req.text();
    console.log('[generate-page-content] Raw body received:', bodyText.substring(0, 300));
    
    let requestData: z.infer<typeof GenerateContentRequestSchema>;
    try {
      requestData = JSON.parse(bodyText);
      console.log('[generate-page-content] Parsed request data');
    } catch (parseError) {
      console.error('[generate-page-content] JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine which generation mode to use
    const hasStrategyBrief = !!requestData.strategyBrief && requestData.strategyBrief.length > 100;
    const hasStructuredBrief = !!requestData.structuredBrief;
    const hasStrategicConsultation = !!requestData.strategicConsultation;
    const pageType = requestData.pageType || requestData.strategicConsultation?.pageType || null;
    
    console.log('[generate-page-content] Mode:', hasStructuredBrief ? 'STRUCTURED_BRIEF' : hasStrategyBrief ? 'STRATEGY_BRIEF' : 'LEGACY');
    console.log('[generate-page-content] pageType:', pageType);

    let systemPrompt: string;
    let userPrompt: string;

    if (hasStructuredBrief || hasStrategyBrief) {
      // ═══════════════════════════════════════════════════════════════════════════
      // STRATEGY BRIEF MODE - Uses strategy brief as the LITERAL BLUEPRINT
      // ═══════════════════════════════════════════════════════════════════════════
      
      const sc = requestData.strategicConsultation || {};
      const sb = requestData.structuredBrief || {};
      
      systemPrompt = `You are a landing page generator that transforms strategy briefs into page content. The strategy brief is your LITERAL BLUEPRINT - every element must be traceable back to it.

═══════════════════════════════════════════════════════════
CRITICAL: THE BRIEF IS YOUR BLUEPRINT
═══════════════════════════════════════════════════════════

1. PAGE STRUCTURE - Follow Section 9 EXACTLY
   - Use the "pageStructure" array to determine which sections to include
   - Do NOT add sections not in the pageStructure
   - Do NOT remove sections that ARE in the pageStructure
   - Order sections exactly as specified

2. HEADLINES - Use Section 10
   - Choose the BEST headline from the "headlines" options (optionA, optionB, or optionC)
   - Use "subheadline" directly as the hero subheadline

3. FEATURES - Build from Section 4 (Messaging Pillars)
   - Each messagingPillar becomes a feature card
   - Use the exact title, description, and icon from the pillar
   - Maximum 6 features (4 is ideal for visual balance)

4. PROOF POINTS - Use Section 6
   - Extract stats from "proofPoints" for the stats-bar
   - Only include stats that have real values (not null)

5. PROBLEM/SOLUTION - Use Section 5 (Competitive Differentiation)
   - Use "problemStatement" and "solutionStatement" directly

6. FAQ - Use Section 8 (Objection Handling)
   - Each objection becomes a FAQ item
   - Use question as the FAQ question, answer as the FAQ answer

7. TONE - Apply Section 7 Throughout
   - Match the specified tone in all copy
   - Professional = formal, credibility-focused
   - Friendly = conversational, approachable
   - Authoritative = expert, confident
   - Warm = empathetic, caring

8. TESTIMONIALS - Never Fabricate
   ✅ IF real testimonials in brief: Use exactly as provided
   ❌ IF no testimonials: Use placeholder format:
      { "quote": "[Testimonial will be added]", "author": "[Client Name]", "title": "[Role]" }

9. CTA - Use from Brief
   - Use "ctaText" from the brief/consultation

═══════════════════════════════════════════════════════════
DESIGN BEST PRACTICES (Apply to content structure)
═══════════════════════════════════════════════════════════

- One focal point per section (don't overcrowd)
- High-contrast CTAs (make them stand out)
- Body text optimized for readability
- Alternating section emphasis for visual rhythm
- Mobile-first content structure

═══════════════════════════════════════════════════════════
OUTPUT FORMAT (STRICT JSON)
═══════════════════════════════════════════════════════════

Return ONLY valid JSON with this exact structure:
{
  "headline": "string (from headlines.optionA/B/C - pick the best)",
  "subheadline": "string (from subheadline field directly)",
  "features": [
    {
      "title": "string (from messagingPillars)",
      "description": "string (from messagingPillars)", 
      "icon": "string (from messagingPillars: Zap|Target|Shield|Award|TrendingUp|Users|CheckCircle|Clock|Heart|Star)"
    }
  ],
  "ctaText": "string (from ctaText)",
  "problemStatement": "string (from problemStatement)",
  "solutionStatement": "string (from solutionStatement)",
  "testimonials": [
    {
      "quote": "string",
      "author": "string",
      "title": "string"
    }
  ],
  "proofPoints": {
    "clientCount": "string or null",
    "yearsInBusiness": "string or null",
    "achievements": "string or null",
    "otherStats": ["string"] or []
  },
  "faqItems": [
    {
      "question": "string (from objections)",
      "answer": "string (from objections)"
    }
  ],
  "processSteps": [
    {
      "step": 1,
      "title": "string",
      "description": "string"
    }
  ] or null,
  "pageStructure": ["hero", "stats-bar", ...] (from pageStructure),
  "tone": "string (from tone)"
}`;

      // Build user prompt with structured data
      const structuredData = hasStructuredBrief ? JSON.stringify(sb, null, 2) : '';
      
      userPrompt = `Generate landing page content using this STRATEGY BRIEF as your LITERAL BLUEPRINT.

═══════════════════════════════════════════════════════════
STRATEGY BRIEF (Full Document)
═══════════════════════════════════════════════════════════

${requestData.strategyBrief}

${hasStructuredBrief ? `
═══════════════════════════════════════════════════════════
STRUCTURED BRIEF DATA (Parse This)
═══════════════════════════════════════════════════════════

${structuredData}
` : ''}

═══════════════════════════════════════════════════════════
CONSULTATION DATA (Additional Context)
═══════════════════════════════════════════════════════════

Business Name: ${sc.businessName || 'Not specified'}
Industry: ${sc.industry || requestData.industry || 'Not specified'}
Main Offer: ${sc.mainOffer || 'Not specified'}
What's Included: ${sc.offerIncludes || 'Not specified'}
Investment Range: ${sc.investmentRange || 'Not specified'}
Process Description: ${sc.processDescription || 'Not specified'}
Primary Goal: ${sc.primaryGoal || 'Generate leads'}
CTA Text: ${sc.ctaText || 'Get Started'}
Objections to Address: ${sc.objectionsToOvercome || 'Not specified'}

Real Testimonials Provided:
${sc.testimonialText || 'None - use placeholder format'}

═══════════════════════════════════════════════════════════
INSTRUCTIONS
═══════════════════════════════════════════════════════════

1. Use the pageStructure array to determine section order
2. Pull headlines from the headlines object (pick the best option)
3. Build features from messagingPillars
4. Create FAQ from objections
5. Apply the specified tone throughout

A user should be able to trace EVERY section of the generated page back to the strategy brief.

Return valid JSON only.`;

    } else {
      // ═══════════════════════════════════════════════════════════════════════════
      // LEGACY MODE - Original quick consultation flow (backwards compatibility)
      // ═══════════════════════════════════════════════════════════════════════════
      
      systemPrompt = `You are an expert landing page copywriter.

CRITICAL RULES:
1. NEVER copy user's exact words verbatim - always transform professionally
2. Use ONLY credentials the user actually provided
3. NEVER use generic placeholder names like "Sarah M." or "John D."
4. If no testimonials provided, use format: "[Client Name], [Their Role]" with quote: "[Testimonial will be added]"

Return ONLY valid JSON with this structure:
{
  "headline": "string",
  "subheadline": "string", 
  "features": [
    { "title": "string", "description": "string", "icon": "Zap|Target|Shield|Award|TrendingUp|Users" }
  ],
  "ctaText": "string",
  "problemStatement": "string",
  "solutionStatement": "string",
  "testimonials": [
    { "quote": "string", "author": "string", "title": "string" }
  ]
}`;

      userPrompt = `Transform this consultation data into professional landing page content:

Industry: ${requestData.industry || 'Not specified'}
Service Type: ${requestData.service_type || 'Not specified'}
Target Audience: ${requestData.target_audience || 'Not specified'}
Challenge/Problem: ${requestData.challenge || 'Not specified'}
Unique Value: ${requestData.unique_value || 'Not specified'}
Offer: ${requestData.goal || 'Not specified'}

Generate compelling content. Return valid JSON only.`;
    }

    console.log('[generate-page-content] Calling AI Gateway...');
    
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-page-content] AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('[generate-page-content] AI response received, parsing...');
    
    // Parse the JSON response
    let parsedContent;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsedContent = JSON.parse(jsonString);
    } catch (e) {
      console.error('[generate-page-content] Failed to parse AI response as JSON:', content);
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format', rawContent: content }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    if (!parsedContent.headline || !parsedContent.features || !Array.isArray(parsedContent.features)) {
      console.error('[generate-page-content] AI response missing required fields:', parsedContent);
      return new Response(
        JSON.stringify({ error: 'Incomplete AI response', rawContent: parsedContent }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Post-process to catch any remaining generic placeholders
    if (parsedContent.testimonials && Array.isArray(parsedContent.testimonials)) {
      parsedContent.testimonials = parsedContent.testimonials.map((t: any) => {
        // Catch common generic names and replace with placeholder format
        const genericNames = ['sarah', 'john', 'jane', 'mike', 'lisa', 'david', 'emily'];
        const authorLower = (t.author || '').toLowerCase();
        const isGeneric = genericNames.some(name => authorLower.includes(name));
        
        if (isGeneric || authorLower.includes('satisfied') || authorLower.includes('happy')) {
          return {
            quote: '[Testimonial will be added - describe the transformation your client experienced]',
            author: '[Client Name]',
            title: '[Their Role/Company]'
          };
        }
        return t;
      });
    }

    console.log('[generate-page-content] Successfully generated content with mode:', hasStructuredBrief ? 'structured_brief' : hasStrategyBrief ? 'strategy_brief' : 'legacy');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        content: parsedContent, 
        mode: hasStructuredBrief ? 'structured_brief' : hasStrategyBrief ? 'strategy_brief' : 'legacy' 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[generate-page-content] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const origin = req.headers.get('Origin');
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
    );
  }
});
