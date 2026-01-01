-- Fix PUBLIC_DATA_EXPOSURE: demo_leads table has public read/update access
-- This exposes customer email addresses and business intelligence

-- Drop the misleading public policies
DROP POLICY IF EXISTS "Service role can read demo leads" ON public.demo_leads;
DROP POLICY IF EXISTS "Anyone can update demo leads" ON public.demo_leads;

-- Add admin-only read policy (uses existing is_admin function)
CREATE POLICY "Admins can read demo leads" ON public.demo_leads
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- No UPDATE policy needed for regular users - service role bypasses RLS
-- Edge functions with service role key can still update for conversion tracking