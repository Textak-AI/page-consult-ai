-- Add anon SELECT policy for published landing pages
-- This allows anonymous users to view pages that are published

-- First check if this policy exists to avoid errors
DO $$
BEGIN
  -- Only create if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'landing_pages' 
    AND policyname = 'Public can read published landing pages'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can read published landing pages" ON public.landing_pages FOR SELECT TO anon USING (status = ''published'')';
  END IF;
END $$;