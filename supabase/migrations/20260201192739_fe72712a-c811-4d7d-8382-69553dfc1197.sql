-- Bug 2 Fix: Add INSERT policy for authenticated users on demo_sessions
-- Currently authenticated users get 403 when trying to insert a demo session

CREATE POLICY "authenticated_insert_demo_sessions"
ON public.demo_sessions
FOR INSERT
TO authenticated
WITH CHECK (true);