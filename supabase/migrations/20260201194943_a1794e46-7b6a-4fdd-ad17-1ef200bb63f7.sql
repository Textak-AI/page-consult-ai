-- Delete stale test consultations that are blocking upserts
DELETE FROM consultations 
WHERE guest_session_id = '5c62ffc0-4acf-4090-be98-5a42234b054c';

-- Verify orphan policy exists, create if not
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'consultations' 
    AND policyname = 'authenticated_update_orphan_consultations'
  ) THEN
    CREATE POLICY "authenticated_update_orphan_consultations" ON consultations
    FOR UPDATE TO authenticated
    USING (user_id IS NULL OR user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Also ensure authenticated users can SELECT consultations they're trying to update
-- (needed for the initial lookup step)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'consultations' 
    AND policyname = 'authenticated_select_own_consultations'
  ) THEN
    CREATE POLICY "authenticated_select_own_consultations" ON consultations
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR user_id IS NULL);
  END IF;
END $$;