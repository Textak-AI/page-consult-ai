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
    const hasStrategicConsultation = !!requestData.strategicConsultation;
    
    console.log('[generate-page-content] Mode:', hasStrategyBrief ? 'STRATEGY_BRIEF' : 'LEGACY');

    let systemPrompt: string;
    let userPrompt: string;

    if (hasStrategyBrief) {
      // ═══════════════════════════════════════════════════════════════════════════
      // STRATEGY BRIEF MODE - Uses AI-generated strategy brief as primary context
      // ═══════════════════════════════════════════════════════════════════════════
      
      const sc = requestData.strategicConsultation || {};
      
      systemPrompt = `You are an expert landing page copywriter. You have been given a STRATEGY BRIEF that was created from a deep business consultation. Your job is to transform this brief into compelling landing page content.

═══════════════════════════════════════════════════════════
CRITICAL RULES - READ CAREFULLY
═══════════════════════════════════════════════════════════

1. THE STRATEGY BRIEF IS YOUR PRIMARY SOURCE
   - Every piece of content you generate MUST be derived from the strategy brief
   - Use the "Headline Recommendations" section for headline options
   - Use "Key Messaging Pillars" for feature themes
   - Use "Tone & Voice" to guide your writing style
   - Use "Recommended Page Structure" for section ordering
   - Use "Proof Points" for credibility elements

2. NEVER USE GENERIC PLACEHOLDERS
   ❌ FORBIDDEN: "Sarah M., Satisfied Customer"
   ❌ FORBIDDEN: "John D., Happy Client"  
   ❌ FORBIDDEN: "Lorem ipsum" or any filler text
   ❌ FORBIDDEN: Generic testimonial quotes
   
   ✅ IF REAL TESTIMONIALS PROVIDED: Use the actual text and name from consultation
   ✅ IF NO TESTIMONIALS: Use this exact format:
      {
        "quote": "[Testimonial will be added - describe the transformation your client experienced]",
        "author": "[Client Name]",
        "title": "[Their Role/Company]"
      }

3. USE ACTUAL BUSINESS DATA
   - Business name: ${sc.businessName || 'the business'}
   - Years in business: ${sc.yearsInBusiness || 'Not specified'}
   - Client count: ${sc.clientCount || 'Not specified'}
   - Achievements: ${sc.achievements || 'Not specified'}
   - CTA text from consultation: "${sc.ctaText || 'Get Started'}"

4. TESTIMONIAL RULES
   Real testimonial provided: "${sc.testimonialText || 'None'}"
   
   IF testimonialText contains actual quotes with names:
   - Parse and use them exactly as provided
   - Keep the real person's name and title
   
   IF testimonialText is empty or generic:
   - Generate 2-3 testimonial placeholders using this format:
     {
       "quote": "[Testimonial will be added]",
       "author": "[Client Name]",
       "title": "[Their Industry/Role]"
     }
   - This signals to the user they need to add real content

5. FEATURE GENERATION
   - Extract features from the "Key Messaging Pillars" in the strategy brief
   - Each feature should address a specific benefit mentioned in the brief
   - Include any deliverables from: "${sc.offerIncludes || 'Not specified'}"
   - Maximum 6 features

6. PROBLEM/SOLUTION STATEMENTS
   - Problem: Derive from client frustration: "${sc.clientFrustration || 'Not specified'}"
   - Solution: Derive from unique strength: "${sc.uniqueStrength || 'Not specified'}"
   - Desired outcome: "${sc.desiredOutcome || 'Not specified'}"

7. CTA (CALL TO ACTION)
   - Primary CTA text: "${sc.ctaText || 'Get Started'}"
   - Primary goal: "${sc.primaryGoal || 'leads'}"

═══════════════════════════════════════════════════════════
OUTPUT FORMAT (STRICT JSON)
═══════════════════════════════════════════════════════════

Return ONLY valid JSON with this exact structure:
{
  "headline": "string (derived from brief's Headline Recommendations)",
  "subheadline": "string (derived from Core Value Proposition, 1-2 sentences)",
  "features": [
    {
      "title": "string (derived from Key Messaging Pillars)",
      "description": "string (benefit-focused, 1 sentence)",
      "icon": "Zap|Target|Shield|Award|TrendingUp|Users|CheckCircle|Clock|Heart|Star"
    }
  ],
  "ctaText": "string (use the CTA from consultation: ${sc.ctaText || 'Get Started'})",
  "problemStatement": "string (1-2 sentences, derived from client frustration)",
  "solutionStatement": "string (2-3 sentences, derived from unique strength and desired outcome)",
  "testimonials": [
    {
      "quote": "string (real quote if provided, otherwise '[Testimonial will be added]')",
      "author": "string (real name if provided, otherwise '[Client Name]')",
      "title": "string (real title if provided, otherwise '[Their Role/Company]')"
    }
  ],
  "socialProof": {
    "clientCount": "string (if provided: '${sc.clientCount || ''}', otherwise null)",
    "yearsInBusiness": "string (if provided: '${sc.yearsInBusiness || ''}', otherwise null)",
    "achievements": "string (if provided, otherwise null)"
  },
  "processSteps": [
    {
      "step": 1,
      "title": "string",
      "description": "string"
    }
  ]
}`;

      userPrompt = `Here is the STRATEGY BRIEF to use as your primary context for generating landing page content:

═══════════════════════════════════════════════════════════
STRATEGY BRIEF
═══════════════════════════════════════════════════════════

${requestData.strategyBrief}

═══════════════════════════════════════════════════════════
ADDITIONAL CONSULTATION DATA
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

Generate landing page content following the strategy brief's recommendations. Return valid JSON only.`;

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
        temperature: 0.7,
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

    console.log('[generate-page-content] Successfully generated content');
    
    return new Response(
      JSON.stringify({ success: true, content: parsedContent, mode: hasStrategyBrief ? 'strategy_brief' : 'legacy' }), 
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
