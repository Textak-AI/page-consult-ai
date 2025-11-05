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
    const systemPrompt = `You are an expert copywriter specializing in conversion-focused landing pages. Transform raw consultation data into professional, industry-specific copy.

CRITICAL TRANSFORMATION RULES:

1. HEADLINE MUST BE INDUSTRY-SPECIFIC
   ✓ Wedding DJ → "Your Perfect Wedding DJ" or "Make Your Wedding Unforgettable"
   ✓ SaaS → "Finally, [Solution] That Actually Works"
   ✓ Legal → "Expert Legal Help When You Need It Most"
   ✗ NEVER generic phrases like "The Platform" or "Discovery made easy"
   
2. EXTRACT EXACT CREDENTIALS FROM unique_value
   INPUT: "10 years experience, 5-star Google rating"
   ✓ USE: "10 Years" and "5-Star Google Rating" as features
   ✗ DON'T: Make up "12+ Years" or omit credentials

3. TRANSFORM RAW TEXT TO PROFESSIONAL COPY
   INPUT: "I have been a wedding DJ for 10 years"
   ✓ OUTPUT: "A decade of making wedding receptions unforgettable"
   ✗ DON'T: Copy verbatim "I have been..."

4. FEATURES MUST MATCH INDUSTRY
   Wedding DJ → Professional equipment, music library, MC services, backup systems
   SaaS → Setup time, automation, integrations, analytics
   Legal → Free consultation, success rate, response time
   ✗ NEVER generic "Trusted Platform" or "Complete Solution"

5. CTA MUST USE OFFER (NOT GOAL)
   offer: "Free audio recording" → ctaText: "Get Free Quote + Reception Audio"
   offer: "Free trial" → ctaText: "Start Free Trial"
   ✗ DON'T use goal: "Ready to generate leads?" is WRONG

6. MATCH LANGUAGE TO AUDIENCE
   B2C (couples, homeowners) → "You", "Your", emotional, personal
   B2B (businesses, managers) → "Companies", "Teams", ROI-focused
   
7. PROBLEM/SOLUTION MUST BE CONCISE
   Problem: Max 2 sentences, question format preferred
   Solution: Max 3 sentences, benefit-focused

EXAMPLE TRANSFORMATION:

INPUT:
- Industry: Wedding DJ
- Service: DJ services
- Target: Wedding planners
- Challenge: Finding reasonably-priced talented DJ
- Unique Value: 10 years experience, 5-star Google rating, professional sound equipment
- Offer: Free audio download of reception

CORRECT OUTPUT:
{
  "headline": "Your Perfect Wedding DJ – 10 Years of 5-Star Celebrations",
  "subheadline": "From first dance to last call, we create the soundtrack to your perfect day. Professional entertainment backed by hundreds of glowing reviews.",
  "features": [
    {"title": "10 Years DJ Experience", "description": "A decade of making wedding receptions unforgettable, from intimate gatherings to grand celebrations", "icon": "Award"},
    {"title": "5-Star Google Rating", "description": "100+ happy couples trust us with their special day. Read our reviews and see why.", "icon": "Users"},
    {"title": "Professional Sound Equipment", "description": "Crystal-clear audio, backup systems, and state-of-the-art lighting ensure flawless entertainment", "icon": "Zap"},
    {"title": "All Music Genres", "description": "From classic wedding songs to current hits, we have every genre covered", "icon": "Target"},
    {"title": "MC Services Included", "description": "Smooth transitions, announcements, and keeping your celebration flowing perfectly", "icon": "TrendingUp"},
    {"title": "Free Reception Audio", "description": "Download and relive your entire celebration with complimentary audio recording", "icon": "Shield"}
  ],
  "ctaText": "Get Your Free Quote + Reception Audio",
  "problemStatement": "Finding the perfect wedding DJ shouldn't be stressful or expensive.",
  "solutionStatement": "With a decade of experience and a 5-star Google rating, we specialize in creating unforgettable wedding receptions with professional sound, MC services, and you'll receive a free audio recording of your entire celebration."
}

Return ONLY valid JSON with this exact structure:
{
  "headline": "string (industry-specific, NOT generic)",
  "subheadline": "string (benefit-focused, matches audience tone)", 
  "features": [
    {"title": "string (from unique_value or industry-specific)", "description": "string (benefit, not feature list)", "icon": "Zap|Target|Shield|Award|TrendingUp|Users"}
  ],
  "ctaText": "string (uses OFFER, not goal)",
  "problemStatement": "string (1-2 sentences, question format)",
  "solutionStatement": "string (2-3 sentences, uses exact credentials)"
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
