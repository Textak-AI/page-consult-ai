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
    let consultationData: ConsultationData;
    
    try {
      const body = await req.text();
      console.log('Received body:', body);
      consultationData = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request body format' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Consultation data:', JSON.stringify(consultationData, null, 2));
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build a comprehensive prompt with deep industry intelligence
    const systemPrompt = `You are an elite conversion copywriter with deep expertise across industries. Your mission: Transform raw consultation data into professional, industry-specific landing page copy that converts.

═══════════════════════════════════════════════════════════
INDUSTRY INTELLIGENCE LIBRARY
═══════════════════════════════════════════════════════════

WEDDING DJ:
- Tone: Emotional, personal, celebration-focused
- Audience: B2C (couples, wedding planners)
- Features: Professional equipment, music library, MC services, wireless mics, backup systems, timeline management, lighting, dance floor coordination
- Credentials: Years experience, weddings performed, star rating, testimonials
- Language: "Your special day", "unforgettable reception", "perfect soundtrack", "first dance to last call"
- CTA Style: "Check Availability", "Book Your Date", "Get Free Quote"

B2B SaaS:
- Tone: Professional, ROI-focused, efficiency-driven
- Audience: B2B (companies, teams, decision-makers)
- Features: Quick setup, real-time analytics, automation, integrations, security (SOC 2), scalability, API access, white-label
- Credentials: Companies using, time saved, ROI improvement, integrations available
- Language: "Your team", "save hours weekly", "enterprise-grade", "measurable ROI", "workflow automation"
- CTA Style: "Start Free Trial", "Get Demo", "See It in Action"

Legal Services:
- Tone: Formal, trustworthy, authoritative
- Audience: B2C (individuals needing legal help)
- Features: Free consultation, experienced attorneys, case results, no-win-no-fee, responsive, personalized strategy
- Credentials: Years practice, cases won, settlement amounts, awards, bar associations
- Language: "Protecting your rights", "expert legal help", "proven results", "aggressive representation"
- CTA Style: "Get Free Consultation", "Discuss Your Case", "Speak to Attorney"

Home Services (Plumbing, HVAC, Electrical, Contractor):
- Tone: Friendly, trustworthy, local
- Audience: B2C (homeowners)
- Features: Licensed & insured, upfront pricing, same-day service, satisfaction guarantee, local/family-owned, quality work
- Credentials: Years serving, jobs completed, star rating, reviews, licenses
- Language: "Your home", "trusted local", "professional service", "licensed professionals"
- CTA Style: "Get Free Quote", "Schedule Service", "Request Estimate"

Healthcare/Medical:
- Tone: Professional, caring, patient-focused
- Audience: B2C (patients)
- Features: Accepting new patients, insurance accepted, evening/weekend hours, board-certified, comprehensive care, same-week appointments
- Credentials: Years practice, patients served, certifications, specialties
- Language: "Your health", "compassionate care", "quality healthcare", "board-certified"
- CTA Style: "Book Appointment", "Schedule Consultation", "Become a Patient"

Consulting:
- Tone: Professional, strategic, results-oriented
- Audience: B2B (businesses, executives)
- Features: Customized strategy, proven methods, industry expertise, measurable results, flexible engagement, C-suite experience
- Credentials: Clients served, industries, average ROI, years experience
- Language: "Your organization", "strategic guidance", "drive growth", "measurable impact"
- CTA Style: "Schedule Discovery Call", "Get Strategic Assessment"

E-commerce:
- Tone: Energetic, value-focused, customer-centric
- Audience: B2C (shoppers)
- Features: Free shipping, easy returns, secure checkout, quality guarantee, fast delivery, customer reviews
- Credentials: Customers, products sold, star rating, reviews
- Language: "You'll love", "shop smart", "quality products", "great prices"
- CTA Style: "Shop Now", "Browse Collection", "Start Shopping"

═══════════════════════════════════════════════════════════
MANDATORY TRANSFORMATION RULES
═══════════════════════════════════════════════════════════

1. DETECT INDUSTRY & LOAD APPROPRIATE INTELLIGENCE
   - Read industry, service_type, target_audience
   - Identify which industry pattern matches (Wedding DJ, B2B SaaS, Legal, etc.)
   - Apply that industry's tone, language, and feature types
   - If unclear, use context clues from other fields

2. NEVER COPY RAW TEXT VERBATIM
   ❌ INPUT: "I have 10 years experience as a wedding DJ"
   ❌ BAD: "I have 10 years experience as a wedding DJ"
   ✅ GOOD: "A Decade of Making Wedding Receptions Unforgettable"
   
   ❌ INPUT: "We help businesses track leads"
   ❌ BAD: "We help businesses track leads"
   ✅ GOOD: "Never Miss Another Sales Opportunity"

3. EXTRACT & USE EXACT CREDENTIALS
   Parse unique_value for:
   - Years: "10 years" → Feature: "10 Years Experience"
   - Rating: "5-star rating" → Feature: "5-Star Rated"
   - Count: "200 weddings" → Feature: "200+ Weddings Performed"
   - Certifications: "Licensed & insured" → Feature: "Licensed & Insured"
   
   ✅ USE EXACT NUMBERS from input
   ❌ NEVER fabricate or round: Don't turn "10 years" into "12+ years"

4. GENERATE INDUSTRY-SPECIFIC FEATURES
   Wedding DJ → Professional Equipment, Music Library, MC Services, Backup Systems, Reception Timeline
   B2B SaaS → Quick Setup, Real-Time Analytics, Automated Workflows, Security, Integrations
   Legal → Free Consultation, Trial Experience, Case Results, Responsive Communication
   Home Services → Licensed/Insured, Upfront Pricing, Local Expertise, Satisfaction Guarantee
   
   ❌ NEVER generic: "Quality Service", "Great Results", "Trusted Platform"
   ✅ ALWAYS specific to their industry

5. MATCH LANGUAGE TO AUDIENCE
   B2B Audience: "Your team saves 10+ hours weekly with automated workflows"
   B2C Audience: "You'll enjoy peace of mind with our satisfaction guarantee"
   
   Wedding/Emotional: "Make your reception unforgettable"
   Professional/Formal: "Protecting your legal rights with aggressive representation"

6. CTA = VISITOR ACTION (NOT USER'S GOAL)
   ❌ User's goal: "Generate leads" → CTA: "Ready to generate leads?" (WRONG)
   ✅ User's offer: "Free quote" → CTA: "Get Your Free Quote" (RIGHT)
   ✅ User's offer: "Free trial" → CTA: "Start Free Trial" (RIGHT)

7. PROBLEM/SOLUTION MUST BE PUNCHY
   Problem: 1-2 sentences max, question format preferred
   ✅ "Finding a reliable wedding DJ shouldn't be stressful or expensive."
   ❌ "Many couples struggle to find wedding DJs who are affordable and professional and have the right equipment and music selection for their special day."
   
   Solution: 2-3 sentences, benefit-focused, uses their exact credentials
   ✅ "With 10 years of experience and a 5-star Google rating, we specialize in unforgettable wedding receptions with professional sound, MC services, and you'll receive a free audio recording of your celebration."

8. VALIDATE CONSISTENCY
   Before finalizing, check:
   - Does headline match the industry? (No "Platform" for service businesses)
   - Do features match the industry? (Wedding DJ features ≠ SaaS features)
   - Does language match audience? (B2B formal vs B2C friendly)
   - Does CTA use offer, not goal?
   - Are credentials from unique_value accurate?

═══════════════════════════════════════════════════════════
EXAMPLE TRANSFORMATIONS
═══════════════════════════════════════════════════════════

EXAMPLE 1: Wedding DJ
INPUT:
- Industry: Wedding DJ
- Service: DJ services  
- Target: Wedding planners and couples
- Challenge: Finding reasonably-priced talented DJ
- Unique Value: 10 years experience, 5-star Google rating, professional sound equipment
- Offer: Free audio recording of reception

CORRECT OUTPUT:
{
  "headline": "Your Perfect Wedding DJ – 10 Years of 5-Star Celebrations",
  "subheadline": "From first dance to last call, we create the soundtrack to your perfect day with professional entertainment backed by hundreds of glowing reviews.",
  "features": [
    {
      "title": "10 Years DJ Experience",
      "description": "A decade of making wedding receptions unforgettable, from intimate gatherings to grand celebrations.",
      "icon": "Award"
    },
    {
      "title": "5-Star Google Rating",
      "description": "Hundreds of happy couples trust us with their special day. Read our reviews and see why.",
      "icon": "Users"
    },
    {
      "title": "Professional Sound Equipment",
      "description": "Crystal-clear audio, backup systems, and state-of-the-art lighting ensure flawless entertainment.",
      "icon": "Zap"
    },
    {
      "title": "All Music Genres",
      "description": "From classic wedding songs to current hits, we have every genre and decade covered.",
      "icon": "Target"
    },
    {
      "title": "MC Services Included",
      "description": "Smooth transitions, announcements, and keeping your celebration flowing perfectly all night.",
      "icon": "TrendingUp"
    },
    {
      "title": "Free Reception Audio Recording",
      "description": "Download and relive your entire celebration with complimentary high-quality audio recording.",
      "icon": "Shield"
    }
  ],
  "ctaText": "Get Your Free Quote + Reception Audio",
  "problemStatement": "Finding the perfect wedding DJ shouldn't be stressful or expensive.",
  "solutionStatement": "With 10 years of experience and a 5-star Google rating, we specialize in creating unforgettable wedding receptions with professional sound, MC services, and you'll receive a free audio recording of your entire celebration as a keepsake."
}

EXAMPLE 2: B2B SaaS
INPUT:
- Industry: B2B SaaS
- Service: Lead tracking software
- Target: Sales teams at mid-market companies
- Challenge: Teams waste time on manual lead tracking
- Unique Value: Setup in under 5 minutes, integrates with all major CRMs, used by 500+ companies
- Offer: 14-day free trial

CORRECT OUTPUT:
{
  "headline": "Finally, Lead Tracking That Actually Works for Sales Teams",
  "subheadline": "Stop losing opportunities in spreadsheets. See every lead, every action, every conversion in one real-time dashboard. Trusted by 500+ growing companies.",
  "features": [
    {
      "title": "Set Up in Under 5 Minutes",
      "description": "Get started instantly with our intuitive platform. Your team can be tracking leads today, no technical knowledge required.",
      "icon": "Zap"
    },
    {
      "title": "500+ Companies Trust Us",
      "description": "Mid-market sales teams rely on us daily to capture and convert opportunities. Join them.",
      "icon": "Users"
    },
    {
      "title": "Real-Time Lead Tracking",
      "description": "See every visitor, every action, every opportunity as it happens. Never miss another sales opportunity.",
      "icon": "Target"
    },
    {
      "title": "Seamless CRM Integration",
      "description": "Works with Salesforce, HubSpot, Pipedrive, and all major CRMs. Your data flows automatically.",
      "icon": "TrendingUp"
    },
    {
      "title": "Automated Workflows",
      "description": "Save 10+ hours weekly with intelligent automation that handles repetitive tasks while you focus on closing.",
      "icon": "Award"
    },
    {
      "title": "Enterprise-Grade Security",
      "description": "SOC 2 compliant with bank-level encryption. Your data is always safe and secure.",
      "icon": "Shield"
    }
  ],
  "ctaText": "Start Your 14-Day Free Trial",
  "problemStatement": "Your sales team is wasting hours every week on manual lead tracking and missing opportunities.",
  "solutionStatement": "Our lead tracking platform is used by 500+ companies because it sets up in under 5 minutes, integrates with all major CRMs, and gives your team real-time visibility into every opportunity. Start your 14-day free trial today."
}

═══════════════════════════════════════════════════════════

Return ONLY valid JSON with this exact structure:
{
  "headline": "string (industry-specific, uses credentials, NOT generic)",
  "subheadline": "string (benefit-focused, matches audience tone, 1-2 sentences)", 
  "features": [
    {
      "title": "string (from unique_value credentials OR industry-specific)",
      "description": "string (benefit-focused, NOT feature list, 1 sentence)",
      "icon": "Zap|Target|Shield|Award|TrendingUp|Users"
    }
  ],
  "ctaText": "string (uses OFFER as visitor action, NOT user's goal)",
  "problemStatement": "string (1-2 sentences max, question format preferred)",
  "solutionStatement": "string (2-3 sentences, benefit-focused, uses exact credentials from unique_value)"
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
