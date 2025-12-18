-- Allow anonymous users to view their anonymous sessions (sessions with null user_id)
-- This is needed because the insert uses .select().single() to return the created row
CREATE POLICY "Anonymous users can view anonymous sessions" 
ON public.consultation_sessions 
FOR SELECT 
USING (user_id IS NULL);