import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Validation schema - only allow safe fields to be updated
const UpdateSessionSchema = z.object({
  session_token: z.string().uuid('Invalid session token format'),
  updates: z.object({
    consultation_answers: z.record(z.any()).optional(),
    approved_sections: z.record(z.any()).optional(),
    current_step: z.string().optional(),
    status: z.enum(['in_progress', 'completed', 'abandoned']).optional(),
    user_email: z.string().email().optional(),
    last_active: z.string().optional(),
  }).optional(),
});

const allowedOrigins = [
  'https://page-consult-ai.lovable.app',
  'https://preview--page-consult-ai.lovable.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080'
];

const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
});

serve(async (req) => {
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('JSON parse error:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Validate request body against schema
    const validation = UpdateSessionSchema.safeParse(requestBody);
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid request format', details: validation.error.errors }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const { session_token, updates } = validation.data;

    // Also verify from cookie for extra security
    const cookieHeader = req.headers.get('cookie');
    let cookieToken: string | null = null;
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      cookieToken = cookies['session_token'] || null;
    }

    // Security: Verify the session_token matches the cookie if present
    if (cookieToken && cookieToken !== session_token) {
      console.warn('Session token mismatch - possible attack attempt');
      return new Response(
        JSON.stringify({ error: 'Session token mismatch' }),
        { status: 403, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with SERVICE_ROLE_KEY to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First verify this is an anonymous session (user_id IS NULL)
    const { data: existingSession, error: fetchError } = await supabaseClient
      .from('consultation_sessions')
      .select('id, user_id')
      .eq('session_token', session_token)
      .maybeSingle();

    if (fetchError) {
      console.error('Database fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify session' }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    if (!existingSession) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Security: Only allow updates to anonymous sessions via this endpoint
    if (existingSession.user_id !== null) {
      console.warn('Attempt to update non-anonymous session via anonymous endpoint');
      return new Response(
        JSON.stringify({ error: 'This endpoint only handles anonymous sessions' }),
        { status: 403, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Update the session
    const { error: updateError } = await supabaseClient
      .from('consultation_sessions')
      .update({
        ...updates,
        last_active: new Date().toISOString()
      })
      .eq('session_token', session_token)
      .is('user_id', null); // Extra safety: only update anonymous sessions

    if (updateError) {
      console.error('Database update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update session' }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Updated anonymous session:', existingSession.id);

    return new Response(
      JSON.stringify({ success: true, session_id: existingSession.id }),
      {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in update-anonymous-session:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }
});
