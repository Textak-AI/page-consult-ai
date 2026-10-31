/**
 * Guards for edge functions that fetch a URL the visitor typed (website
 * analysis runs before sign-in). Two protections:
 *  - publicUrl / publicFetch: only public http(s) hosts, checked again on
 *    every redirect hop, so a typed URL can't reach internal addresses.
 *  - rateLimit: per-IP hourly cap so anonymous callers can't spend the
 *    AI budget in a loop. Fails open if the table is missing, so a deploy
 *    before the migration never breaks intake.
 */

const PRIVATE_V4 = [
  /^0\./, /^10\./, /^127\./, /^169\.254\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, /^(22[4-9]|2[3-5]\d)\./,
];

/** Normalized URL string when the host is public, else null. */
export function publicUrl(raw: string): string | null {
  try {
    const text = String(raw || '').trim();
    const u = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
    if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password) return null;
    if (u.port && !['80', '443'].includes(u.port)) return null;
    const h = u.hostname.toLowerCase().replace(/\.$/, '');
    if (!h || !h.includes('.')) return null; // bare names resolve inside the network
    if (h === 'localhost' || /\.(localhost|local|internal|lan|home|corp|intranet)$/.test(h)) return null;
    if (h.startsWith('[') || h.includes(':')) return null; // IPv6 literal
    if (/^\d+(\.\d+){3}$/.test(h) && PRIVATE_V4.some((r) => r.test(h))) return null;
    if (/^\d+$/.test(h) || /^0x/i.test(h)) return null; // integer / hex IP forms
    return u.href;
  } catch {
    return null;
  }
}

export class BlockedUrlError extends Error {
  constructor() { super('That address is not a public website.'); this.name = 'BlockedUrlError'; }
}

/** fetch that re-checks the host on every redirect (max 5 hops). */
export async function publicFetch(raw: string, init: RequestInit = {}): Promise<Response> {
  let url = publicUrl(raw);
  for (let hop = 0; hop < 6; hop++) {
    if (!url) throw new BlockedUrlError();
    const res = await fetch(url, { ...init, redirect: 'manual' });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      url = publicUrl(new URL(res.headers.get('location')!, url).href);
      continue;
    }
    return res;
  }
  throw new Error('Too many redirects');
}

async function hashKey(value: string): Promise<string> {
  const data = new TextEncoder().encode(`${value}|pc-rate`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
}

export function callerIp(req: Request): string {
  return (req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown').trim();
}

/**
 * Counts this caller's calls to `fn` in the last hour and records this one.
 * Returns true when the call may proceed.
 */
// deno-lint-ignore no-explicit-any
export async function rateLimit(serviceClient: any, req: Request, fn: string, perHour: number): Promise<boolean> {
  try {
    const key = await hashKey(callerIp(req));
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count, error } = await serviceClient
      .from('edge_rate_limits').select('id', { count: 'exact', head: true })
      .eq('fn', fn).eq('caller_hash', key).gte('created_at', since);
    if (error) { console.warn(`⏱️ [rateLimit] ${fn} check skipped: ${error.message}`); return true; }
    if ((count ?? 0) >= perHour) { console.warn(`⏱️ [rateLimit] ${fn} limit hit caller=${key}`); return false; }
    await serviceClient.from('edge_rate_limits').insert({ fn, caller_hash: key });
    return true;
  } catch (e) {
    console.warn(`⏱️ [rateLimit] ${fn} check skipped:`, e instanceof Error ? e.message : e);
    return true;
  }
}

export function rateLimitedResponse(corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify({ success: false, error: 'rate_limited', message: 'Too many website checks from this connection. Please try again in an hour.' }), {
    status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function blockedUrlResponse(corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify({ success: false, error: 'blocked_url', message: 'Enter a public website address.' }), {
    status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
