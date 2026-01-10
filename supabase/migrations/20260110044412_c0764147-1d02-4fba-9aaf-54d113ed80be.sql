-- Fix: brand_scene_cache has RLS enabled but no policies
-- Add authenticated read policy for client-side cache reads
CREATE POLICY "Authenticated users can read scene cache"
ON public.brand_scene_cache FOR SELECT
TO authenticated
USING (true);