import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';
import { consultationObjections } from '../_shared/buyerObjections.ts';

interface AuthoritySignal {
  type: 'statistic' | 'credential' | 'testimonial' | 'achievement' | 'comparison';
  raw: string;
  optimized: string;
  numbers: string[];
}

interface FAQItem {
  question: string;
  answer: string;
  source: 'objection' | 'offer' | 'process' | 'industry_common';
}

interface QueryTarget {
  query: string;
  intent: 'informational' | 'transactional';
  priority: 'high' | 'medium' | 'low';
}

interface AISeoData {
  entity: {
    type: string;
    name: string;
    description: string;
    industry: string;
    areaServed: string;
  };
  authoritySignals: (AuthoritySignal | string)[];
  faqItems: FAQItem[];
  queryTargets: QueryTarget[];
  schemaReadiness: {
    score: number;
    missing: string[];
    complete: string[];
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { consultationId, consultationData } = await req.json();

    if (!consultationId || !consultationData) {
      throw new Error('Missing consultationId or consultationData');
    }

    console.log('📊 Extracting AI SEO data for consultation:', consultationId);

    // Build the extraction prompt
    const extractionPrompt = buildExtractionPrompt(consultationData);

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: extractionPrompt
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      throw new Error('No content in Anthropic response');
    }

    // Parse the JSON from Claude's response
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse JSON from response:', content);
      throw new Error('Failed to parse AI SEO data from response');
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const aiSeoData: AISeoData = JSON.parse(jsonStr);
    applySeoGuards(aiSeoData, consultationData);
    const answered = consultationObjections(consultationData);
    aiSeoData.faqItems = answered.length >= 2 ? answered.map(({ question, answer }) => ({ question, answer, source: 'objection' as const })) : [];

    console.log('✅ AI SEO data extracted successfully');
    console.log('   Entity type:', aiSeoData.entity.type);
    console.log('   Authority signals:', aiSeoData.authoritySignals.length);
    console.log('   FAQ items:', aiSeoData.faqItems.length);
    console.log('   Query targets:', aiSeoData.queryTargets.length);
    console.log('   Schema readiness score:', aiSeoData.schemaReadiness.score);

    // Store in consultations table
    const { error: updateError } = await supabase
      .from('consultations')
      .update({ ai_seo_data: aiSeoData })
      .eq('id', consultationId);

    if (updateError) {
      console.error('Failed to store AI SEO data:', updateError);
      // Don't throw - we still want to return the data
    } else {
      console.log('💾 AI SEO data stored in consultations table');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      aiSeoData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error extracting AI SEO data:', error);
    const origin = req.headers.get('Origin');
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
    });
  }
});

function buildExtractionPrompt(consultationData: Record<string, unknown>): string {
  return `You are an AI SEO specialist. Analyze this business consultation data and extract structured SEO elements optimized for AI search engines (ChatGPT, Perplexity, Claude, Google AI Overviews).

## CONSULTATION DATA
${JSON.stringify(consultationData, null, 2)}

## EXTRACTION TASKS

### 1. Entity Identification
Determine the best Schema.org type for this business:
- ProfessionalService (agencies, consultants, firms)
- Product (physical or digital products)
- Service (specific services offered)
- LocalBusiness (location-specific businesses)
- Organization (companies, non-profits)
- SoftwareApplication (apps, SaaS)

### 2. Authority Signal Extraction
Find ALL specific numbers, statistics, credentials, and achievements in the data.
For each signal:
- Identify the type: statistic, credential, testimonial, achievement, or comparison
- Extract the raw text as-is
- Optimize it to be specific and quotable without changing any supplied numbers
- Extract all numbers mentioned
- Never invent numbers, counts, or percentages. Use only numbers present in the user's consultation inputs, in both raw and optimized text.
- If no user-supplied numeric claims exist, omit numeric authority signals rather than inventing them.

### 3. FAQ Generation
Use only client-answered objection pairs, preserving question and answer verbatim.
Skipped or unanswered topics never appear. No industry-common, offer-derived or process-derived defaults.
Return no FAQ items when fewer than two client answers exist. Mark source as objection.

### 4. Query Target Identification
Generate 8-12 natural language queries people would ask AI assistants that this business should appear in results for.
Mark each as:
- Intent: informational (learning about topic) or transactional (looking to buy/hire)
- Priority: high (core business), medium (related), low (tangential)

### 5. Schema Readiness Assessment
Evaluate what structured data fields are present vs missing for rich AI results.
Score from 0-100 based on completeness.

## OUTPUT FORMAT
Respond with ONLY a JSON object in this exact structure:

\`\`\`json
{
  "entity": {
    "type": "ProfessionalService",
    "name": "Business name extracted from data",
    "description": "160 chars max, keyword-rich description",
    "industry": "Primary industry category",
    "areaServed": "Geographic area or 'Worldwide'"
  },
  "authoritySignals": [
    {
      "type": "statistic",
      "raw": "Original text from consultation",
      "optimized": "Rewritten to be specific and quotable",
      "numbers": ["75", "6 weeks"]
    }
  ],
  "faqItems": [
    {
      "question": "Natural question format",
      "answer": "Clear, helpful answer using consultation data",
      "source": "objection"
    }
  ],
  "queryTargets": [
    {
      "query": "What someone would ask an AI assistant",
      "intent": "transactional",
      "priority": "high"
    }
  ],
  "schemaReadiness": {
    "score": 75,
    "missing": ["priceRange", "openingHours", "logo"],
    "complete": ["name", "description", "industry", "areaServed"]
  }
}
\`\`\`

Be thorough in extracting ALL numbers and statistics - these are critical for AI SEO authority signals.`;
}

function collectUserInputText(data: unknown): string {
  const parts: string[] = [];
  const walk = (value: unknown, depth: number): void => {
    if (value == null || depth > 4) return;
    if (typeof value === 'string' || typeof value === 'number') {
      parts.push(String(value));
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => walk(item, depth + 1));
      return;
    }
    if (typeof value === 'object') {
      Object.values(value as Record<string, unknown>).forEach((item) => walk(item, depth + 1));
    }
  };
  walk(data, 0);
  return parts.join(' ');
}

function extractNumbers(text: string): string[] {
  return (text.match(/\d[\d,]*(?:\.\d+)?/g) || []).map((number) => number.replace(/,/g, ''));
}

function applySeoGuards(aiSeoData: AISeoData, consultationData: unknown): void {
  const userNumbers = new Set(extractNumbers(collectUserInputText(consultationData)));
  aiSeoData.authoritySignals = aiSeoData.authoritySignals.filter((signal) => {
    const texts = typeof signal === 'string'
      ? [signal]
      : [signal.raw, signal.optimized].filter((text): text is string => typeof text === 'string');
    const fabricatedText = texts.find((text) => extractNumbers(text).some((number) => !userNumbers.has(number)));
    if (fabricatedText !== undefined) {
      console.log(`🛡️ [seo-guard] Removed fabricated authoritySignal — "${fabricatedText.slice(0, 100)}"`);
      return false;
    }
    return true;
  });
}
