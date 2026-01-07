-- Drop existing claiming policy to recreate with proper WITH CHECK clause
DROP POLICY IF EXISTS "Allow claiming demo sessions" ON demo_sessions;

-- Allow authenticated users to claim unclaimed demo sessions (with proper WITH CHECK)
CREATE POLICY "Users can claim unclaimed demo sessions"
ON demo_sessions
FOR UPDATE
TO authenticated
USING (claimed_by IS NULL OR claimed_by = auth.uid())
WITH CHECK (claimed_by = auth.uid());

-- Allow reading unclaimed sessions by session_id (needed for claiming flow)
-- Users need to SELECT the session before they can claim it
CREATE POLICY "Allow reading unclaimed sessions for claiming"
ON demo_sessions
FOR SELECT
TO authenticated
USING (claimed_by IS NULL OR claimed_by = auth.uid());