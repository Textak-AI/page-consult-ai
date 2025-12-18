-- Create enum for plan tiers
CREATE TYPE public.plan_tier AS ENUM ('starter', 'pro', 'agency');

-- Create enum for action types
CREATE TYPE public.ai_action_type AS ENUM ('page_generation', 'section_regeneration', 'ai_improvement', 'intelligence_refresh', 'style_change');

-- Create user_usage table
CREATE TABLE public.user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_tier plan_tier NOT NULL DEFAULT 'starter',
  ai_actions_limit INTEGER DEFAULT 30,
  ai_actions_used INTEGER NOT NULL DEFAULT 0,
  ai_actions_rollover INTEGER NOT NULL DEFAULT 0,
  grace_actions_given BOOLEAN NOT NULL DEFAULT false,
  billing_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create usage_log table
CREATE TABLE public.usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type ai_action_type NOT NULL,
  action_cost INTEGER NOT NULL,
  page_id UUID,
  section_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_usage
CREATE POLICY "Users can view their own usage"
ON public.user_usage
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
ON public.user_usage
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for usage_log
CREATE POLICY "Users can view their own usage logs"
ON public.usage_log
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage logs"
ON public.usage_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to handle new user - create usage record
CREATE OR REPLACE FUNCTION public.handle_new_user_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_usage (user_id, plan_tier, ai_actions_limit)
  VALUES (NEW.id, 'starter', 30)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger for new users
CREATE TRIGGER on_auth_user_created_usage
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_usage();

-- Function to track AI action usage (security definer for RLS bypass)
CREATE OR REPLACE FUNCTION public.track_ai_action(
  p_user_id UUID,
  p_action_type ai_action_type,
  p_action_cost INTEGER,
  p_page_id UUID DEFAULT NULL,
  p_section_type TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_usage RECORD;
  v_available INTEGER;
  v_remaining INTEGER;
BEGIN
  -- Get or create user usage record
  INSERT INTO public.user_usage (user_id, plan_tier, ai_actions_limit)
  VALUES (p_user_id, 'starter', 30)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_usage FROM public.user_usage WHERE user_id = p_user_id;

  -- Agency tier always allowed, don't track
  IF v_usage.plan_tier = 'agency' THEN
    RETURN jsonb_build_object('allowed', true, 'remaining', -1, 'unlimited', true);
  END IF;

  -- Calculate available actions
  v_available := COALESCE(v_usage.ai_actions_limit, 30) - v_usage.ai_actions_used + v_usage.ai_actions_rollover;

  -- Check if action is allowed
  IF p_action_cost > v_available THEN
    RETURN jsonb_build_object('allowed', false, 'remaining', v_available, 'unlimited', false);
  END IF;

  -- Deduct from rollover first, then from limit
  IF v_usage.ai_actions_rollover >= p_action_cost THEN
    UPDATE public.user_usage 
    SET ai_actions_rollover = ai_actions_rollover - p_action_cost,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE public.user_usage 
    SET ai_actions_used = ai_actions_used + (p_action_cost - ai_actions_rollover),
        ai_actions_rollover = 0,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  -- Log the action
  INSERT INTO public.usage_log (user_id, action_type, action_cost, page_id, section_type)
  VALUES (p_user_id, p_action_type, p_action_cost, p_page_id, p_section_type);

  v_remaining := v_available - p_action_cost;

  RETURN jsonb_build_object('allowed', true, 'remaining', v_remaining, 'unlimited', false);
END;
$$;

-- Function to grant grace actions
CREATE OR REPLACE FUNCTION public.grant_grace_actions(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_usage RECORD;
BEGIN
  SELECT * INTO v_usage FROM public.user_usage WHERE user_id = p_user_id;

  IF v_usage IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF v_usage.grace_actions_given THEN
    RETURN jsonb_build_object('success', false, 'error', 'Grace actions already used this billing period');
  END IF;

  UPDATE public.user_usage
  SET ai_actions_rollover = ai_actions_rollover + 3,
      grace_actions_given = true,
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'actions_granted', 3);
END;
$$;

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.user_usage
  SET 
    ai_actions_rollover = CASE 
      WHEN plan_tier = 'pro' THEN LEAST(COALESCE(ai_actions_limit, 150) - ai_actions_used, 50)
      ELSE 0
    END,
    ai_actions_used = 0,
    grace_actions_given = false,
    billing_period_start = now(),
    updated_at = now()
  WHERE billing_period_start <= now() - INTERVAL '30 days';
END;
$$;

-- Create index for faster lookups
CREATE INDEX idx_usage_log_user_created ON public.usage_log(user_id, created_at DESC);
CREATE INDEX idx_user_usage_user_id ON public.user_usage(user_id);