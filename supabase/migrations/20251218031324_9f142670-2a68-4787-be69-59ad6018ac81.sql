-- Extend user_usage table with missing fields
ALTER TABLE public.user_usage 
ADD COLUMN IF NOT EXISTS actions_purchased INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS billing_period_end TIMESTAMP WITH TIME ZONE;

-- Add description column to usage_log for audit trail
ALTER TABLE public.usage_log 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update billing_period_end to be 30 days from start for existing records
UPDATE public.user_usage 
SET billing_period_end = billing_period_start + INTERVAL '30 days'
WHERE billing_period_end IS NULL;

-- Add new action types to the enum
ALTER TYPE public.ai_action_type ADD VALUE IF NOT EXISTS 'research';
ALTER TYPE public.ai_action_type ADD VALUE IF NOT EXISTS 'consultation';
ALTER TYPE public.ai_action_type ADD VALUE IF NOT EXISTS 'generation';
ALTER TYPE public.ai_action_type ADD VALUE IF NOT EXISTS 'revision';
ALTER TYPE public.ai_action_type ADD VALUE IF NOT EXISTS 'calculator';
ALTER TYPE public.ai_action_type ADD VALUE IF NOT EXISTS 'copy_improve';

-- Update the track_ai_action function to include description and handle purchased credits
CREATE OR REPLACE FUNCTION public.track_ai_action(
  p_user_id uuid, 
  p_action_type ai_action_type, 
  p_action_cost integer, 
  p_page_id uuid DEFAULT NULL, 
  p_section_type text DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    INSERT INTO public.usage_log (user_id, action_type, action_cost, page_id, section_type, description)
    VALUES (p_user_id, p_action_type, p_action_cost, p_page_id, p_section_type, p_description);
    RETURN jsonb_build_object('allowed', true, 'remaining', -1, 'unlimited', true);
  END IF;

  -- Calculate available actions (limit + purchased + rollover - used)
  v_available := COALESCE(v_usage.ai_actions_limit, 30) + v_usage.actions_purchased - v_usage.ai_actions_used + v_usage.ai_actions_rollover;

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

  -- Log the action with description
  INSERT INTO public.usage_log (user_id, action_type, action_cost, page_id, section_type, description)
  VALUES (p_user_id, p_action_type, p_action_cost, p_page_id, p_section_type, p_description);

  v_remaining := v_available - p_action_cost;

  RETURN jsonb_build_object('allowed', true, 'remaining', v_remaining, 'unlimited', false);
END;
$$;

-- Update reset function to handle billing_period_end
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.user_usage
  SET 
    ai_actions_rollover = CASE 
      WHEN plan_tier = 'pro' THEN LEAST(COALESCE(ai_actions_limit, 150) - ai_actions_used, 50)
      ELSE 0
    END,
    ai_actions_used = 0,
    actions_purchased = 0,
    grace_actions_given = false,
    billing_period_start = now(),
    billing_period_end = now() + INTERVAL '30 days',
    updated_at = now()
  WHERE billing_period_end <= now();
END;
$$;