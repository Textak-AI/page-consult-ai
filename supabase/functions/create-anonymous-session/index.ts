import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Validation schema
const CreateSessionSchema = z.object({
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
    const validation = CreateSessionSchema.safeParse(requestBody);
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid session token format' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const { session_token } = validation.data;

    // Initialize Supabase client with SERVICE_ROLE_KEY to bypass RLS
    // This is secure because this endpoint only creates anonymous sessions
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create anonymous session
    const { data: session, error } = await supabaseClient
      .from('consultation_sessions')
      .insert({
        session_token,
        current_step: 'consultation',
        status: 'in_progress',
        user_id: null // Anonymous session
      })
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Created anonymous session:', session.id);

    // Set httpOnly cookie
    const cookieOptions = [
      `session_token=${session_token}`,
      'HttpOnly',
      'Secure',
      'SameSite=Lax',
      'Path=/',
      `Max-Age=${7 * 24 * 60 * 60}`, // 7 days
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
    console.error('Error in create-anonymous-session:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }
});
