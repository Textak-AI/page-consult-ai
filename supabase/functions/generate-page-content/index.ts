import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConsultationData {
  industry?: string;
  service_type?: string;
  goal?: string;
  target_audience?: string;
  challenge?: string;
  unique_value?: string;
  offer?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const consultationData: ConsultationData = await req.json();
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build a comprehensive prompt that understands the business
    const systemPrompt = `You are an expert copywriter and marketing consultant. Your job is to transform raw consultation answers into professional, compelling landing page content.

CRITICAL RULES:
1. READ the consultation answers carefully - understand what they actually do
2. NEVER copy consultation text verbatim - transform it into professional marketing copy
3. UNDERSTAND industry context - a wedding DJ needs wedding language, not generic business terms
4. GENERATE specific, relevant features based on what they told you
5. USE their credentials and unique value properly
6. NO fake urgency or made-up stats - only use what they provided

Example transformation:
INPUT: "Wedding DJ with 10 years experience and 5-star Google rating"
OUTPUT: {
  headline: "Your Perfect Wedding DJ – 10 Years of 5-Star Celebrations",
  subheadline: "Professional entertainment backed by hundreds of delighted couples and a spotless 5-star reputation",
  features: [
    { title: "10 Years of Experience", description: "A decade of making wedding receptions unforgettable, from intimate gatherings to grand celebrations" },
    { title: "5-Star Google Rating", description: "Hundreds of happy couples trust us with their special day. Read our reviews and see why." },
    { title: "Professional Equipment", description: "State-of-the-art sound and lighting systems ensure your reception sounds and looks amazing" }
  ]
}

Return ONLY valid JSON with this exact structure:
{
  "headline": "string",
  "subheadline": "string", 
  "features": [
    {"title": "string", "description": "string", "icon": "Zap|Target|Shield|Award|TrendingUp|Users"}
  ],
  "ctaText": "string",
  "problemStatement": "string (question format)",
  "solutionStatement": "string"
}`;

    const userPrompt = `Transform this consultation data into professional landing page content:

Industry: ${consultationData.industry || 'Not specified'}
Service Type: ${consultationData.service_type || 'Not specified'}
Target Audience: ${consultationData.target_audience || 'Not specified'}
Challenge/Problem: ${consultationData.challenge || 'Not specified'}
Unique Value: ${consultationData.unique_value || 'Not specified'}
Offer: ${consultationData.offer || 'Not specified'}
Goal: ${consultationData.goal || 'Not specified'}

Generate compelling, industry-specific content that:
1. Uses the actual service/credentials they mentioned
2. Creates relevant features for their specific industry
3. Transforms their unique value into professional copy
4. Makes a problem statement that resonates with their audience
5. Creates a solution statement that highlights their specific advantages

Return valid JSON only.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Using fallback content generation.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Using fallback content generation.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    let parsedContent;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsedContent = JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', content);
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format', rawContent: content }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the response has required fields
    if (!parsedContent.headline || !parsedContent.features || !Array.isArray(parsedContent.features)) {
      console.error('AI response missing required fields:', parsedContent);
      return new Response(
        JSON.stringify({ error: 'Incomplete AI response', rawContent: parsedContent }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, content: parsedContent }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-page-content function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
