import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'npm:@anthropic-ai/sdk';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

/**
 * AI Industry Classification Edge Function
 * 
 * When keyword-based detection fails to classify an industry,
 * this function uses AI to intelligently classify based on full consultation context.
 * 
 * Returns: { variant, confidence, reasoning, source }
 */

interface ConsultationContext {
  industry?: string;
  industryCategory?: string;
  industrySubcategory?: string;
  businessName?: string;
  idealClient?: string;
  targetAudience?: string;
  uniqueStrength?: string;
  uniqueValue?: string;
  mainOffer?: string;
  offer?: string;
  identitySentence?: string;
  serviceType?: string;
  challenge?: string;
  goal?: string;
  proofElements?: string[];
  authorityMarkers?: string[];
}

interface ClassificationResult {
  variant: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  source: 'ai';
}

const VALID_VARIANTS = [
  'saas', 'saas-enterprise', 'saas-startup',
  'fintech', 'healthtech', 'devtools',
  'consulting', 'coaching', 'manufacturing',
  'healthcare', 'ecommerce', 'creative',
  'realestate', 'finance', 'local-services',
  'investor', 'beta'
] as const;

function buildClassificationPrompt(industry: string, context: ConsultationContext): string {
  return `You are PageConsult's Strategic Design Intelligence system. Your job is to classify a business into the correct design variant so their landing page feels like it was designed specifically for their industry.

The user described their industry as: "${industry}"

Here's what we know about this business from our strategic consultation:
- Business name: ${context.businessName || 'Unknown'}
- Industry/category: ${context.industryCategory || context.industry || industry}
- Subcategory: ${context.industrySubcategory || 'Not specified'}
- Their target audience: ${context.targetAudience || context.idealClient || 'Not specified'}
- Their unique strength: ${context.uniqueStrength || context.uniqueValue || 'Not specified'}
- Their main offer: ${context.mainOffer || context.offer || 'Not specified'}
- Identity sentence: ${context.identitySentence || 'Not specified'}
- Service type: ${context.serviceType || 'Not specified'}
- Challenge they solve: ${context.challenge || 'Not specified'}
- Goal: ${context.goal || 'Not specified'}
- Proof elements: ${context.proofElements?.join(', ') || context.authorityMarkers?.join(', ') || 'Not specified'}

Available design variants and what they're designed for:

1. "saas" — B2B software products. Dark mode, glass cards, product-forward. For companies selling a software platform.
2. "saas-enterprise" — Enterprise software. Dark mode, security-forward. For enterprise B2B software.
3. "consulting" — Professional services, advisory firms, venture studios, agencies. Light mode, navy/charcoal, trust-forward. For companies selling expertise, partnerships, and outcomes.
4. "coaching" — Coaches, trainers, course creators. Warm mode, purple/amber, transformation-focused. For personal development and education.
5. "manufacturing" — Industrial, engineering, production, defense. Light mode, steel/blue, capability-forward. For companies that make or build physical things.
6. "healthcare" — Medical, clinical, health services. Light mode, teal/soft blue, trust and compliance. For health-related services.
7. "finance" — Financial services, banking, investment, CFO services, accounting. Light mode, navy/green, stability-focused. For money-related services.
8. "creative" — Design studios, agencies, creatives. Dark mode, bold accents, portfolio-forward. For companies selling creative output.
9. "ecommerce" — Retail, DTC, product sales. Light mode, product-forward. For companies selling physical or digital products.
10. "realestate" — Property, real estate services, proptech. Light mode, earth tones. For property-related businesses.
11. "fintech" — Financial technology specifically. Dark mode, security-forward. For companies building financial software.
12. "healthtech" — Healthcare technology specifically. Light mode, clinical + tech blend. For companies building health software.
13. "devtools" — Developer tools specifically. Dark mode, technical, code-forward. For companies building tools for developers.
14. "local-services" — Plumbers, electricians, contractors, home services. Light mode, trust + action-oriented. For local trade businesses.

IMPORTANT CLASSIFICATION RULES:
- A "venture studio" that builds companies, takes equity, and works with founders is "consulting" (professional services) NOT "saas"
- A "fractional CFO" or "fractional executive" practice is "finance" or "consulting" NOT "saas"
- An "accelerator" or "incubator" is "consulting" (they sell expertise to founders) NOT "saas"
- An "executive search firm" or "recruiting firm" is "consulting" NOT "saas"
- If the business sells SOFTWARE as a product, it's "saas"
- If the business sells EXPERTISE, SERVICES, or PARTNERSHIPS, it's likely "consulting", "finance", or "coaching"

Think about what their BUYER expects to see. What design treatment would make their prospect think "these people understand my world"?

Respond in exactly this format (no extra text):
VARIANT: [variant name from list above]
CONFIDENCE: [high/medium/low]
REASONING: [One sentence explaining why this variant fits, referencing specific business context]`;
}

function parseClassificationResponse(content: string): ClassificationResult {
  const lines = content.split('\n').filter(l => l.trim());
  
  let variant = 'consulting'; // Safe default
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  let reasoning = '';
  
  for (const line of lines) {
    if (line.toUpperCase().startsWith('VARIANT:')) {
      const v = line.replace(/VARIANT:/i, '').trim().toLowerCase();
      if (VALID_VARIANTS.includes(v as any)) {
        variant = v;
      }
    }
    if (line.toUpperCase().startsWith('CONFIDENCE:')) {
      const c = line.replace(/CONFIDENCE:/i, '').trim().toLowerCase();
      if (['high', 'medium', 'low'].includes(c)) {
        confidence = c as 'high' | 'medium' | 'low';
      }
    }
    if (line.toUpperCase().startsWith('REASONING:')) {
      reasoning = line.replace(/REASONING:/i, '').trim();
    }
  }
  
  return { variant, confidence, reasoning, source: 'ai' };
}

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  console.log('🧠 [classify-industry] Function called');

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Missing authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client and verify user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError?.message || 'No user found');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Get API key
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'ANTHROPIC_API_KEY not configured. Falling back to default classification.',
          fallback: { variant: 'consulting', confidence: 'low', reasoning: 'AI classification unavailable', source: 'fallback' }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const body = await req.json();
    const { industry, context }: { industry: string; context: ConsultationContext } = body;

    console.log('📥 Classification request:', {
      industry,
      hasContext: !!context,
      businessName: context?.businessName,
    });

    if (!industry) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Missing industry field in request body'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build prompt and call Claude
    const prompt = buildClassificationPrompt(industry, context || {});
    
    console.log('📤 Calling Claude for classification...');
    console.time('⏱️ Claude API duration');

    const anthropic = new Anthropic({ apiKey });
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      temperature: 0.1, // Low temperature for consistent classification
      messages: [{ role: 'user', content: prompt }]
    });

    console.timeEnd('⏱️ Claude API duration');

    // Extract and parse response
    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';
    
    console.log('📝 Raw Claude response:', text);

    const result = parseClassificationResponse(text);
    
    console.log('✅ Classification result:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        classification: result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Classification error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Return a fallback classification on error
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Classification failed',
        fallback: { 
          variant: 'consulting', 
          confidence: 'low', 
          reasoning: 'AI classification failed - defaulting to professional services treatment',
          source: 'fallback' 
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
