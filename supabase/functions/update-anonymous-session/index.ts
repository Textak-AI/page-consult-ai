import { z } from "npm:zod@3";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { sessionClient, sessionTokenSchema, lookupSession, readSessionBody, jsonRecord } from "../_shared/sessionAccess.ts";
const Body = z.object({ session_token: sessionTokenSchema, updates: z.object({
  consultation_answers: jsonRecord.optional(), approved_sections: z.union([jsonRecord, z.array(z.unknown())]).optional(),
  current_step: z.string().max(100).optional(), status: z.enum(["in_progress", "completed", "abandoned"]).optional(),
  user_email: z.string().email().max(255).optional(), last_active: z.string().optional(),
}) });
Deno.serve(async (req: Request) => {
  const preflight = handleCorsPreflightRequest(req); if (preflight) return preflight;
  const headers = { ...getCorsHeaders(req.headers.get("Origin")), "Content-Type": "application/json" };
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let body;
  try { body = Body.parse(await readSessionBody(req)); } catch { return json({ error: "Invalid session request" }, 400); }
  try {
    const client = sessionClient();
    const session = await lookupSession(client, "consultation_sessions", body.session_token, req);
    if (!session || session.user_id || session.status !== "in_progress") return json({ error: "Session unavailable" }, 404);
    const { data, error } = await client.from("consultation_sessions").update({ ...body.updates, last_active: new Date().toISOString() })
      .eq("id", session.id).is("user_id", null).eq("status", "in_progress").select("id").maybeSingle();
    if (error) throw error;
    if (!data) return json({ error: "Session unavailable" }, 409);
    return json({ success: true, session_id: session.id });
  } catch { return json({ error: "Session update failed" }, 500); }
});
