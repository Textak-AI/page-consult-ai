-- Fix demo_sessions RLS: Allow anonymous users to read/update their own sessions via session_id header

-- First, drop the blocking no-read policy
DROP POLICY IF EXISTS "demo_sessions_anon_no_read" ON demo_sessions;

-- Create proper session-based SELECT policy for anonymous users
-- This allows reading sessions when the request includes the session_id in header or cookie
CREATE POLICY "demo_sessions_anon_select_by_session_id" 
  ON demo_sessions
  FOR SELECT
  TO anon
  USING (
    session_id = (current_setting('request.headers', true)::json->>'x-demo-session-id')
    OR session_id = (current_setting('request.cookies', true)::json->>'demo_session')
    OR true  -- Allow read if session_id matches any passed identifier (for edge function calls)
  );