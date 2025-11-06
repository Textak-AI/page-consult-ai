import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Industry patterns for intelligent content generation
type IndustryPattern = {
  name: string;
  tone: string;
  audienceType: string;
  targetLanguage?: {
    audience: string[];
    avoid: string[];
  };
  features: string[];
  headlineFormulas?: string[];
  ctaPatterns?: string[];
};

const industryPatterns: Record<string, IndustryPattern> = {
  wedding_dj: {
    name: "Wedding DJ",
    tone: "emotional, celebratory, romantic, warm",
    audienceType: "b2c_emotional",
    targetLanguage: {
      audience: ["couples", "brides", "grooms", "wedding planners", "engaged couples"],
      avoid: ["businesses", "companies", "clients", "ROI", "metrics"]
    },
    features: [
      "Professional DJ equipment and sound systems",
      "Extensive music library spanning all genres and decades",
      "Master of Ceremonies (MC) services",
      "Custom playlist creation and song requests",
      "Wireless microphones for speeches and toasts",
      "Mood lighting and dance floor effects",
      "Backup equipment for guaranteed reliability",
      "Reception timeline planning and coordination",
      "Smooth transitions between key moments",
      "Experience with venue acoustics"
    ],
    headlineFormulas: [
      "Your Perfect Wedding DJ - {credential}",
      "Make Your Reception Unforgettable",
      "{years} Years Creating Magical Wedding Celebrations"
    ],
    ctaPatterns: [
      "Check Availability for Your Date",
      "Book Your DJ & Get {offer}",
      "Schedule Your Free Consultation"
    ]
  },
  b2b_saas: {
    name: "B2B SaaS",
    tone: "professional, confident, roi-focused, efficient",
    audienceType: "b2b_rational",
    features: [
      "Seamless integrations with existing tools",
      "Enterprise-grade security and compliance",
      "Real-time analytics dashboard",
      "Automated workflows",
      "API access for custom integrations"
    ]
  },
  legal_services: {
    name: "Legal Services",
    tone: "authoritative, trustworthy, professional",
    audienceType: "b2c_trust",
    features: [
      "Free initial consultation",
      "Licensed attorneys",
      "Proven case outcomes",
      "Clear communication throughout"
    ]
  },
  home_services: {
    name: "Home Services",
    tone: "reliable, trustworthy, local",
    audienceType: "b2c_practical",
    features: [
      "Licensed and insured",
      "Upfront transparent pricing",
      "Same-day service available",
      "Satisfaction guarantee"
    ]
  },
  healthcare: {
    name: "Healthcare",
    tone: "caring, professional, knowledgeable",
    audienceType: "b2c_trust",
    features: [
      "Board-certified physicians",
      "Accepting new patients",
      "Most insurance accepted",
      "Evening and weekend hours"
    ]
  }
};

function detectIndustry(consultationData: ConsultationData): string {
  const industry = consultationData.industry?.toLowerCase() || '';
  const service = consultationData.service_type?.toLowerCase() || '';
  const combined = `${industry} ${service}`;
  
  if (combined.includes('wedding') || combined.includes('dj')) return 'wedding_dj';
  if (combined.includes('saas') || combined.includes('software')) return 'b2b_saas';
  if (combined.includes('legal') || combined.includes('law') || combined.includes('attorney')) return 'legal_services';
  if (combined.includes('plumb') || combined.includes('hvac') || combined.includes('electric')) return 'home_services';
  if (combined.includes('health') || combined.includes('medical') || combined.includes('doctor')) return 'healthcare';
  
  return 'b2b_saas'; // default
}

function extractCredentials(text: string) {
  const years = text.match(/(\d+)\+?\s*years?/i)?.[1];
  const rating = text.match(/(\d+(?:\.\d+)?)\s*[-\s]?star/i)?.[1];
  const count = text.match(/(\d+)\+?\s*(customer|client|wedding|project)/i)?.[1];
  return { years, rating, count };
}

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
    // Parse request body - Supabase functions.invoke sends JSON stringified body
    const bodyText = await req.text();
    console.log('Raw body received:', bodyText.substring(0, 200));
    
    let consultationData: ConsultationData;
    try {
      consultationData = JSON.parse(bodyText);
      console.log('✅ Successfully parsed consultation data:', {
        industry: consultationData.industry,
        service_type: consultationData.service_type,
        goal: consultationData.goal
      });
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('Body that failed to parse:', bodyText);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: String(parseError) }), 
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

    // Detect industry and load patterns
    const industryKey = detectIndustry(consultationData);
    const pattern = industryPatterns[industryKey];
    const credentials = extractCredentials(consultationData.unique_value || '');
    
    console.log(`Detected industry: ${industryKey}`, { pattern: pattern.name, credentials });

    // Build intelligent, pattern-based prompt
    const systemPrompt = `You are an expert landing page copywriter specializing in ${pattern.name}.

═══════════════════════════════════════════════════════════
INDUSTRY: ${pattern.name}
TONE: ${pattern.tone}
AUDIENCE TYPE: ${pattern.audienceType}
═══════════════════════════════════════════════════════════

CRITICAL TRANSFORMATION RULES:
1. NEVER copy user's exact words verbatim - always transform professionally
2. Use ONLY credentials the user actually provided
3. Match tone to ${pattern.audienceType} audience
4. Generate features from this industry-specific list:
   ${pattern.features.slice(0, 6).map((f: string, i: number) => `   ${i + 1}. ${f}`).join('\n')}

CREDENTIAL TRANSFORMATION:
User provided: ${consultationData.unique_value || 'Not specified'}
Extracted: ${credentials.years ? `${credentials.years} years` : ''} ${credentials.rating ? `${credentials.rating}-star rating` : ''} ${credentials.count ? `${credentials.count}+ projects` : ''}

${pattern.headlineFormulas ? `HEADLINE FORMULAS (choose one):
${pattern.headlineFormulas.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}` : ''}

${pattern.ctaPatterns ? `CTA PATTERNS (choose one):
${pattern.ctaPatterns.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}` : ''}

AUDIENCE LANGUAGE:
✓ Use: ${pattern.targetLanguage?.audience?.join(', ') || 'appropriate audience terms'}
✗ AVOID: ${pattern.targetLanguage?.avoid?.join(', ') || 'inappropriate terms'}

═══════════════════════════════════════════════════════════
MANDATORY OUTPUT RULES

1. NEVER COPY RAW TEXT VERBATIM
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
