import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const MigrateSessionSchema = z.object({
  session_token: z.string().uuid('Invalid session token format'),
});

// CORS with origin whitelist for security
const allowedOrigins = [
  'https://page-consult-ai.lovable.app',
  'https://preview--page-consult-ai.lovable.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && allowedOrigins.some(o => origin.startsWith(o.replace(/\/$/, '')))
    ? origin 
    : allowedOrigins[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

serve(async (req) => {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validation = MigrateSessionSchema.safeParse(requestBody);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid session token format', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { session_token } = validation.data;

    // Initialize Supabase admin client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract JWT token from Authorization header
    const jwt = authHeader.replace('Bearer ', '');

    // Verify JWT and get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find anonymous consultation session
    const { data: anonymousSession, error: sessionError } = await supabaseClient
      .from('consultation_sessions')
      .select('*')
      .eq('session_token', session_token)
      .eq('status', 'in_progress')
      .is('user_id', null)
      .maybeSingle();

    if (sessionError) {
      console.error('Session lookup error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to find session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no anonymous session found, that's okay - user might not have one
    if (!anonymousSession) {
      return new Response(
        JSON.stringify({ success: true, message: 'No anonymous session to migrate' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if there's already consultation data saved
    const { data: existingConsultation } = await supabaseClient
      .from('consultations')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .maybeSingle();

    // If consultation already exists, just link the session
    if (existingConsultation) {
      await supabaseClient
        .from('consultation_sessions')
        .update({ 
          user_id: user.id,
          status: 'migrated'
        })
        .eq('session_token', session_token);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Session linked to existing consultation',
          consultation_id: existingConsultation.id
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Migrate anonymous session data to consultations table
    const consultationAnswers = anonymousSession.consultation_answers || {};
    
    const { data: newConsultation, error: insertError } = await supabaseClient
      .from('consultations')
      .insert({
        user_id: user.id,
        industry: consultationAnswers.industry,
        service_type: consultationAnswers.service_type,
        goal: consultationAnswers.goal,
        target_audience: consultationAnswers.target_audience,
        challenge: consultationAnswers.challenge,
        unique_value: consultationAnswers.unique_value,
        offer: consultationAnswers.offer,
        status: 'in_progress'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Migration error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to migrate session data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark anonymous session as migrated
    await supabaseClient
      .from('consultation_sessions')
      .update({ 
        user_id: user.id,
        status: 'migrated'
      })
      .eq('session_token', session_token);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Anonymous session migrated successfully',
        consultation_id: newConsultation.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in migrate-anonymous-session:', error);
    const origin = req.headers.get('Origin');
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } }
    );
  }
});
