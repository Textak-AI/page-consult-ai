-- Drop the overly permissive anon update policy
DROP POLICY IF EXISTS "demo_sessions_anon_update" ON public.demo_sessions;

-- Create a tighter anon update policy that requires session_id match via cookie or header
CREATE POLICY "demo_sessions_anon_update" ON public.demo_sessions
  FOR UPDATE
  TO anon
  USING (
    (session_id = ((current_setting('request.cookies'::text, true))::json ->> 'demo_session'::text))
    OR (session_id = ((current_setting('request.headers'::text, true))::json ->> 'x-demo-session-id'::text))
  )
  WITH CHECK (
    (session_id = ((current_setting('request.cookies'::text, true))::json ->> 'demo_session'::text))
    OR (session_id = ((current_setting('request.headers'::text, true))::json ->> 'x-demo-session-id'::text))
  );