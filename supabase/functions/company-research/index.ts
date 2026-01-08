import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

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

// Clean text helper - strips citations, markdown, etc.
function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\[\d+(?:,\s*\d+)*\]/g, '')  // Remove citation brackets [1], [1, 2], etc.
    .replace(/\[\d+\]/g, '')               // Remove single citations [1]
    .replace(/^\*+\s*/gm, '')              // Remove leading asterisks
    .replace(/^#+\s*\d*\.?\s*/gm, '')      // Remove markdown headers like "## 1. "
    .replace(/\*\*/g, '')                  // Remove bold markdown
    .replace(/\s+/g, ' ')                  // Normalize whitespace
    .trim();
}

// Filter out contact info from services
function filterServices(services: string[]): string[] {
  const excludePatterns = [
    /phone:/i,
    /website:/i,
    /contact/i,
    /email:/i,
    /^\(\d{3}\)/,           // Phone numbers like (855)
    /^www\./i,
    /^https?:/i,
    /^\d{3}[.-]\d{3}/,      // Phone patterns
    /\.com\b/i,
    /\.org\b/i,
    /\.net\b/i,
    /^tel:/i,
    /^fax:/i,
  ];
  
  return services.filter(service => 
    !excludePatterns.some(pattern => pattern.test(service)) &&
    service.length > 5 &&
    service.length < 100
  );
}

