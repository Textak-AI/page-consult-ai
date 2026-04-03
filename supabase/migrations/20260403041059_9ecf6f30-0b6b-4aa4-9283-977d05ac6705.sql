
-- Fix 1: Remove overly permissive demo_sessions SELECT policy that exposes unclaimed sessions
DROP POLICY IF EXISTS "demo_sessions_auth_select_own" ON public.demo_sessions;

-- Fix 2: Remove the overly permissive user_plans UPDATE policy
DROP POLICY IF EXISTS "Users can update their own plan" ON public.user_plans;

-- Fix 2b: Remove the DELETE policy too (plan changes should be server-side only)
DROP POLICY IF EXISTS "Users can delete their own plan" ON public.user_plans;
