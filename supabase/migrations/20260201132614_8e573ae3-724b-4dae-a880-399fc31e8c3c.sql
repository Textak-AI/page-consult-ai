-- Fix: Allow anonymous SELECT on demo_sessions
-- Note: This is acceptable because demo_sessions_anon_update already has USING(true)
-- and demo data is low-sensitivity pre-signup conversations

-- Drop any conflicting policies
DROP POLICY IF EXISTS "anon_can_select_demo_sessions" ON demo_sessions;
DROP POLICY IF EXISTS "anon_select_demo_sessions" ON demo_sessions;

-- Create permissive SELECT policy for anon users
CREATE POLICY "anon_select_demo_sessions" 
  ON demo_sessions 
  FOR SELECT 
  TO anon 
  USING (true);