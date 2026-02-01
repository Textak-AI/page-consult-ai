-- Add truly permissive SELECT policy for demo_sessions
-- This allows anonymous users to verify their session exists after edge function save
-- Note: INSERT/UPDATE still use edge function with SERVICE_ROLE to bypass RLS

-- Drop any conflicting policies first
DROP POLICY IF EXISTS "demo_sessions_allow_anon_select" ON demo_sessions;

-- Create permissive SELECT policy for anon
CREATE POLICY "demo_sessions_allow_anon_select" 
  ON demo_sessions 
  FOR SELECT 
  TO anon
  USING (true);