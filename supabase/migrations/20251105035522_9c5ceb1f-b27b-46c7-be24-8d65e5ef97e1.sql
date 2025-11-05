-- Create user_plans table for API usage tracking
CREATE TABLE IF NOT EXISTS public.user_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_name text NOT NULL DEFAULT 'free',
  api_calls_remaining integer NOT NULL DEFAULT 100,
  api_calls_limit integer NOT NULL DEFAULT 100,
  reset_date timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Users can view their own plan
CREATE POLICY "Users can view their own plan"
  ON public.user_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own plan
CREATE POLICY "Users can update their own plan"
  ON public.user_plans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index on user_id for performance
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON public.user_plans(user_id);

-- Create trigger to automatically create user plan on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_plan()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_plans (user_id, plan_name, api_calls_remaining, api_calls_limit)
  VALUES (NEW.id, 'free', 100, 100)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create user plan when user signs up
CREATE TRIGGER on_auth_user_created_plan
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_plan();

-- Function to reset API calls monthly
CREATE OR REPLACE FUNCTION public.reset_api_calls()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_plans
  SET 
    api_calls_remaining = api_calls_limit,
    reset_date = now() + interval '30 days',
    updated_at = now()
  WHERE reset_date <= now();
END;
$$;