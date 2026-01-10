-- SECURITY HARDENING: Final cleanup of cache policies
-- Migration retrying after partial failure - check if policies exist first

-- For brand_scene_cache: This is a shared industry cache with no user ownership
-- Only Edge Functions (service_role) should write to it
-- Authenticated users CAN read it (needed for UI to display cached scenes)
-- The previous policy was already dropped, so we need to recreate a secure one
-- Since it's shared cache data (not user-specific), authenticated read is acceptable
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'brand_scene_cache' 
    AND policyname = 'Authenticated users can read shared scene cache'
  ) THEN
    CREATE POLICY "Authenticated users can read shared scene cache"
    ON brand_scene_cache FOR SELECT
    TO authenticated
    USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- For hero_image_cache: Same pattern - shared cache, auth read is acceptable
-- Policy was already created in failed migration, verify it exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'hero_image_cache' 
    AND policyname = 'Users can read own hero cache entries'
  ) THEN
    CREATE POLICY "Authenticated users can read shared hero cache"
    ON hero_image_cache FOR SELECT
    TO authenticated
    USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Verify usage_log INSERT policy (may have been created in failed migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'usage_log' 
    AND policyname = 'Users can insert their own usage logs'
    AND cmd = 'INSERT'
  ) THEN
    CREATE POLICY "Users can insert their own usage logs"
    ON usage_log FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;