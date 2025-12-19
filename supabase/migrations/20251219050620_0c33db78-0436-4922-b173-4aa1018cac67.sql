-- Remove insecure RLS policies from demo_leads
DROP POLICY IF EXISTS "Anyone can insert demo leads" ON public.demo_leads;
DROP POLICY IF EXISTS "Anyone can update demo leads" ON public.demo_leads;

-- Remove insecure RLS policies from demo_sessions
DROP POLICY IF EXISTS "Anyone can insert demo sessions" ON public.demo_sessions;
DROP POLICY IF EXISTS "Anyone can update demo sessions" ON public.demo_sessions;

-- Remove insecure RLS policy from demo_market_cache
DROP POLICY IF EXISTS "Public can read cache" ON public.demo_market_cache;

-- Note: These tables will now only be accessible via edge functions using SERVICE_ROLE_KEY
-- This is the intended security model - no direct client access to these demo tables