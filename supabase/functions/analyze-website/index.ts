import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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

Return JSON:

{
  "companyName": "Company name",
  "industry": "Primary industry (e.g., Environmental Services, SaaS, Healthcare)",
  "targetAudience": "Specific description of ideal customer - job titles, company types, situations they're in",
  "problemStatement": "The painful problem customers face. Write from customer's perspective. 2-3 sentences.",
  "solutionStatement": "How they solve it - focus on transformation and outcomes, not just features. 2-3 sentences.",
  "uniqueDifferentiator": "What makes them different from competitors? Why choose them? Be specific.",
  "proofPoints": ["Certifications", "Awards", "Stats", "Years in business", "Notable clients"],
  "testimonials": [{"quote": "...", "author": "Name", "title": "Title"}],
  "services": [{"name": "Service", "description": "Brief description"}],
  "recommendedCTA": "Best call-to-action for this business",
  "recommendedOffer": "What they should offer to capture leads",
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
- If something isn't found, add to "gaps" with actionable guidance
- For missing testimonials, include email template for requesting them
- Write problem/solution that would resonate with target audience

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
