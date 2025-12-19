import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  pageId: string;
  recommendationId: string;
  currentValue?: string;
  suggestedAction?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pageId, recommendationId, currentValue, suggestedAction } = await req.json() as RequestBody;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }
    
    // Fetch the landing page data
    const pageResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/landing_pages?id=eq.${pageId}&select=*`,
      {
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    
    const pages = await pageResponse.json();
    if (!pages || pages.length === 0) {
      throw new Error("Page not found");
    }
    
    const page = pages[0];
    const sections = page.sections || [];
    const consultationData = page.consultation_data || {};
    
    // Determine what to improve based on recommendationId
    let prompt = "";
    let fieldToUpdate = "";
    
    if (recommendationId.includes("headline") || recommendationId.includes("content")) {
      prompt = `Improve this headline to be more specific and impactful for AI discoverability.

Current headline: "${currentValue || ''}"
Business context:
- Industry: ${consultationData.industry || 'General'}
- Service: ${consultationData.offer || 'Professional services'}
- Target audience: ${consultationData.target_audience || 'Business clients'}
- Unique value: ${consultationData.unique_value || 'Quality service'}

Requirements:
1. Start with the outcome or benefit (answer-first)
2. Include specific numbers or timeframes if possible
3. Keep it under 60 characters
4. Make it memorable and distinct

Return ONLY the improved headline text, nothing else.`;
      fieldToUpdate = "headline";
    } else if (recommendationId.includes("vague")) {
      prompt = `Make this content more specific with concrete numbers and claims.

Current content: "${currentValue || ''}"
Business context:
- Industry: ${consultationData.industry || 'General'}
- Service: ${consultationData.offer || 'Professional services'}

Replace vague words like "many", "fast", "quality" with specific numbers and timeframes.
Return ONLY the improved text, nothing else.`;
      fieldToUpdate = "content";
    }
    
    // Generate improved content using AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert copywriter specializing in AI-optimized content. Create clear, specific, citation-worthy copy." },
          { role: "user", content: prompt },
        ],
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate content improvement");
    }
    
    const aiResult = await response.json();
    const improvedContent = aiResult.choices?.[0]?.message?.content?.trim() || "";
    
    if (!improvedContent) {
      throw new Error("No content generated");
    }
    
    // Update the page sections with improved content
    let updatedSections = sections;
    if (fieldToUpdate === "headline") {
      updatedSections = sections.map((section: { type: string; content?: { headline?: string } }) => {
        if (section.type === "hero" && section.content) {
          return {
            ...section,
            content: {
              ...section.content,
              headline: improvedContent,
            },
          };
        }
        return section;
      });
    }
    
    // Update the landing page
    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/landing_pages?id=eq.${pageId}`,
      {
        method: "PATCH",
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          sections: updatedSections,
        }),
      }
    );
    
    if (!updateResponse.ok) {
      console.error("Failed to update page:", await updateResponse.text());
      throw new Error("Failed to save content improvement");
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      field: fieldToUpdate,
      previousValue: currentValue,
      newValue: improvedContent,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error improving content:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
