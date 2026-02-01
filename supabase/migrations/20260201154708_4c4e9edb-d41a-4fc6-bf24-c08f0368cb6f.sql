-- Fix OPEN_ENDPOINTS: increment_functions_unprotected
-- Revoke public EXECUTE on increment functions since they're only called by edge functions with service_role

-- Revoke anon and authenticated access to increment_page_view
REVOKE EXECUTE ON FUNCTION public.increment_page_view(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_page_view(UUID) FROM authenticated;

-- Revoke anon and authenticated access to increment_prospect_page_views
REVOKE EXECUTE ON FUNCTION public.increment_prospect_page_views(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_prospect_page_views(UUID) FROM authenticated;

-- Also add validation to the functions so they only update published/valid pages
CREATE OR REPLACE FUNCTION public.increment_page_view(page_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only increment if page exists and is published
  UPDATE landing_pages
  SET view_count = COALESCE(view_count, 0) + 1,
      last_viewed_at = NOW()
  WHERE id = page_id AND is_published = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_prospect_page_views(page_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only increment if prospect page exists and is published
  UPDATE prospect_pages 
  SET view_count = view_count + 1, 
      last_viewed_at = NOW() 
  WHERE id = page_id AND status = 'published';
END;
$$;

-- Fix PUBLIC_DATA_EXPOSURE: demo_sessions_selective_read
-- Block all anon SELECT access - edge functions use service_role so they'll continue working
-- Client-side code should go through edge functions for any demo_session reads

-- Drop the overly permissive anon select policy
DROP POLICY IF EXISTS "demo_sessions_anon_select_own_session" ON public.demo_sessions;
DROP POLICY IF EXISTS "demo_sessions_anon_select_own" ON public.demo_sessions;

-- Create restrictive policy - anon cannot select demo_sessions at all
-- Edge functions with service_role bypass RLS, so they continue working
CREATE POLICY "demo_sessions_anon_no_select" 
  ON public.demo_sessions 
  FOR SELECT 
  TO anon 
  USING (false);