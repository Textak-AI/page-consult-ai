-- SECURITY FIX: Remove permissive SELECT policies from demo_sessions
-- Anonymous users should NOT be able to read all demo sessions
-- Edge functions use SERVICE_ROLE_KEY to bypass RLS for their own operations

-- Drop the overly permissive SELECT policies
DROP POLICY IF EXISTS "demo_sessions_allow_anon_select" ON demo_sessions;
DROP POLICY IF EXISTS "demo_sessions_anon_select_by_session_id" ON demo_sessions;

-- Ensure restrictive SELECT policy exists for anonymous users
-- (Allow select only for session-id based access via header/cookie, NOT via "OR true" fallback)
DROP POLICY IF EXISTS "Demo sessions accessible by session_id" ON demo_sessions;

-- Create restrictive session-scoped access (no "OR true" fallback!)
CREATE POLICY "demo_sessions_anon_select_own_session" 
  ON demo_sessions 
  FOR SELECT 
  TO anon
  USING (
    session_id = ((current_setting('request.headers'::text, true))::json ->> 'x-demo-session-id'::text)
    OR session_id = ((current_setting('request.cookies'::text, true))::json ->> 'demo_session'::text)
  );

-- SECURITY FIX: Remove permissive UPDATE policy from guest_sessions
-- The overly permissive "guest_sessions_anon_update" allows any anon to update any record
DROP POLICY IF EXISTS "guest_sessions_anon_update" ON guest_sessions;

-- Create restrictive update policy that requires token match
DROP POLICY IF EXISTS "guest_sessions_anon_update_own_only" ON guest_sessions;
CREATE POLICY "guest_sessions_anon_update_own_only"
  ON guest_sessions
  FOR UPDATE
  TO anon
  USING (
    session_token = ((current_setting('request.cookies'::text, true))::json ->> 'guest_session'::text)
  )
  WITH CHECK (
    session_token = ((current_setting('request.cookies'::text, true))::json ->> 'guest_session'::text)
  );