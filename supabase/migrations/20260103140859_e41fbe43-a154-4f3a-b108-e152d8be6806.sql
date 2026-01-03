-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Anyone can read demo market cache" ON public.demo_market_cache;

-- Add admin-only read policy (edge functions use service role and bypass RLS)
CREATE POLICY "Admins can read demo market cache"
ON public.demo_market_cache
FOR SELECT
USING (is_admin(auth.uid()));