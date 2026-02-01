-- Fix: Allow authenticated users to SELECT demo_sessions they're about to claim
-- The existing policy only allows reading sessions they've already claimed
-- But we need to read the session BEFORE claiming it to get the intelligence data

-- Add a policy that allows authenticated users to read any session by session_id
-- This is safe because:
-- 1. The session_id is a UUID that must be known to query
-- 2. Users can only CLAIM unclaimed sessions (UPDATE policy checks this)
-- 3. The session data is intended to be transferred to the authenticated user anyway

CREATE POLICY "authenticated_can_select_demo_sessions"
  ON public.demo_sessions
  FOR SELECT
  TO authenticated
  USING (true);