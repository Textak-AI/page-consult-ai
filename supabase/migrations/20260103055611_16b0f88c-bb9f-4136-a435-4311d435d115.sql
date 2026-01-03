-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Allow reading demo sessions" ON public.demo_sessions;

-- Add policy for admins to read all demo sessions
CREATE POLICY "Admins can read demo sessions"
ON public.demo_sessions FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Add policy for users to read their own claimed sessions
CREATE POLICY "Users can read claimed sessions"
ON public.demo_sessions FOR SELECT
TO authenticated
USING (claimed_by = auth.uid());