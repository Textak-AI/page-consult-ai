-- Fix consultation_sessions anonymous update policy to scope to token holders only
-- This prevents unauthorized users from modifying sessions they don't own

-- Drop the overly permissive anonymous update policy
DROP POLICY IF EXISTS "consultation_sessions_anon_update" ON public.consultation_sessions;

-- Create a properly scoped policy that only allows updates when session_token matches cookie
CREATE POLICY "consultation_sessions_anon_update_own_only"
ON public.consultation_sessions
FOR UPDATE
TO anon
USING (
  session_token = (
    (current_setting('request.cookies'::text, true))::json ->> 'consultation_session'
  )
)
WITH CHECK (
  session_token = (
    (current_setting('request.cookies'::text, true))::json ->> 'consultation_session'
  )
);

-- Also scope anonymous inserts to prevent abuse - require the token to match what's being inserted
DROP POLICY IF EXISTS "consultation_sessions_anon_insert" ON public.consultation_sessions;

CREATE POLICY "consultation_sessions_anon_insert_with_token"
ON public.consultation_sessions
FOR INSERT
TO anon
WITH CHECK (
  -- Allow insert only if session_token matches the cookie (prevents creating sessions for others)
  session_token = (
    (current_setting('request.cookies'::text, true))::json ->> 'consultation_session'
  )
  OR 
  -- Or if no cookie exists yet (first session creation)
  (current_setting('request.cookies'::text, true))::json ->> 'consultation_session' IS NULL
);