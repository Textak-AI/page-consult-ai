import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  authoritySignals: AuthoritySignal[];
  faqItems: FAQItem[];
  queryTargets: QueryTarget[];
  schemaReadiness: {
    score: number;
    missing: string[];
    complete: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
- Optimize it to be specific and quotable (e.g., "Over 100" → "127+")
- Extract all numbers mentioned

### 3. FAQ Generation
Transform objections, offer details, and process information into natural FAQ questions.
Generate 6-10 questions someone might ask an AI assistant about this business.
Mark the source of each FAQ (objection, offer, process, or industry_common).

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
