import { z } from "npm:zod@3";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { sessionClient, sessionTokenSchema, jsonRecord, lookupSession, authenticatedUser, readSessionBody } from "../_shared/sessionAccess.ts";

const Updates = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant", "system"]), content: z.string().max(50000), timestamp: z.string().optional() })).max(500).optional(),
  extracted_intelligence: jsonRecord.optional(), market_research: jsonRecord.optional(), brand_assets: jsonRecord.optional(),
  readiness: z.number().min(0).max(100).optional(), message_count: z.number().int().min(0).max(10000).optional(),
  completed: z.boolean().optional(), continued_to_consultation: z.boolean().optional(),
  brand_intake_completed: z.boolean().optional(), brand_intake_at: z.string().datetime().optional(), brief_viewed_at: z.string().datetime().optional(),
});
const Body = z.object({ sessionId: sessionTokenSchema, operation: z.enum(["create", "read", "update", "claim"]).default("update"),
  updates: Updates.optional(), messages: Updates.shape.messages, extractedIntelligence: jsonRecord.optional(), marketResearch: jsonRecord.optional(),
  messageCount: Updates.shape.message_count, readiness: Updates.shape.readiness,
});

Deno.serve(async (req: Request) => {
  const preflight = handleCorsPreflightRequest(req); if (preflight) return preflight;
  const headers = { ...getCorsHeaders(req.headers.get("Origin")), "Content-Type": "application/json" };
  const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let body;
  try { body = Body.parse(await readSessionBody(req)); } catch { return json({ error: "Invalid session request" }, 400); }
  try {
    const client = sessionClient();
    let session = await lookupSession(client, "demo_sessions", body.sessionId, req);
    // A missing row may be issued only by an explicit create, never by an update/read.
    if (body.operation === "create") {
      const { data: exists, error: lookupError } = await client.from("demo_sessions").select("id").eq("session_id", body.sessionId).maybeSingle();
      if (lookupError) throw lookupError;
      if (exists && !session) return json({ error: "Session unavailable" }, 403);
      if (!exists) {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
        const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
        const ipHash = Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, "0")).join("").slice(0,16);
        const { count, error: countError } = await client.from("demo_sessions").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", new Date(Date.now()-3600000).toISOString());
        if (countError) throw countError;
        if ((count ?? 0) >= 5) return json({ error: "Rate limit exceeded", rateLimited: true }, 429);
        const { data, error } = await client.from("demo_sessions").insert({ session_id: body.sessionId, ip_hash: ipHash, ...(body.updates ?? {}) }).select("*").single();
        if (error) throw error; session = data;
      }
    }
    if (!session) return json({ error: "Session unavailable" }, 404);
    if (body.operation === "claim") {
      const user = await authenticatedUser(req, client);
      if (!user) return json({ error: "Unauthorized" }, 401);
      if (!session.claimed_by) {
        const { data, error } = await client.from("demo_sessions").update({ claimed_by: user.id, claimed_at: new Date().toISOString() }).eq("id", session.id).is("claimed_by", null).select("*").maybeSingle();
        if (error) throw error;
        if (!data) return json({ error: "Session already claimed" }, 409);
        session = data;
      }
    } else if (body.operation === "update") {
      const updates = { ...(body.updates ?? {}),
        ...(body.messages !== undefined ? { messages: body.messages } : {}),
        ...(body.extractedIntelligence !== undefined ? { extracted_intelligence: body.extractedIntelligence } : {}),
        ...(body.marketResearch !== undefined ? { market_research: body.marketResearch } : {}),
        ...(body.messageCount !== undefined ? { message_count: body.messageCount } : {}),
        ...(body.readiness !== undefined ? { readiness: body.readiness, completed: body.readiness >= 70 } : {}),
      };
      let query = client.from("demo_sessions").update(updates).eq("id", session.id).eq("session_id", body.sessionId);
      query = session.claimed_by ? query.eq("claimed_by", session.claimed_by) : query.is("claimed_by", null);
      const { data, error } = await query.select("*").maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "Session unavailable" }, 409);
      session = data;
    }
    // Never expose IP hashes or a different user's ownership information.
    const { ip_hash: _ip, ...display } = session;
    return json({ success: true, session: display });
  } catch { return json({ error: "Session operation failed" }, 500); }
});
