import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let input: any;
    try {
      const text = await req.text();
      input = JSON.parse(text);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { slug, time_on_page, scroll_depth, device_type, referrer_source, is_final } = input;

    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[track-prospect-view] Tracking view for slug:", slug);

    // Find prospect
    const { data: prospect, error: findError } = await supabase
      .from("prospects")
      .select("id, view_count, engagement_score, first_viewed_at, status")
      .eq("slug", slug)
      .single();

    if (findError || !prospect) {
      console.log("[track-prospect-view] Prospect not found:", slug);
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert view record (only on initial view, not final beacon)
    if (!is_final) {
      const { error: viewError } = await supabase
        .from("prospect_views")
        .insert({
          prospect_id: prospect.id,
          time_on_page,
          scroll_depth,
          device_type,
          referrer_source,
        });

      if (viewError) {
        console.error("[track-prospect-view] View insert error:", viewError);
      }
    }

    // Calculate engagement boost
    let boost = is_final ? 0 : 10; // Base boost for initial view
    if (time_on_page && time_on_page > 30) boost += 10;
    if (time_on_page && time_on_page > 60) boost += 15;
    if (time_on_page && time_on_page > 120) boost += 20;
    if (scroll_depth && scroll_depth > 25) boost += 5;
    if (scroll_depth && scroll_depth > 50) boost += 10;
    if (scroll_depth && scroll_depth > 75) boost += 15;

    // Update prospect
    const newScore = Math.min((prospect.engagement_score || 0) + boost, 200);
    const updates: Record<string, any> = {
      last_viewed_at: new Date().toISOString(),
      engagement_score: newScore,
    };

    // Only increment view count on initial view
    if (!is_final) {
      updates.view_count = (prospect.view_count || 0) + 1;
    }

    // Set first viewed timestamp if not set
    if (!prospect.first_viewed_at) {
      updates.first_viewed_at = new Date().toISOString();
      updates.status = "contacted";
    }

    // Auto-update status based on engagement
    if (newScore >= 100) {
      updates.status = "hot";
    } else if (newScore >= 50 && prospect.status !== "hot" && prospect.status !== "converted") {
      updates.status = "engaged";
    }

    const { error: updateError } = await supabase
      .from("prospects")
      .update(updates)
      .eq("id", prospect.id);

    if (updateError) {
      console.error("[track-prospect-view] Update error:", updateError);
    }

    console.log("[track-prospect-view] Updated prospect:", prospect.id, "score:", newScore);

    return new Response(JSON.stringify({ success: true, engagement_score: newScore }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[track-prospect-view] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
