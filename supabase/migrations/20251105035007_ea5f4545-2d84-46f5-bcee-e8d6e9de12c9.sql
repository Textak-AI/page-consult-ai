-- Fix RLS policies for consultation_sessions table

-- Step 1: Add user_id column to support authenticated users
ALTER TABLE public.consultation_sessions 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Drop the broken RLS policies
DROP POLICY IF EXISTS "Sessions are viewable with token filter" ON public.consultation_sessions;
DROP POLICY IF EXISTS "Sessions are updatable with token filter" ON public.consultation_sessions;
DROP POLICY IF EXISTS "Allow anonymous session creation" ON public.consultation_sessions;

-- Step 3: Create secure policies for authenticated users
CREATE POLICY "Authenticated users can view their own sessions"
  ON public.consultation_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own sessions"
  ON public.consultation_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create their own sessions"
  ON public.consultation_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own sessions"
  ON public.consultation_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 4: Create policy for anonymous session creation (backward compatibility)
-- Anonymous users can INSERT but cannot SELECT/UPDATE (must authenticate to access)
CREATE POLICY "Anonymous users can create sessions"
  ON public.consultation_sessions
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Add index on user_id for performance
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_user_id 
  ON public.consultation_sessions(user_id);