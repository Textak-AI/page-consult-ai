import { supabase } from '@/integrations/supabase/client';
import { getIndustryPattern } from '@/data/industry-patterns';

export interface ConsultationData {
  industry?: string;
  service_type?: string;
  goal?: string;
  target_audience?: string;
  challenge?: string;
  unique_value?: string;
  offer?: string;
}

export interface GeneratedContent {
  headline: string;
  subheadline: string;
  features: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  problemStatement: string;
  solutionStatement: string;
  socialProof: string;
  ctaText: string;
  sections: string[];
  images: {
    hero: string;
    gallery?: string[];
    features?: string;
    background?: string;
  };
}

/**
 * Generate intelligent, industry-specific content using Claude API directly
 * Bypasses edge functions for reliability and full prompt control
 */
export async function generateIntelligentContent(
  consultation: ConsultationData
): Promise<GeneratedContent> {
  // Detect industry and load patterns
  const industryKey = detectIndustry(consultation);
  const pattern = getIndustryPattern(industryKey);
  
  if (!pattern) {
    throw new Error(`No pattern found for industry: ${industryKey}`);
  }

  console.log(`🎯 Detected industry: ${pattern.name}`, { industryKey });

  // Build comprehensive system prompt with industry intelligence
  const systemPrompt = buildSystemPrompt(pattern, consultation);
  
  // Build user prompt with consultation data
  const userPrompt = buildUserPrompt(consultation);

  console.log('📤 Calling edge function (secure Claude proxy)...');

  try {
    // Call edge function - it securely proxies to Claude API
    const { data, error } = await supabase.functions.invoke('anthropic-proxy', {
      body: {
        systemPrompt,
        userPrompt
      }
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      throw new Error(error.message || 'Failed to call content generation service');
    }

    if (!data.success) {
      console.error('❌ Content generation failed:', data.error);
      throw new Error(data.error || 'Content generation failed');
    }

    console.log('✅ Claude response received via edge function');

    // Parse Claude's JSON response
    const generated = parseClaudeResponse(data.content);
    
    console.log('✅ Successfully generated intelligent content:', {
      headline: generated.headline.substring(0, 50) + '...',
      featuresCount: generated.features.length,
      industry: pattern.name
    });

    return generated;

  } catch (error) {
    console.error('❌ Content generation error:', error);
    
    throw new Error(
      `Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Detect industry from consultation data
 */
function detectIndustry(consultation: ConsultationData): string {
  const industry = consultation.industry?.toLowerCase() || '';
  const service = consultation.service_type?.toLowerCase() || '';
  const combined = `${industry} ${service}`;

  // Direct matches
  if (combined.includes('wedding') && combined.includes('dj')) return 'wedding_dj';
  if (combined.includes('b2b') || combined.includes('saas') || combined.includes('software')) return 'b2b_saas';
  if (combined.includes('legal') || combined.includes('law') || combined.includes('attorney')) return 'legal_services';
  if (combined.includes('home') || combined.includes('contractor') || combined.includes('repair')) return 'home_services';
  if (combined.includes('health') || combined.includes('medical') || combined.includes('doctor')) return 'healthcare';
  if (combined.includes('consult')) return 'consulting';
  if (combined.includes('ecommerce') || combined.includes('shop') || combined.includes('store')) return 'ecommerce';

  // Default to consulting for professional services
  return 'consulting';
}

/**
 * Build comprehensive system prompt with industry patterns
 */
function buildSystemPrompt(pattern: any, consultation: ConsultationData): string {
  return `You are an expert landing page copywriter specializing in ${pattern.name}.

═══════════════════════════════════════════════════════════
INDUSTRY: ${pattern.name}
TONE: ${pattern.tone}
AUDIENCE TYPE: ${pattern.audienceType}
═══════════════════════════════════════════════════════════

TARGET AUDIENCE LANGUAGE:
✓ USE: ${pattern.targetLanguage?.audience?.join(', ') || 'appropriate audience terms'}
✗ AVOID: ${pattern.targetLanguage?.avoid?.join(', ') || 'inappropriate terms'}

CRITICAL TRANSFORMATION RULES:
1. NEVER copy user's exact words verbatim - always transform professionally
2. Transform credentials using these patterns:
   ${JSON.stringify(pattern.credentialTransform || {}, null, 2)}
3. Use ONLY data user provided - NO fabrication of stats, testimonials, or urgency
4. Match tone to ${pattern.audienceType}
5. Generate ${pattern.features?.length || 5} industry-specific features

CREDENTIAL EXTRACTION (from Unique Value field):
✓ Look for review counts: "225 reviews" → extract 225
✓ Look for star ratings: "5-star" or "five star" → extract rating
✓ Look for metrics: "10+ years", "500+ clients" → extract numbers
✓ Transform using credentialTransform patterns above

SOCIAL PROOF INSTRUCTIONS:
✓ Use EXACT format from pattern: "${pattern.socialProof?.format || 'Trusted by satisfied customers'}"
✓ Extract number from unique_value (look for digits + 'review', 'client', 'couple', etc.)
✓ Extract rating if mentioned (5-star, five star, etc.)
✓ Example: "225, 5-Star Google reviews" → "225+ Five-Star Google Reviews"
✓ Match industry terminology exactly (couples for weddings, clients for B2B, etc.)
${pattern.socialProof?.avoid ? `✗ AVOID: ${pattern.socialProof.avoid}` : ''}

CTA OPTIMIZATION:
✓ Use patterns: ${pattern.ctaPatterns?.map((c: string) => `${c}`).join(', ') || 'Create action-oriented CTA'}
✓ If offer is provided, subtly incorporate it into the CTA
✓ Example: Offer "Free consultation" → "Schedule Your Free Consultation"
✓ Example: Offer "Free recording" → "Check Availability & Claim Your Free Recording"
✓ Keep CTA action-oriented and benefit-focused

DYNAMIC SECTION SELECTION:
Based on industry and provided data, select 6-8 sections from these options:

ALWAYS INCLUDE (in this order):
✓ "hero" - Always first section
✓ "features" - Core value propositions  
✓ "final_cta" - Always last section

OPTIONAL SECTIONS (choose based on relevance):
- "photo_gallery" - For visual industries: weddings, restaurants, real estate, photography
- "video_hero" - For service-based: consulting, coaching, speaking
- "testimonials" - If user provided reviews, ratings, or testimonials
- "case_study" - If user provided success stories or results
- "process_timeline" - For multi-step services: legal, consulting, construction
- "pricing_table" - If user mentioned packages, tiers, or pricing
- "faq" - For complex offerings needing explanation
- "stats_bar" - If user provided metrics: years in business, clients served, completion rate
- "team_section" - For personal services: consulting, legal, medical
- "portfolio_grid" - For creative work: design, photography, architecture
- "comparison_table" - For competitive markets needing differentiation
- "calculator" - For ROI/savings relevant industries: B2B, home services, financial

INDUSTRY TEMPLATES:
Wedding DJ → ["hero", "photo_gallery", "features", "testimonials", "pricing_table", "faq", "final_cta"]
B2B SaaS → ["hero", "stats_bar", "features", "process_timeline", "case_study", "pricing_table", "final_cta"]
Legal Services → ["hero", "practice_areas", "process_timeline", "case_results", "testimonials", "final_cta"]
E-commerce → ["hero", "product_showcase", "features", "testimonials", "shipping_info", "final_cta"]
Home Services → ["hero", "photo_gallery", "features", "process_timeline", "calculator", "testimonials", "final_cta"]

IMAGE SEARCH QUERIES:
Generate Unsplash search queries for key sections. Be specific and industry-relevant.

Examples:
- Wedding DJ hero: "wedding dj dance floor reception party lights"
- B2B SaaS hero: "modern office team collaboration software"
- Legal hero: "professional law office consultation"
- Home Services hero: "[specific service] professional quality work"

For gallery images (if applicable), provide 3-6 specific search terms.
For feature background (if applicable), provide subtle, professional search term.

INDUSTRY-SPECIFIC FEATURES TO CONSIDER:
${pattern.features?.map((f: string) => `- ${f}`).join('\n') || '- Generate relevant features'}

HEADLINE FORMULAS (choose one that fits):
${pattern.headlineFormulas?.map((f: string) => `- ${f}`).join('\n') || '- Create compelling headline'}

OUTPUT REQUIREMENTS:
✓ Use industry-appropriate language and tone
✓ Transform credentials professionally  
✓ Include specific features for ${pattern.name}
✓ Match ${pattern.tone} tone exactly
✓ Use NO fabricated data whatsoever
✓ Return valid JSON only

You must respond with ONLY a JSON object in this exact format:
{
  "headline": "Professional, benefit-focused headline",
  "subheadline": "Supporting statement that elaborates on the headline",
  "features": [
    {"title": "Feature 1", "description": "Benefit-focused description"},
    {"title": "Feature 2", "description": "Benefit-focused description"},
    {"title": "Feature 3", "description": "Benefit-focused description"},
    {"title": "Feature 4", "description": "Benefit-focused description"},
    {"title": "Feature 5", "description": "Benefit-focused description"}
  ],
  "problemStatement": "Compelling problem statement as a question",
  "solutionStatement": "Clear solution statement with benefits",
  "socialProof": "Format exactly as: ${pattern.socialProof?.format || 'Social proof statement'} (extract numbers from unique_value)",
  "ctaText": "Clear, action-oriented CTA (incorporate offer if provided)",
  "sections": ["hero", "selected_section_2", "features", "selected_section_3", "final_cta"],
  "images": {
    "hero": "Specific Unsplash search query for hero image",
    "gallery": ["Search query 1", "Search query 2", "Search query 3"],
    "features": "Subtle background image search query",
    "background": "Professional background pattern search"
  }
}`;
}

/**
 * Build user prompt with consultation data
 */
function buildUserPrompt(consultation: ConsultationData): string {
  return `Generate landing page content for this consultation:

CONSULTATION DATA:
- Industry: ${consultation.industry || 'Not specified'}
- Service Type: ${consultation.service_type || 'Not specified'}
- Goal: ${consultation.goal || 'Not specified'}
- Target Audience: ${consultation.target_audience || 'Not specified'}
- Challenge/Problem: ${consultation.challenge || 'Not specified'}
- Unique Value/Experience: ${consultation.unique_value || 'Not specified'}
- Offer: ${consultation.offer || 'Not specified'}

INSTRUCTIONS:
1. Transform the raw consultation data into professional, compelling copy
2. Use industry-specific language and features
3. Match the tone and audience type for this industry
4. Include ONLY verifiable credentials from the consultation (no fabrication)
5. Generate exactly 5 industry-appropriate features
6. Create a headline that hooks the target audience
7. Write problem and solution statements that resonate emotionally
8. Format social proof according to industry standards
9. Create a clear, benefit-driven CTA

Return ONLY the JSON object with no additional text or formatting.`;
}

/**
 * Parse and validate Claude's JSON response
 */
function parseClaudeResponse(responseText: string): GeneratedContent {
  try {
    // Remove markdown code blocks if present
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(jsonText);

    // Validate required fields
    if (!parsed.headline || !parsed.subheadline || !parsed.features) {
      throw new Error('Missing required fields in Claude response');
    }

    if (!Array.isArray(parsed.features) || parsed.features.length < 5) {
      throw new Error('Features must be an array with at least 5 items');
    }

    // Ensure all features have required properties
    parsed.features = parsed.features.map((f: any) => ({
      title: f.title || 'Feature',
      description: f.description || '',
      icon: f.icon || '✓'
    }));

    return {
      headline: parsed.headline,
      subheadline: parsed.subheadline,
      features: parsed.features,
      problemStatement: parsed.problemStatement || parsed.problem || '',
      solutionStatement: parsed.solutionStatement || parsed.solution || '',
      socialProof: parsed.socialProof || '',
      ctaText: parsed.ctaText || parsed.cta?.primary || 'Get Started',
      sections: parsed.sections || ['hero', 'features', 'final_cta'],
      images: {
        hero: parsed.images?.hero || '',
        gallery: parsed.images?.gallery || [],
        features: parsed.images?.features || '',
        background: parsed.images?.background || ''
      }
    };

  } catch (error) {
    console.error('Failed to parse Claude response:', responseText);
    throw new Error(
      `Failed to parse Claude response: ${error instanceof Error ? error.message : 'Invalid JSON'}`
    );
  }
}
