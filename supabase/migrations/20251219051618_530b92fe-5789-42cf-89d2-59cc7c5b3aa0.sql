-- Fix track_ai_action to validate auth.uid() matches p_user_id
-- This prevents users from draining other users' credits

CREATE OR REPLACE FUNCTION public.track_ai_action(
  p_user_id UUID, 
  p_action_type ai_action_type, 
  p_action_cost INTEGER, 
  p_page_id UUID DEFAULT NULL, 
  p_section_type TEXT DEFAULT NULL, 
  p_description TEXT DEFAULT NULL
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
  -- SECURITY: Validate caller owns the user_id
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'error', 'Authentication required');
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RETURN jsonb_build_object('allowed', false, 'error', 'Cannot modify another user''s credits');
  END IF;

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

-- Fix grant_grace_actions to validate auth.uid() matches p_user_id
-- This prevents users from granting themselves grace actions on other accounts

CREATE OR REPLACE FUNCTION public.grant_grace_actions(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_usage RECORD;
BEGIN
  -- SECURITY: Validate caller owns the user_id
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

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