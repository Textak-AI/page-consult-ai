-- Add missing RLS policies for user_plans table

-- Allow users to create their own plan
CREATE POLICY "Users can create their own plan"
  ON public.user_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own plan
CREATE POLICY "Users can delete their own plan"
  ON public.user_plans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);