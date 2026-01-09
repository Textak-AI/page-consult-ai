-- Fix: Remove overly permissive SELECT policy that exposes unclaimed demo session data
-- The claiming flow works via UPDATE (session_id match), not SELECT
-- After claiming, users can read via "Users can read claimed sessions" policy

DROP POLICY IF EXISTS "Allow reading unclaimed sessions for claiming" ON public.demo_sessions;