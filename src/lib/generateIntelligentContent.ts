import Anthropic from '@anthropic-ai/sdk';
import { industryPatterns, getIndustryPattern, type Industry } from '@/data/industry-patterns';

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
}

/**
 * Generate intelligent, industry-specific content using Claude API directly
 * Bypasses edge functions for reliability and full prompt control
 */
export async function generateIntelligentContent(
  consultation: ConsultationData
): Promise<GeneratedContent> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'VITE_ANTHROPIC_API_KEY not configured. Please add your Anthropic API key to environment variables.'
    );
  }

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

  console.log('📤 Calling Claude API with industry-specific prompt...');

  try {
    const anthropic = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    console.log('✅ Claude response received');

    // Parse Claude's JSON response
    const generated = parseClaudeResponse(content.text);
    
    console.log('✅ Successfully generated intelligent content:', {
      headline: generated.headline.substring(0, 50) + '...',
      featuresCount: generated.features.length,
      industry: pattern.name
    });

    return generated;

  } catch (error) {
    console.error('❌ Claude API error:', error);
    
    if (error instanceof Anthropic.APIError) {
      throw new Error(
        `Claude API error (${error.status}): ${error.message}. Please check your API key and try again.`
      );
    }
    
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

INDUSTRY-SPECIFIC FEATURES TO CONSIDER:
${pattern.features?.map((f: string) => `- ${f}`).join('\n') || '- Generate relevant features'}

HEADLINE FORMULAS (choose one that fits):
${pattern.headlineFormulas?.map((f: string) => `- ${f}`).join('\n') || '- Create compelling headline'}

CTA PATTERNS (choose most appropriate):
${pattern.ctaPatterns?.map((c: string) => `- ${c}`).join('\n') || '- Create action-oriented CTA'}

SOCIAL PROOF FORMAT:
${pattern.socialProof?.format || 'Trusted by satisfied customers'}
${pattern.socialProof?.avoid ? `AVOID: ${pattern.socialProof.avoid}` : ''}

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
  "socialProof": "Format: ${pattern.socialProof?.format || 'Social proof statement'}",
  "ctaText": "Clear, action-oriented CTA"
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
      ctaText: parsed.ctaText || parsed.cta?.primary || 'Get Started'
    };

  } catch (error) {
    console.error('Failed to parse Claude response:', responseText);
    throw new Error(
      `Failed to parse Claude response: ${error instanceof Error ? error.message : 'Invalid JSON'}`
    );
  }
}
