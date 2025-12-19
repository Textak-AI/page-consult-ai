-- Fix PUBLIC_DATA_EXPOSURE: Drop overly permissive RLS policies for anonymous sessions
-- These policies allow ANY unauthenticated user to read ALL anonymous sessions

-- Drop the problematic policy that exposes all anonymous sessions
DROP POLICY IF EXISTS "Anonymous users can view anonymous sessions" ON public.consultation_sessions;

-- Drop the other overly permissive policy
DROP POLICY IF EXISTS "Users can view sessions" ON public.consultation_sessions;

-- Drop anonymous insert/update policies as well (these should go through edge functions)
DROP POLICY IF EXISTS "Anonymous users can create sessions" ON public.consultation_sessions;
DROP POLICY IF EXISTS "Anonymous users can update their sessions" ON public.consultation_sessions;
DROP POLICY IF EXISTS "Users can insert sessions" ON public.consultation_sessions;
DROP POLICY IF EXISTS "Users can update sessions" ON public.consultation_sessions;

-- Create secure policies that ONLY work for authenticated users
-- Anonymous session operations will be handled via edge functions with SERVICE_ROLE_KEY

-- Authenticated users can view their own sessions
CREATE POLICY "Authenticated users can view own sessions" 
ON public.consultation_sessions 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Authenticated users can insert sessions for themselves
CREATE POLICY "Authenticated users can insert own sessions" 
ON public.consultation_sessions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Authenticated users can update their own sessions
CREATE POLICY "Authenticated users can update own sessions" 
ON public.consultation_sessions 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);