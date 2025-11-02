import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResearchRequest {
  service: string;
  location?: string;
  industry: string;
  concerns?: string;
}

interface MarketInsights {
  statistics: string[];
  keyPoints: string[];
  fullText: string;
  structuredData: {
    costOfDelay?: string;
    roi?: string;
    marketSize?: string;
    failureRate?: string;
    propertyValue?: string;
  };
}

function parseMarketData(text: string): MarketInsights {
  // Extract statistics, percentages, and dollar amounts
  const stats = text.match(/\d+(?:\.\d+)?%|\$[\d,]+(?:\.\d+)?[KMB]?|\d+(?:,\d{3})*(?:\.\d+)?/g) || [];
  
  // Extract bullet points
  const lines = text.split('\n');
  const bulletPoints = lines
    .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().match(/^\d+\./))
    .map(line => line.trim());
  
  // Try to extract structured data
  const structuredData: MarketInsights['structuredData'] = {};
  
  // Look for cost patterns
  const costMatch = text.match(/(?:cost|delay|repair).*?\$?([\d,]+(?:\.\d+)?[KMB]?)/i);
  if (costMatch) structuredData.costOfDelay = costMatch[1];
  
  // Look for ROI/property value
  const roiMatch = text.match(/(?:ROI|property value|adds).*?\$?([\d,]+(?:\.\d+)?[KMB]?)/i);
  if (roiMatch) structuredData.propertyValue = roiMatch[1];
  
  // Look for failure rates
  const failureMatch = text.match(/(\d+(?:\.\d+)?)%.*?(?:fail|crack|problem)/i);
  if (failureMatch) structuredData.failureRate = failureMatch[1] + '%';
  
  return {
    statistics: stats,
    keyPoints: bulletPoints,
    fullText: text,
    structuredData
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { service, location, industry, concerns }: ResearchRequest = await req.json();
    
    console.log('Research request:', { service, location, industry, concerns });
    
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }
    
    const currentYear = new Date().getFullYear();
    const locationContext = location ? `in ${location}` : '';
    
    // Build comprehensive query
    const query = `Provide specific, current statistics and data points for ${service} businesses ${locationContext}. 
Focus on providing actual numbers for:
1. Average cost to homeowners when delaying or avoiding professional ${service} (specific dollar amounts)
2. Percentage of DIY or poor quality ${service} that fails or needs repair within 5 years
3. Property value increase or ROI from professional ${service} (dollar amounts per sq ft or percentage)
4. ${location ? `Local market size and demand for ${service} in ${location}` : `Market size for ${service}`}
5. Common pain points and problems that occur without professional service

Please provide specific numbers, percentages, and dollar amounts. Focus on ${currentYear} data when available.`;

    console.log('Calling Perplexity API with query:', query);

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{
          role: 'user',
          content: query
        }],
        temperature: 0.2,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Perplexity response:', data);
    
    const insights = data.choices[0].message.content;
    const parsedData = parseMarketData(insights);

    return new Response(
      JSON.stringify({
        success: true,
        insights: parsedData,
        raw: insights
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in perplexity-research function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        fallback: true
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
