import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.24.3";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY")!,
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationHistory, extractedIntelligence, businessContext } = await req.json();

    console.log('🔍 [Validation] Starting brief validation');

    const systemPrompt = `You are an expert landing page strategist reviewing a strategy brief before page generation.

Your job is to:
1. VALIDATE: Check if extracted intelligence accurately reflects the conversation
2. DETECT GAPS: Find valuable information in the conversation that wasn't captured
3. SCORE QUALITY: Rate each field as weak/good/strong based on specificity and usefulness
4. SUGGEST IMPROVEMENTS: Recommend better phrasing or additions based on conversation content
5. CHECK CONSISTENCY: Flag contradictions or mismatches between fields

QUALITY RATINGS:
- "weak": Vague, generic, or missing key details. Would produce generic page content.
- "good": Adequate information. Will produce reasonable content.
- "strong": Specific, detailed, has proof points or metrics. Will produce compelling content.

WHAT MAKES CONTENT STRONG:
- Specific numbers, percentages, timeframes (e.g., "94% pass rate", "3-6 months saved")
- Named clients or case studies
- Exact quotes from customers
- Unique differentiators (not generic "we're the best")
- Real objections with specific counters
- Verifiable proof points

Be rigorous but helpful. The goal is to ensure the generated page will be as effective as possible.`;

    const userPrompt = `## CONVERSATION HISTORY
${(conversationHistory || []).map((m: { role: string; content: string }, i: number) => `[${i}] ${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}

## CURRENTLY EXTRACTED INTELLIGENCE
- Industry: ${extractedIntelligence?.industry || '[empty]'}
- Audience: ${extractedIntelligence?.audience || '[empty]'}
- Value Prop: ${extractedIntelligence?.valueProp || '[empty]'}
- Edge: ${extractedIntelligence?.edge || extractedIntelligence?.competitorDifferentiator || '[empty]'}
- Pain Points: ${extractedIntelligence?.painPoints || '[empty]'}
- Objections: ${extractedIntelligence?.objections || extractedIntelligence?.buyerObjections || '[empty]'}
- Results: ${extractedIntelligence?.results || extractedIntelligence?.proofElements || '[empty]'}
- Social Proof: ${extractedIntelligence?.socialProof || '[empty]'}

## BUSINESS CONTEXT
Company: ${businessContext?.companyName || 'Unknown'}
Website: ${businessContext?.website || 'Unknown'}

---

Analyze the extraction quality and return a JSON response with this EXACT structure:

{
  "overallQuality": <0-100 score based on completeness and specificity>,
  "fieldsValidation": {
    "industry": {
      "quality": "weak|good|strong",
      "qualityReason": "Brief explanation of rating",
      "suggestions": [
        {
          "id": "unique-id-1",
          "type": "improvement|addition|specificity",
          "currentValue": "what's currently extracted",
          "suggestedValue": "improved version based on conversation",
          "reason": "why this is better for conversion",
          "confidence": 0.0-1.0,
          "sourceQuote": "exact quote from conversation if applicable"
        }
      ],
      "warnings": []
    },
    "audience": { /* same structure */ },
    "valueProp": { /* same structure */ },
    "edge": { /* same structure */ },
    "painPoints": { /* same structure */ },
    "objections": { /* same structure */ },
    "results": { /* same structure */ },
    "socialProof": { /* same structure */ }
  },
  "globalWarnings": [
    {
      "id": "warning-1",
      "type": "inconsistency|vague|missing_proof|contradiction",
      "message": "Clear description of the issue",
      "affectedFields": ["field1", "field2"],
      "severity": "info|warning|critical"
    }
  ],
  "missedExtractions": [
    {
      "id": "missed-1",
      "fieldKey": "results",
      "value": "the content that should be extracted",
      "sourceQuote": "exact quote from conversation",
      "messageIndex": <which message index>,
      "confidence": 0.0-1.0
    }
  ],
  "suggestedActions": [
    "Top 3-5 specific actions to improve this brief before generation"
  ]
}

IMPORTANT:
- Generate unique IDs for each suggestion, warning, and missed extraction
- Only suggest improvements that have evidence in the conversation
- Be specific in suggestions - don't be vague
- Focus on what would make the landing page MORE CONVINCING

Return ONLY valid JSON, no markdown code blocks or explanation.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse JSON response
    let validation;
    try {
      // Try direct parse first
      validation = JSON.parse(content.text);
    } catch {
      // Try to extract from markdown code block
      const jsonMatch = content.text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        validation = JSON.parse(jsonMatch[1]);
      } else {
        // Try to find JSON object in text
        const objectMatch = content.text.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          validation = JSON.parse(objectMatch[0]);
        } else {
          throw new Error('Could not parse validation response');
        }
      }
    }

    console.log('✅ [Validation] Complete:', {
      overallQuality: validation.overallQuality,
      missedCount: validation.missedExtractions?.length || 0,
      warningsCount: validation.globalWarnings?.length || 0,
    });

    return new Response(
      JSON.stringify({ success: true, validation }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("❌ [Validation] Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
