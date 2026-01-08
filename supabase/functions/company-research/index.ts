import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Input validation
const MAX_INPUT_LENGTH = 200;

function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    .replace(/[<>\"'&]/g, '')
    .slice(0, MAX_INPUT_LENGTH)
    .trim();
}

interface CompanyResearch {
  companyName: string;
  website: string | null;
  description: string | null;
  services: string[];
  targetMarket: string | null;
  founded: string | null;
  location: string | null;
  differentiators: string[];
  publicProof: string[];
  industryPosition: string | null;
  confidence: 'low' | 'medium' | 'high';
}

function extractCompanyFacts(text: string, companyName: string): Partial<CompanyResearch> {
  const result: Partial<CompanyResearch> = {
    services: [],
    differentiators: [],
    publicProof: [],
    confidence: 'low',
  };

  const lines = text.split('\n');
  let currentSection = '';
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Detect sections
    if (lowerLine.includes('about') || lowerLine.includes('description') || lowerLine.includes('overview')) {
      currentSection = 'description';
      continue;
    }
    if (lowerLine.includes('service') || lowerLine.includes('offering') || lowerLine.includes('solution')) {
      currentSection = 'services';
      continue;
    }
    if (lowerLine.includes('target') || lowerLine.includes('customer') || lowerLine.includes('client') || lowerLine.includes('market')) {
      currentSection = 'target';
      continue;
    }
    if (lowerLine.includes('founded') || lowerLine.includes('established') || lowerLine.includes('since')) {
      currentSection = 'founded';
      // Extract year from this line
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) {
        result.founded = yearMatch[0];
      }
      continue;
    }
    if (lowerLine.includes('location') || lowerLine.includes('headquarter') || lowerLine.includes('based')) {
      currentSection = 'location';
      continue;
    }
    if (lowerLine.includes('differentiat') || lowerLine.includes('unique') || lowerLine.includes('stand')) {
      currentSection = 'differentiators';
      continue;
    }
    if (lowerLine.includes('award') || lowerLine.includes('certif') || lowerLine.includes('recognition') || lowerLine.includes('client')) {
      currentSection = 'proof';
      continue;
    }
    if (lowerLine.includes('position') || lowerLine.includes('competit')) {
      currentSection = 'position';
      continue;
    }

    // Extract content based on current section
    const cleanedLine = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();
    
    if (cleanedLine.length > 10 && cleanedLine.length < 300) {
      switch (currentSection) {
        case 'description':
          if (!result.description || result.description.length < cleanedLine.length) {
            result.description = cleanedLine.slice(0, 200);
          }
          break;
        case 'services':
          if (result.services!.length < 5 && cleanedLine.length < 100) {
            result.services!.push(cleanedLine);
          }
          break;
        case 'target':
          if (!result.targetMarket && cleanedLine.length < 150) {
            result.targetMarket = cleanedLine;
          }
          break;
        case 'location':
          if (!result.location && cleanedLine.length < 100) {
            result.location = cleanedLine;
          }
          break;
        case 'differentiators':
          if (result.differentiators!.length < 3 && cleanedLine.length < 150) {
            result.differentiators!.push(cleanedLine);
          }
          break;
        case 'proof':
          if (result.publicProof!.length < 5 && cleanedLine.length < 100) {
            result.publicProof!.push(cleanedLine);
          }
          break;
        case 'position':
          if (!result.industryPosition && cleanedLine.length < 200) {
            result.industryPosition = cleanedLine;
          }
          break;
      }
    }
  }

  // Determine confidence level
  const hasDescription = !!result.description;
  const hasServices = (result.services?.length || 0) > 0;
  const hasTarget = !!result.targetMarket;
  const hasDifferentiators = (result.differentiators?.length || 0) > 0;

  if (hasDescription && hasServices && (hasTarget || hasDifferentiators)) {
    result.confidence = 'high';
  } else if (hasDescription || (hasServices && hasTarget)) {
    result.confidence = 'medium';
  }

  return result;
}

serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const body = await req.json();
    const { companyName, website, industryContext } = body;

    // Validate inputs
    if (!companyName || typeof companyName !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Company name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitizedCompanyName = sanitizeInput(companyName);
    const sanitizedWebsite = website ? sanitizeInput(website) : null;
    const sanitizedIndustry = industryContext ? sanitizeInput(industryContext) : null;

    console.log(`🔍 [Research] Researching company: ${sanitizedCompanyName}`, sanitizedWebsite || '');

    if (!PERPLEXITY_API_KEY) {
      console.warn('PERPLEXITY_API_KEY not configured');
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            companyName: sanitizedCompanyName,
            website: sanitizedWebsite,
            description: null,
            services: [],
            targetMarket: null,
            founded: null,
            location: null,
            differentiators: [],
            publicProof: [],
            industryPosition: null,
            confidence: 'low' as const,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract domain for more accurate search
    let domain: string | null = null;
    if (sanitizedWebsite) {
      try {
        const url = new URL(sanitizedWebsite);
        domain = url.hostname.replace('www.', '');
      } catch {
        // Invalid URL, use as-is
        domain = sanitizedWebsite.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
      }
    }

    // Build research query
    const query = `Research the company "${sanitizedCompanyName}"${domain ? ` (website: ${domain})` : ''}.

Provide factual information in these categories:

1. **About/Description**: What does this company do? (2-3 sentences)
2. **Services/Offerings**: What specific services or products do they offer? (list 3-5)
3. **Target Market**: Who are their typical customers or clients?
4. **Founded**: When was the company established?
5. **Location**: Where is the company headquartered?
6. **Differentiators**: What makes them unique compared to competitors?
7. **Credentials/Proof**: Any awards, certifications, notable clients, or recognitions?
${sanitizedIndustry ? `8. **Industry Position**: Their position in the ${sanitizedIndustry} market` : ''}

Only include information you can verify. If unsure, omit that section.`;

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: 'You are a business research analyst. Provide factual, verifiable information about companies. Be concise and accurate. If you cannot verify information, say so.' },
          { role: 'user', content: query },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error('Perplexity API error:', perplexityResponse.status, errorText);
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
    }

    const perplexityData = await perplexityResponse.json();
    const researchContent = perplexityData.choices?.[0]?.message?.content || '';

    console.log('📄 [Research] Raw response length:', researchContent.length);

    // Parse the research
    const extractedFacts = extractCompanyFacts(researchContent, sanitizedCompanyName);

    const companyResearch: CompanyResearch = {
      companyName: sanitizedCompanyName,
      website: sanitizedWebsite,
      description: extractedFacts.description || null,
      services: extractedFacts.services || [],
      targetMarket: extractedFacts.targetMarket || null,
      founded: extractedFacts.founded || null,
      location: extractedFacts.location || null,
      differentiators: extractedFacts.differentiators || [],
      publicProof: extractedFacts.publicProof || [],
      industryPosition: extractedFacts.industryPosition || null,
      confidence: extractedFacts.confidence || 'low',
    };

    console.log(`✅ [Research] Company research complete:`, {
      found: !!companyResearch.description,
      confidence: companyResearch.confidence,
      servicesFound: companyResearch.services.length,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: companyResearch,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in company-research:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to research company',
        data: null,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
