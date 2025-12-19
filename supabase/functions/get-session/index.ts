import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    // Extract session_token from cookie
    const cookieHeader = req.headers.get('cookie');
    
    if (!cookieHeader) {
      return new Response(
        JSON.stringify({ error: 'No session cookie found' }),
        { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const session_token = cookies['session_token'];

    if (!session_token) {
      return new Response(
        JSON.stringify({ error: 'Session token not found in cookies' }),
        { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with SERVICE_ROLE_KEY to bypass RLS
    // This is secure because the session_token was validated from the httpOnly cookie
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get session from database
    const { data: session, error } = await supabaseClient
      .from('consultation_sessions')
      .select('*')
      .eq('session_token', session_token)
      .eq('status', 'in_progress')
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve session' }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 404, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Check session expiration (7 days)
    const sessionAge = Date.now() - new Date(session.created_at).getTime();
    const MAX_SESSION_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    if (sessionAge > MAX_SESSION_AGE) {
      console.log('Session expired:', session_token);
      return new Response(
        JSON.stringify({ error: 'Session expired' }),
        { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Update last_active timestamp
    await supabaseClient
      .from('consultation_sessions')
      .update({ last_active: new Date().toISOString() })
      .eq('session_token', session_token);

    return new Response(
      JSON.stringify({
        session_token,
        session_id: session.id,
        user_email: session.user_email,
        current_step: session.current_step,
        consultation_answers: session.consultation_answers,
        approved_sections: session.approved_sections,
      }),
      {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in get-session:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }
});
