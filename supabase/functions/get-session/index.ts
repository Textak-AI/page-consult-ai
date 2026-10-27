import { z } from "npm:zod@3";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { sessionClient, sessionTokenSchema, lookupSession, readSessionBody } from "../_shared/sessionAccess.ts";
Deno.serve(async (req: Request) => {
  const preflight = handleCorsPreflightRequest(req); if (preflight) return preflight;
  const headers = { ...getCorsHeaders(req.headers.get("Origin")), "Content-Type": "application/json" };
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
  if (req.method !== "POST") return json({ error: "Explicit session token required" }, 400);
  let token;
  try { token = z.object({ session_token: sessionTokenSchema }).parse(await readSessionBody(req)).session_token; }
  catch { return json({ error: "Invalid session token" }, 400); }
  try {
    const client = sessionClient();
    const session = await lookupSession(client, "consultation_sessions", token, req);
    if (!session || session.status !== "in_progress") return json({ error: "Session unavailable" }, 404);
    return json({ session_token: token, session_id: session.id, user_email: session.user_email,
      current_step: session.current_step, consultation_answers: session.consultation_answers,
      approved_sections: session.approved_sections, status: session.status });
  } catch { return json({ error: "Session lookup failed" }, 500); }
});
