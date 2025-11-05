-- Fix RLS policies for anonymous session access

-- Drop the overly restrictive authenticated-only policies
DROP POLICY IF EXISTS "Authenticated users can view their own sessions" ON public.consultation_sessions;
DROP POLICY IF EXISTS "Authenticated users can update their own sessions" ON public.consultation_sessions;
DROP POLICY IF EXISTS "Authenticated users can delete their own sessions" ON public.consultation_sessions;

-- Allow viewing sessions for both authenticated and anonymous users
-- Authenticated users can view their own sessions (user_id match)
-- Anonymous users can view anonymous sessions (both user_id and auth.uid() are NULL)
CREATE POLICY "Users can view sessions"
  ON public.consultation_sessions
  FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- Allow updating sessions for both authenticated and anonymous users
CREATE POLICY "Users can update sessions"
  ON public.consultation_sessions
  FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- Keep delete restricted to authenticated users only
CREATE POLICY "Users can delete their own sessions"
  ON public.consultation_sessions
  FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);