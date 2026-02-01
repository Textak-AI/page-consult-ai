-- Allow authenticated users to UPDATE orphan consultations (where user_id IS NULL)
-- This lets users "claim" consultations that were created without an owner
CREATE POLICY "authenticated_update_orphan_consultations" ON public.consultations
FOR UPDATE TO authenticated
USING (user_id IS NULL OR user_id = auth.uid())
WITH CHECK (user_id = auth.uid());