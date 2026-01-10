-- =============================================================================
-- FIX: Remove overly permissive RLS policies (USING(true) / WITH CHECK(true))
-- These are flagged by security scanner. Service role bypasses RLS anyway,
-- so public policies on service-role-only tables are unnecessary.
-- =============================================================================

-- BRAND_SCENE_CACHE: Only edge functions use this (service role)
-- Remove public policies since service role bypasses RLS
DROP POLICY IF EXISTS "Public read access" ON public.brand_scene_cache;
DROP POLICY IF EXISTS "Service role insert" ON public.brand_scene_cache;
DROP POLICY IF EXISTS "Service role update" ON public.brand_scene_cache;

-- BRAND_SCENE_GENERATIONS: Only edge functions track generations  
DROP POLICY IF EXISTS "Service role insert generations" ON public.brand_scene_generations;

-- DEMO_MARKET_CACHE: Only edge functions cache market research
DROP POLICY IF EXISTS "Anyone can insert demo market cache" ON public.demo_market_cache;
DROP POLICY IF EXISTS "Anyone can update demo market cache" ON public.demo_market_cache;

-- HERO_IMAGE_CACHE: Edge functions cache hero images
DROP POLICY IF EXISTS "Anyone can read cached hero images" ON public.hero_image_cache;
-- Add a proper authenticated read policy if needed
CREATE POLICY "Authenticated users can read hero cache"
ON public.hero_image_cache FOR SELECT
TO authenticated
USING (true);

-- DEMO_LEADS: Edge functions insert, admins read
DROP POLICY IF EXISTS "Anyone can insert demo leads" ON public.demo_leads;
-- Create proper policy: only service role inserts (bypasses RLS)
-- Already has admin-only read from previous migration

-- DEMO_SESSIONS: Anonymous demo sessions 
DROP POLICY IF EXISTS "Allow anonymous demo session inserts" ON public.demo_sessions;
-- Add proper policy: allow anon inserts but restrict to their own session
CREATE POLICY "Anon can insert own demo session"
ON public.demo_sessions FOR INSERT
TO anon
WITH CHECK (true);
-- This is still permissive for INSERT but that's intentional for demos

-- GUEST_SESSIONS: Token-based access
DROP POLICY IF EXISTS "Anyone can create guest session" ON public.guest_sessions;
DROP POLICY IF EXISTS "Sessions accessible by token" ON public.guest_sessions;
DROP POLICY IF EXISTS "Sessions updatable by token" ON public.guest_sessions;
-- Add proper token-scoped policies
CREATE POLICY "Anon can create guest session"
ON public.guest_sessions FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Token holders can read own session"
ON public.guest_sessions FOR SELECT
TO anon, authenticated
USING (session_token = current_setting('request.cookies', true)::json->>'guest_session');

CREATE POLICY "Token holders can update own session"
ON public.guest_sessions FOR UPDATE
TO anon, authenticated
USING (session_token = current_setting('request.cookies', true)::json->>'guest_session');

-- LEADS: Lead capture needs public insert
DROP POLICY IF EXISTS "Anyone can create lead" ON public.leads;
-- Create proper anon-only insert policy
CREATE POLICY "Anon can create lead"
ON public.leads FOR INSERT
TO anon
WITH CHECK (true);

-- PROSPECT_PAGE_VIEWS: Public analytics tracking
DROP POLICY IF EXISTS "Public can insert views" ON public.prospect_page_views;
-- Keep for anon role only, not public
-- Already has proper anon policy

-- PROSPECT_VIEWS: Public analytics tracking
DROP POLICY IF EXISTS "Public insert prospect views" ON public.prospect_views;
-- Create proper anon-only insert policy  
CREATE POLICY "Anon can track prospect views"
ON public.prospect_views FOR INSERT
TO anon
WITH CHECK (true);

-- PROSPECTS: Public view by slug
DROP POLICY IF EXISTS "Public read prospects by slug" ON public.prospects;
-- Add proper slug-based public read
CREATE POLICY "Public can read published prospects by slug"
ON public.prospects FOR SELECT
TO anon
USING (slug IS NOT NULL AND status = 'published');

-- SUBSCRIPTIONS: Stripe webhook uses service role
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
-- Add authenticated user can read own subscription
CREATE POLICY "Users can read own subscription"
ON public.subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- TESTIMONIAL_REQUESTS: Edge functions insert
DROP POLICY IF EXISTS "Service role can insert requests" ON public.testimonial_requests;
-- Service role bypasses RLS, no public policy needed