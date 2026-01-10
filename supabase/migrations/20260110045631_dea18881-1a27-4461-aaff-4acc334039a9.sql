-- Cleanup: Remove duplicate/old policy on brand_scene_cache
DROP POLICY IF EXISTS "Authenticated users can read scene cache" ON brand_scene_cache;