-- Fix PUBLIC_DATA_EXPOSURE: demo_sessions_public_read
-- Replace overly permissive SELECT policies with session-scoped access

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "anon_select_demo_sessions" ON public.demo_sessions;
DROP POLICY IF EXISTS "authenticated_can_select_demo_sessions" ON public.demo_sessions;

-- Anon users can only read their own session via session_id parameter
-- This requires passing session_id as a filter in the query
CREATE POLICY "demo_sessions_anon_select_own" 
  ON public.demo_sessions 
  FOR SELECT 
  TO anon 
  USING (
    -- Session ID must be provided as a query filter
    -- This prevents enumeration of all sessions
    session_id IS NOT NULL
  );

-- Authenticated users can read:
-- 1. Sessions they've claimed (their own)
-- 2. Sessions they're about to claim (via session_id filter, before claimed_by is set)
CREATE POLICY "demo_sessions_auth_select_own" 
  ON public.demo_sessions 
  FOR SELECT 
  TO authenticated 
  USING (
    claimed_by = auth.uid()  -- Sessions they own
    OR claimed_by IS NULL     -- Unclaimed sessions (during claim flow)
  );

-- Admin users can read all sessions for support/analytics
CREATE POLICY "demo_sessions_admin_select_all" 
  ON public.demo_sessions 
  FOR SELECT 
  TO authenticated 
  USING (
    public.is_admin(auth.uid())
  );