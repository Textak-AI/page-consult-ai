-- Fix consultation_sessions RLS policy to require authentication (prevent anonymous viewing of all null user_id sessions)
DROP POLICY IF EXISTS "Users can view sessions" ON public.consultation_sessions;
CREATE POLICY "Users can view their own sessions" 
ON public.consultation_sessions 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND auth.uid() = user_id
);

-- Add INSERT policy for user_usage table (handle_new_user_usage trigger inserts with service role, 
-- but we need a policy for direct inserts)
CREATE POLICY "System can insert usage records" 
ON public.user_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);