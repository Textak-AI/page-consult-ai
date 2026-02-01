-- Create function to inspect consultation RLS policies
CREATE OR REPLACE FUNCTION public.get_consultation_policies()
RETURNS TABLE(policyname text, cmd text, qual text, with_check text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT policyname::text, cmd::text, qual::text, with_check::text
  FROM pg_policies 
  WHERE tablename = 'consultations';
$$;