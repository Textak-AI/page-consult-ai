-- Add trial tracking fields to user_usage table
ALTER TABLE public.user_usage 
ADD COLUMN IF NOT EXISTS trial_start timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS trial_end timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trialing';

-- Update the handle_new_user_usage function to set trial dates on account creation
CREATE OR REPLACE FUNCTION public.handle_new_user_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
BEGIN
  INSERT INTO public.user_usage (user_id, plan_tier, ai_actions_limit, trial_start, trial_end, subscription_status)
  VALUES (NEW.id, 'starter', 30, now(), now() + interval '14 days', 'trialing')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;