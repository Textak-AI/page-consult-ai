import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  pageId: string;
  currentFaqCount: number;
  targetCount: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pageId, currentFaqCount, targetCount } = await req.json() as RequestBody;
    
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
      `${SUPABASE_URL}/rest/v1/landing_pages?id=eq.${pageId}&select=*,consultations(*)`,
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
    const consultation = page.consultations || page.consultation_data || {};
    
    const numToGenerate = Math.max(0, targetCount - currentFaqCount);
    
    if (numToGenerate === 0) {
      return new Response(JSON.stringify({ success: true, faqItems: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Generate FAQs using AI
    const prompt = `Generate ${numToGenerate} FAQ items for a ${consultation.industry || 'business'} website.
    
Business context:
- Industry: ${consultation.industry || 'General'}
- Service: ${consultation.service_type || consultation.offer || 'Professional services'}
- Target audience: ${consultation.target_audience || 'Business clients'}
- Unique value: ${consultation.unique_value || 'Quality service'}

Generate FAQs that address:
1. Common objections potential clients have
2. Process and timeline questions
3. Pricing and investment questions
4. Results and outcomes questions

Return ONLY a JSON array of objects with "question" and "answer" fields. Each answer should be 2-3 sentences.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert at creating FAQ content that helps businesses get discovered by AI assistants. Generate clear, concise FAQs." },
          { role: "user", content: prompt },
        ],
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate FAQs");
    }
    
    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";
    
    // Parse the JSON from the response
    let newFaqItems = [];
    try {
      // Extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        newFaqItems = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse FAQ JSON:", e);
      throw new Error("Failed to parse generated FAQs");
    }
    
    // Add source field to each item
    newFaqItems = newFaqItems.map((item: { question: string; answer: string }, index: number) => ({
      question: item.question,
      answer: item.answer,
      source: index < 2 ? 'objection' : index < 4 ? 'process' : 'industry_common',
    }));
    
    // Get current AI SEO data and merge new FAQs
    const currentAiSeoData = consultation.ai_seo_data || { faqItems: [] };
    const updatedFaqItems = [...(currentAiSeoData.faqItems || []), ...newFaqItems];
    
    // Update the consultation with new FAQ items
    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/consultations?id=eq.${page.consultation_id}`,
      {
        method: "PATCH",
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          ai_seo_data: {
            ...currentAiSeoData,
            faqItems: updatedFaqItems,
          },
        }),
      }
    );
    
    if (!updateResponse.ok) {
      console.error("Failed to update consultation:", await updateResponse.text());
      throw new Error("Failed to save FAQ items");
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      faqItems: newFaqItems,
      totalFaqCount: updatedFaqItems.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error generating FAQ content:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
