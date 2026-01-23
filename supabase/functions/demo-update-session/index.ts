import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const { sessionId, messages, extractedIntelligence, marketResearch, messageCount, readiness } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get IP hash from request (for rate limiting)
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    const ipHash = await hashString(ip);

    // Check rate limit (5 sessions per IP per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('demo_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo);

    if (count && count >= 5) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', rateLimited: true }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Security: Check if this session exists and validate IP hash to prevent session hijacking
    const { data: existingSession } = await supabase
      .from('demo_sessions')
      .select('ip_hash')
      .eq('session_id', sessionId)
      .maybeSingle();

    // If session exists, verify the IP hash matches (prevent session hijacking)
    if (existingSession && existingSession.ip_hash && existingSession.ip_hash !== ipHash) {
      console.warn(`[Security] Session hijacking attempt detected for session ${sessionId}. Expected IP hash: ${existingSession.ip_hash}, Got: ${ipHash}`);
      return new Response(
        JSON.stringify({ error: 'Session validation failed' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate readiness score if not provided
    const calculatedReadiness = readiness ?? (extractedIntelligence ? calculateReadinessFromIntel(extractedIntelligence) : 0);

    // Upsert session (only if IP hash matches or session is new)
    const { error } = await supabase
      .from('demo_sessions')
      .upsert({
        session_id: sessionId,
        messages: messages || [],
        extracted_intelligence: extractedIntelligence || {},
        market_research: marketResearch || {},
        message_count: messageCount || 0,
        ip_hash: ipHash,
        readiness: calculatedReadiness,
        completed: calculatedReadiness >= 70,
      }, { onConflict: 'session_id' });

    if (error) {
      console.error('Error upserting session:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in demo-update-session:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Calculate readiness score from extracted intelligence
function calculateReadinessFromIntel(intel: Record<string, unknown>): number {
  let score = 0;
  if (intel.industry) score += 15;
  if (intel.audience) score += 15;
  if (intel.valueProp) score += 15;
  if (intel.competitorDifferentiator) score += 10;
  if (intel.painPoints) score += 10;
  if (intel.buyerObjections) score += 10;
  if (intel.proofElements) score += 10;
  return score;
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}
