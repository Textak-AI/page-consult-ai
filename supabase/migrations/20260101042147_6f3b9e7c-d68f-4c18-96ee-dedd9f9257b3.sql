-- Fix: Remove overly permissive UPDATE policy on demo_leads
-- Service role bypasses RLS, so no explicit policy needed for edge functions

DROP POLICY IF EXISTS "Service role can update demo leads" ON public.demo_leads;