// Retired Nov 1, 2026. The old prospect-page path (CreateProspectPageModal -> prospect_pages) was unreachable,
// unguarded against invented claims, and read other users' demo sessions. Quick Pivot
// (generate-prospect-pivot -> prospects, served by get-prospect-page at /for/:slug) is the only prospect flow.
// This stub keeps the deployed endpoint closed until the function is deleted from the project.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return new Response(JSON.stringify({ success: false, error: "gone", message: "This endpoint has been retired." }), {
    status: 410,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
