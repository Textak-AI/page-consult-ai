import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Clear the session cookie by setting Max-Age to 0
    const cookieOptions = [
      'session_token=',
      'HttpOnly',
      'Secure',
      'SameSite=Lax',
      'Path=/',
      'Max-Age=0', // Expire immediately
    ].join('; ');

    return new Response(
      JSON.stringify({ success: true, message: 'Session cookie cleared' }),
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
    console.error('Error in clear-session-cookie:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }
});
