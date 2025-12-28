-- Add missing columns to demo_sessions for wizard handoff
ALTER TABLE public.demo_sessions 
ADD COLUMN IF NOT EXISTS readiness INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;

-- Drop existing policies to recreate them with better permissions
DROP POLICY IF EXISTS "Anyone can insert demo sessions" ON public.demo_sessions;
DROP POLICY IF EXISTS "Anyone can read demo sessions" ON public.demo_sessions;
DROP POLICY IF EXISTS "Anyone can update demo sessions" ON public.demo_sessions;

-- Recreate RLS policies
-- Anyone can create demo sessions (for anonymous demo users)
CREATE POLICY "Allow anonymous demo session inserts"
ON public.demo_sessions
FOR INSERT
WITH CHECK (true);

-- Anyone can read demo sessions (needed for wizard to fetch by session_id)
CREATE POLICY "Allow reading demo sessions"
ON public.demo_sessions
FOR SELECT
USING (true);

-- Allow claiming demo sessions (only if unclaimed or by the owner)
CREATE POLICY "Allow claiming demo sessions"
ON public.demo_sessions
FOR UPDATE
USING (claimed_by IS NULL OR claimed_by = auth.uid());