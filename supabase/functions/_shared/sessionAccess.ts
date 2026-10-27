import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

export const sessionTokenSchema = z.string().regex(/^(?:[0-9a-f]{64}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
export const jsonRecord = z.record(z.unknown());
export function sessionClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Session service unavailable");
  return createClient(url, key);
}
export async function authenticatedUser(req: Request, client: ReturnType<typeof sessionClient>) {
  const token = req.headers.get("Authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return null;
  const { data, error } = await client.auth.getUser(token);
  return error ? null : data.user;
}
export async function lookupSession(client: ReturnType<typeof sessionClient>, table: "guest_sessions" | "consultation_sessions" | "demo_sessions", token: string, req: Request) {
  const field = table === "demo_sessions" ? "session_id" : "session_token";
  const { data, error } = await client.from(table).select("*").eq(field, token).maybeSingle();
  if (error) throw new Error("Session lookup failed");
  if (!data) return null;
  const owner = table === "guest_sessions" ? data.converted_to_user_id : table === "demo_sessions" ? data.claimed_by : data.user_id;
  if (owner) {
    const user = await authenticatedUser(req, client);
    if (!user || user.id !== owner) return null;
  } else {
    const expiry = table === "guest_sessions" ? Date.parse(data.expires_at) : Date.parse(data.created_at) + 7 * 86400000;
    if (!Number.isFinite(expiry) || expiry <= Date.now()) return null;
  }
  return data;
}
export async function readSessionBody(req: Request) {
  const text = await req.text();
  if (text.length > 1000000) throw new Error("Request too large");
  return JSON.parse(text);
}