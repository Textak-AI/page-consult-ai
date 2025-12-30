import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const { url, extractedBrand } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    console.log(`Analyzing website: ${normalizedUrl}`);

    // Fetch the main page
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PageConsultBot/1.0)',
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract text content
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 15000);

    // Try to fetch About page
    let aboutContent = '';
    try {
      const aboutUrls = ['/about', '/about-us', '/company', '/who-we-are'];
      for (const aboutPath of aboutUrls) {
        try {
          const aboutResponse = await fetch(`${new URL(normalizedUrl).origin}${aboutPath}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PageConsultBot/1.0)' },
          });
          if (aboutResponse.ok) {
            const aboutHtml = await aboutResponse.text();
            aboutContent = aboutHtml
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 5000);
            break;
          }
        } catch (e) { /* continue */ }
      }
    } catch (e) {
      console.log('Could not fetch about page');
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const analysisPrompt = `You are a senior landing page strategist. Analyze this website and extract everything needed for a high-converting landing page.

WEBSITE: ${normalizedUrl}
COMPANY: ${extractedBrand?.companyName || 'Unknown'}

HOMEPAGE:
${textContent}

${aboutContent ? `ABOUT PAGE:\n${aboutContent}` : ''}

CRITICAL RULES:
- NEVER invent fake testimonials, quotes, or attributions
- NEVER make up statistics, numbers, or proof points that aren't on the website
- NEVER use generic placeholder text like "Lorem ipsum" or "[Your value here]"
- If something isn't found, leave it EMPTY and add to "gaps" array with guidance
- Only include what you can actually verify from the website content
- It's better to have an empty field with guidance than fake content

For example:
- If no testimonials found → testimonials: [] (empty array) + add gap with guidance
- If no specific stats found → proofPoints: [] or only include what's actually mentioned
- If audience isn't clear → targetAudience: "" (empty) + add gap asking user to clarify

The user will fill in gaps themselves. Your job is to extract what EXISTS, not invent what doesn't.

Return JSON:

{
  "companyName": "Company name (from website)",
  "industry": "Primary industry if mentioned, or empty string",
  "targetAudience": "Only if explicitly mentioned on the site, otherwise empty string",
  "problemStatement": "Only if clearly stated on website, otherwise empty string",
  "solutionStatement": "Only if clearly stated on website, otherwise empty string",
  "uniqueDifferentiator": "Only if explicitly claimed on site, otherwise empty string",
  "proofPoints": ["Only real certifications, awards, stats actually on the website"],
  "testimonials": [{"quote": "Exact quote from website", "author": "Real name", "title": "Real title"}],
  "services": [{"name": "Service name from site", "description": "Description from site"}],
  "recommendedCTA": "Suggest based on their business type",
  "recommendedOffer": "Suggest based on their industry",
  "gaps": [
    {
      "field": "fieldName",
      "message": "What's missing",
      "guidance": "Detailed advice on how to fill this gap"
    }
  ]
}

IMPORTANT:
- Be SPECIFIC to this company
- Add to "gaps" for EVERY field you couldn't fill from the website
- For missing testimonials, include email template for requesting them
- recommendedCTA and recommendedOffer are the only fields where you can suggest (not extract)

Return ONLY valid JSON.`;


    const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: analysisPrompt }]
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.content[0].text;
    
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI analysis');
      }
    }

    // Add testimonial guidance if none found
    if (!analysis.testimonials?.length) {
      analysis.gaps = analysis.gaps || [];
      if (!analysis.gaps.find((g: any) => g.field === 'testimonials')) {
        analysis.gaps.push({
          field: 'testimonials',
          message: 'No testimonials found on your website',
          guidance: `Testimonials dramatically increase conversions. Here's how to get them:

**Email template:**
"Hi [Name], I'm updating our website and would love to include a brief quote about your experience. Would you share 1-2 sentences about [specific result]? I can draft something for your approval if easier."

**Tips:**
- Ask for specific results or numbers
- Offer to write a draft they can edit
- Request permission to use name/company
- Follow up once if no response`
        });
      }
    }

    console.log('Analysis complete:', analysis.companyName);

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
