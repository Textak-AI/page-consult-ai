-- Fix: beta_signups email exposure
-- Remove policy that allows anyone to view signups on published pages
-- Keep only the owner-access policy for SELECT

DROP POLICY IF EXISTS "Anyone can view signups for published pages" ON public.beta_signups;

-- The "Page owners can view their signups" policy already exists and is correct
-- It restricts SELECT to only the page owner via auth.uid() check