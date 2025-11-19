import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Validation schema
const SetSessionSchema = z.object({
  session_token: z.string().uuid('Invalid session token format'),
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

interface SetSessionRequest {
  session_token: string;
  user_id?: string;
}

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
    const validation = SetSessionSchema.safeParse(requestBody);
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid session token format' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const { session_token } = validation.data;

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify session exists in database
    const { data: session, error } = await supabaseClient
      .from('consultation_sessions')
      .select('id, session_token')
      .eq('session_token', session_token)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to validate session' }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Set httpOnly cookie
    const cookieOptions = [
      `session_token=${session_token}`,
      'HttpOnly',
      'Secure',
      'SameSite=Lax',
      'Path=/',
      `Max-Age=${24 * 60 * 60}`, // 24 hours
    ].join('; ');

    return new Response(
      JSON.stringify({ success: true, session_id: session.id }),
      {
        status: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Set-Cookie': cookieOptions,
        },
      }
    );
  } catch (error) {
    console.error('Error in set-session-cookie:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }
});