// Parse a markdown section - get content AFTER the header
function parseMarkdownSection(text: string, sectionPatterns: string[]): string {
  for (const pattern of sectionPatterns) {
    // Match various header formats: "## 1. Market Size", "**Market Size**", "Market Size:", etc.
    const headerRegex = new RegExp(
      `(?:^|\\n)(?:#{1,3}\\s*)?(?:\\d+\\.?\\s*)?(?:\\*\\*)?${pattern}(?:\\*\\*)?[:\\s]*(?:\\n|$)([\\s\\S]*?)(?=\\n(?:#{1,3}|\\d+\\.|\\*\\*[A-Z])|$)`,
      'i'
    );
    
    const match = text.match(headerRegex);
    if (match && match[1]) {
      const content = match[1].trim();
      // Skip if we just got another header or very short content
      if (content.length > 20 && !content.match(/^(?:#{1,3}|\d+\.|\*\*)/)) {
        // Get first meaningful paragraph (up to 300 chars)
        const lines = content.split('\n').filter(l => l.trim().length > 0);
        const firstParagraph = lines.slice(0, 3).join(' ');
        return cleanText(firstParagraph).slice(0, 300);
      }
    }
  }
  return '';
}

// Extract list items from a section
function parseListSection(text: string, sectionPatterns: string[]): string[] {
  const items: string[] = [];
  
  for (const pattern of sectionPatterns) {
    const headerRegex = new RegExp(
      `(?:^|\\n)(?:#{1,3}\\s*)?(?:\\d+\\.?\\s*)?(?:\\*\\*)?${pattern}(?:\\*\\*)?[:\\s]*(?:\\n|$)([\\s\\S]*?)(?=\\n(?:#{1,3}|\\d+\\.|\\*\\*[A-Z])|$)`,
      'i'
    );
    
    const match = text.match(headerRegex);
    if (match && match[1]) {
      const content = match[1].trim();
      const lines = content.split('\n');
      
      for (const line of lines) {
        // Match list items: "- item", "* item", "• item", "1. item"
        const itemMatch = line.match(/^(?:[-•*]\s*|\d+\.\s*)(.+)/);
        if (itemMatch && itemMatch[1]) {
          const cleaned = cleanText(itemMatch[1]);
          if (cleaned.length > 5 && cleaned.length < 150 && items.length < 5) {
            items.push(cleaned);
          }
        } else if (line.trim().length > 10 && items.length < 5) {
          // Non-list line that's still content
          const cleaned = cleanText(line);
          if (cleaned.length > 5 && cleaned.length < 150) {
            items.push(cleaned);
          }
        }
      }
      
      if (items.length > 0) break;
    }
  }
  
  return items;
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
  console.log('📄 [Research] Parsing response, first 500 chars:', text.slice(0, 500));
  
  const result: Partial<CompanyResearch> = {
    services: [],
    differentiators: [],
    publicProof: [],
    confidence: 'low',
  };

  // Extract description
  result.description = parseMarkdownSection(text, [
    'About', 'Description', 'Overview', 'Company Overview', 'About/Description'
  ]);

  // Extract services
  const rawServices = parseListSection(text, [
    'Services', 'Offerings', 'Products', 'Solutions', 'Services/Offerings'
  ]);
  result.services = filterServices(rawServices).map(cleanText);

  // Extract target market
  result.targetMarket = parseMarkdownSection(text, [
    'Target Market', 'Target Customers', 'Clients', 'Customer Base', 'Typical Customers'
  ]);

  // Extract location
  result.location = parseMarkdownSection(text, [
    'Location', 'Headquarters', 'Based', 'Headquartered'
  ]);

  // Extract differentiators
  result.differentiators = parseListSection(text, [
    'Differentiators', 'Unique', 'What Makes Them Unique', 'Competitive Advantage'
  ]).slice(0, 3);

  // Extract proof/credentials
  result.publicProof = parseListSection(text, [
    'Credentials', 'Awards', 'Certifications', 'Recognition', 'Notable Clients', 'Proof'
  ]).slice(0, 5);

  // Extract industry position
  result.industryPosition = parseMarkdownSection(text, [
    'Industry Position', 'Market Position', 'Competitive Position'
  ]);

  // Extract founded year - look for patterns like "Founded: 2015" or "established in 2015"
  const foundedMatch = text.match(/(?:founded|established|since|started)[:\s]+(?:in\s+)?(\d{4})/i);
  if (foundedMatch) {
    result.founded = foundedMatch[1];
  }

  // Determine confidence level
  const hasDescription = !!result.description && result.description.length > 30;
  const hasServices = (result.services?.length || 0) > 0;
  const hasTarget = !!result.targetMarket && result.targetMarket.length > 20;
  const hasDifferentiators = (result.differentiators?.length || 0) > 0;

  if (hasDescription && hasServices && (hasTarget || hasDifferentiators)) {
    result.confidence = 'high';
  } else if (hasDescription || (hasServices && hasTarget)) {
    result.confidence = 'medium';
  }

  console.log('📊 [Research] Extracted:', {
    description: result.description?.slice(0, 50),
    services: result.services?.length,
    targetMarket: result.targetMarket?.slice(0, 50),
    confidence: result.confidence,
  });

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

    // Build research query with clearer instructions
    const query = `Research the company "${sanitizedCompanyName}"${domain ? ` (website: ${domain})` : ''}.

Return information in this exact format with detailed content under each header (not just the header label):

## About/Description
Write 2-3 sentences describing what this company does and their core focus.

## Services/Offerings
List 3-5 specific services or products they offer. Do NOT include contact information, phone numbers, or website URLs.

## Target Market
Describe their typical customers: industry, company size, decision-maker roles.

## Founded
When was the company established? (year only)

## Location
Where is the company headquartered?

## Differentiators
What makes them unique compared to competitors? List 2-3 points.

## Credentials/Proof
Any awards, certifications, notable clients, or recognitions.
${sanitizedIndustry ? `\n## Industry Position\nTheir position in the ${sanitizedIndustry} market.` : ''}

IMPORTANT: Only include verifiable information. Write actual content under each header, not just labels. Do not include phone numbers, emails, or website URLs in any section.`;

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { 
            role: 'system', 
            content: 'You are a business research analyst. Provide factual, verifiable information about companies. Write detailed paragraphs under each section header. Never include contact information like phone numbers or emails. Be concise and accurate.' 
          },
          { role: 'user', content: query },
        ],
        temperature: 0.1,
        max_tokens: 1200,
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
