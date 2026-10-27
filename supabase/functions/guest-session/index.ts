import { z } from "npm:zod@3";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { sessionClient, sessionTokenSchema, lookupSession, readSessionBody, authenticatedUser, jsonRecord } from "../_shared/sessionAccess.ts";

const Body = z.object({
  operation: z.enum(["create", "read", "update", "migrate", "read-consultation", "update-consultation"]),
  session_token: sessionTokenSchema.optional(), consultation_id: z.string().uuid().optional(),
  updates: z.object({ email: z.string().email().max(255).optional(), consultation_data: jsonRecord.optional(), intelligence_state: jsonRecord.optional(), generated_brief_id: z.string().uuid().optional(), generated_page_id: z.string().uuid().optional() }).optional(),
  consultation_updates: z.object({
    industry: z.string().max(500).optional(), goal: z.string().max(5000).optional(), target_audience: z.string().max(5000).optional(),
    challenge: z.string().max(20000).optional(), unique_value: z.string().max(20000).optional(),
    extracted_intelligence: jsonRecord.optional(), strategy_brief: z.union([jsonRecord, z.string().max(200000)]).optional(),
    flow_state: z.string().max(100).optional(), flow_history: z.array(jsonRecord).max(500).optional(),
    last_huddle_type: z.string().max(100).optional(), last_huddle_at: z.string().datetime().optional(),
    readiness_score: z.number().min(0).max(100).optional(),
    communication_style: jsonRecord.optional(), business_name: z.string().max(255).optional(), website_url: z.string().url().max(2048).optional(),
    card_notes: jsonRecord.optional(), active_brief_version: z.number().int().min(0).optional(), brief_versions: z.array(jsonRecord).max(100).optional(),
  }).optional(),
});
Deno.serve(async (req: Request) => {
  const preflight = handleCorsPreflightRequest(req); if (preflight) return preflight;
  const headers = { ...getCorsHeaders(req.headers.get("Origin")), "Content-Type": "application/json" };
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let body;
  try { body = Body.parse(await readSessionBody(req)); } catch { return json({ error: "Invalid session request" }, 400); }
  try {
    const client = sessionClient();
    if (body.operation === "create") {
      // Issue the credential on the server; never accept a caller's existing record identifier.
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, "0")).join("");
      const { data, error } = await client.from("guest_sessions").insert({ session_token: token }).select("*").single();
      if (error) throw error;
      return json({ session: data });
    }
    if (!body.session_token) return json({ error: "Session token required" }, 400);
    const session = await lookupSession(client, "guest_sessions", body.session_token, req);
    if (!session) return json({ error: "Session unavailable" }, 404);
    if (body.operation === "read") return json({ session });
    if (body.operation === "update") {
      if (session.converted_to_user_id) return json({ error: "Session already migrated" }, 403);
      for (const pageId of [body.updates?.generated_brief_id, body.updates?.generated_page_id]) {
        if (!pageId) continue;
        const { data: page, error: pageError } = await client.from("landing_pages").select("consultation_id").eq("id", pageId).maybeSingle();
        if (pageError) throw pageError;
        if (!page?.consultation_id) return json({ error: "Page not linked to guest session" }, 403);
        const { data: linked, error: linkError } = await client.from("consultations").select("id").eq("id", page.consultation_id).eq("guest_session_id", session.id).is("user_id", null).maybeSingle();
        if (linkError) throw linkError;
        if (!linked) return json({ error: "Page not linked to guest session" }, 403);
      }
      const { data, error } = await client.from("guest_sessions").update(body.updates ?? {}).eq("id", session.id).is("converted_to_user_id", null).select("*").maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "Session unavailable" }, 409);
      return json({ session: data });
    }
    if (body.operation === "migrate") {
      const user = await authenticatedUser(req, client);
      if (!user) return json({ error: "Unauthorized" }, 401);
      if (!session.converted_to_user_id) {
        const { data, error } = await client.from("guest_sessions").update({ converted_to_user_id: user.id, converted_at: new Date().toISOString() })
          .eq("id", session.id).is("converted_to_user_id", null).select("id").maybeSingle();
        if (error) throw error;
        if (!data) return json({ error: "Session already claimed" }, 409);
      }
      const { error } = await client.from("consultations").update({ user_id: user.id }).eq("guest_session_id", session.id).is("user_id", null);
      if (error) throw error;
      // Only move pages actually linked to this guest's consultations, not arbitrary saved IDs.
      const { data: consultations, error: queryError } = await client.from("consultations").select("id").eq("guest_session_id", session.id).eq("user_id", user.id);
      if (queryError) throw queryError;
      const ids = (consultations ?? []).map(row => row.id);
      let pageMigrated = false;
      if (ids.length) {
        const { data: pages, error: pageError } = await client.from("landing_pages").update({ user_id: user.id }).in("consultation_id", ids).is("user_id", null).select("id");
        if (pageError) throw pageError;
        pageMigrated = Boolean(pages?.length);
      }
      const { error: leadError } = await client.from("leads").update({ converted_to_user_id: user.id, converted_at: new Date().toISOString() }).eq("guest_session_id", session.id).is("converted_to_user_id", null);
      if (leadError) throw leadError;
      return json({ success: true, migratedItems: { consultation: true, brief: pageMigrated, page: pageMigrated, lead: true } });
    }
    if (!body.consultation_id) return json({ error: "Consultation ID required" }, 400);
    const { data: consultation, error } = await client.from("consultations").select("*").eq("id", body.consultation_id).eq("guest_session_id", session.id).maybeSingle();
    if (error) throw error;
    if (!consultation || consultation.user_id) return json({ error: "Consultation unavailable" }, 404);
    if (body.operation === "read-consultation") return json({ consultation });
    const { data: updated, error: updateError } = await client.from("consultations").update(body.consultation_updates ?? {})
      .eq("id", consultation.id).eq("guest_session_id", session.id).is("user_id", null).select("*").maybeSingle();
    if (updateError) throw updateError;
    return updated ? json({ consultation: updated }) : json({ error: "Consultation unavailable" }, 409);
  } catch { return json({ error: "Session operation failed" }, 500); }
});