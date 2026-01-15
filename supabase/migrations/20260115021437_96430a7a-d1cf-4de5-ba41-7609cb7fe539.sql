-- Add explicit deny policies for public (unauthenticated) access to sensitive tables
-- These policies ensure that only authenticated users can access data, even with anon key

-- 1. Block public access to profiles table for unauthenticated users
-- The existing policy allows auth.uid() = id, but we need to ensure anon role cannot access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Block public access to profiles' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Block public access to profiles" 
    ON public.profiles 
    FOR SELECT 
    TO anon
    USING (false);
  END IF;
END $$;

-- 2. Block public access to demo_leads table for unauthenticated users
-- Only admins should read this data, not anonymous users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Block public access to demo_leads' AND tablename = 'demo_leads'
  ) THEN
    CREATE POLICY "Block public access to demo_leads" 
    ON public.demo_leads 
    FOR SELECT 
    TO anon
    USING (false);
  END IF;
END $$;

-- 3. Also add block for INSERT/UPDATE/DELETE on profiles for anon role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Block public insert on profiles' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Block public insert on profiles" 
    ON public.profiles 
    FOR INSERT 
    TO anon
    WITH CHECK (false);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Block public update on profiles' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Block public update on profiles" 
    ON public.profiles 
    FOR UPDATE 
    TO anon
    USING (false);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Block public delete on profiles' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Block public delete on profiles" 
    ON public.profiles 
    FOR DELETE 
    TO anon
    USING (false);
  END IF;
END $$;

-- 4. Block all operations on demo_leads for anon role (admins use service role)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Block public insert on demo_leads' AND tablename = 'demo_leads'
  ) THEN
    CREATE POLICY "Block public insert on demo_leads" 
    ON public.demo_leads 
    FOR INSERT 
    TO anon
    WITH CHECK (false);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Block public update on demo_leads' AND tablename = 'demo_leads'
  ) THEN
    CREATE POLICY "Block public update on demo_leads" 
    ON public.demo_leads 
    FOR UPDATE 
    TO anon
    USING (false);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Block public delete on demo_leads' AND tablename = 'demo_leads'
  ) THEN
    CREATE POLICY "Block public delete on demo_leads" 
    ON public.demo_leads 
    FOR DELETE 
    TO anon
    USING (false);
  END IF;
END $$;