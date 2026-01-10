-- =============================================================================
-- SECURITY HARDENING: Fix RLS policies for user data protection
-- =============================================================================

-- ============================================================================
-- 1. CONSULTATIONS: Fix overly permissive guest session policies
-- The current policies allow ANY guest_session_id to access ANY consultation
-- with a guest_session_id set. Need to scope to the actual session.
-- ============================================================================

-- Drop the problematic guest session policies
DROP POLICY IF EXISTS "Guest sessions can create consultations" ON public.consultations;
DROP POLICY IF EXISTS "Guest sessions can update their consultations" ON public.consultations;
DROP POLICY IF EXISTS "Guest sessions can view their consultations" ON public.consultations;

-- Create properly scoped policies that verify the session token matches
-- For guest access, we need to check that the guest_session_id matches the session from cookies
CREATE POLICY "Guest sessions can view own consultations"
ON public.consultations FOR SELECT
TO anon
USING (
  guest_session_id IS NOT NULL 
  AND guest_session_id IN (
    SELECT id FROM guest_sessions 
    WHERE session_token = current_setting('request.cookies', true)::json->>'guest_session'
  )
);

CREATE POLICY "Guest sessions can create own consultations"
ON public.consultations FOR INSERT
TO anon
WITH CHECK (
  guest_session_id IS NOT NULL 
  AND guest_session_id IN (
    SELECT id FROM guest_sessions 
    WHERE session_token = current_setting('request.cookies', true)::json->>'guest_session'
  )
);

CREATE POLICY "Guest sessions can update own consultations"
ON public.consultations FOR UPDATE
TO anon
USING (
  guest_session_id IS NOT NULL 
  AND guest_session_id IN (
    SELECT id FROM guest_sessions 
    WHERE session_token = current_setting('request.cookies', true)::json->>'guest_session'
  )
);

-- ============================================================================
-- 2. SUBSCRIPTIONS: Ensure service-role only for write operations
-- Users can only read their own subscription, all writes via Stripe webhook
-- ============================================================================

-- Remove duplicate SELECT policy
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;

-- Subscriptions should have no public INSERT/UPDATE/DELETE
-- Service role (Stripe webhook) bypasses RLS, so no policy needed for writes

-- ============================================================================
-- 3. LANDING_PAGES: Verify no public SELECT exists (already fixed previously)
-- The get_public_landing_page() RPC is used for public access
-- ============================================================================

-- Already correct - only user-scoped policies exist

-- ============================================================================
-- 4. DEMO_SESSIONS: Add session_id based access for demo-to-wizard handoff
-- Currently only supports claimed_by which requires auth
-- ============================================================================

-- Add policy for session_id based read (for handoff before claim)
CREATE POLICY "Demo sessions accessible by session_id"
ON public.demo_sessions FOR SELECT
TO anon, authenticated
USING (
  session_id = current_setting('request.headers', true)::json->>'x-demo-session-id'
  OR session_id = current_setting('request.cookies', true)::json->>'demo_session'
);

-- Add policy for session_id based update (to update messages before claim)
CREATE POLICY "Demo sessions updatable by session_id"
ON public.demo_sessions FOR UPDATE
TO anon
USING (
  session_id = current_setting('request.cookies', true)::json->>'demo_session'
  OR session_id = current_setting('request.headers', true)::json->>'x-demo-session-id'
)
WITH CHECK (
  -- Can update if it's their session and they're not trying to claim
  (claimed_by IS NULL OR claimed_by = auth.uid())
);

-- ============================================================================
-- 5. PROSPECT_PAGE_VIEWS: Ensure anon INSERT is properly scoped
-- ============================================================================

-- Add policy for anon to insert views (already exists but verify it's restricted)
DROP POLICY IF EXISTS "Public can insert views" ON public.prospect_page_views;
CREATE POLICY "Anon can track prospect page views"
ON public.prospect_page_views FOR INSERT
TO anon
WITH CHECK (
  -- Only allow inserts for published prospect pages
  prospect_page_id IN (
    SELECT id FROM prospect_pages WHERE status = 'published'
  )
);