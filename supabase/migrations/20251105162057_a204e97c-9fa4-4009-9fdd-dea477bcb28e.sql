-- Fix: Make INSERT policies permissive so either anonymous OR authenticated can create sessions
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anonymous users can create sessions" ON public.consultation_sessions;
DROP POLICY IF EXISTS "Authenticated users can create their own sessions" ON public.consultation_sessions;

-- Create new PERMISSIVE policies (if EITHER passes, INSERT succeeds)
CREATE POLICY "Anonymous users can create sessions"
  ON public.consultation_sessions
  FOR INSERT
  TO public
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Authenticated users can create their own sessions"
  ON public.consultation_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);