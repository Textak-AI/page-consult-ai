-- 1) Billing/usage columns on user_usage may only change via service role or SECURITY DEFINER functions
CREATE OR REPLACE FUNCTION public.guard_user_usage_billing_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.plan_tier := 'starter';
    NEW.ai_actions_limit := 30;
    NEW.ai_actions_used := 0;
    NEW.ai_actions_rollover := 0;
    NEW.actions_purchased := 0;
    NEW.grace_actions_given := false;
    NEW.stripe_customer_id := NULL;
    NEW.stripe_subscription_id := NULL;
    NEW.subscription_status := 'trialing';
    NEW.trial_start := now();
    NEW.trial_end := now() + interval '14 days';
    RETURN NEW;
  END IF;
  IF (NEW.user_id, NEW.plan_tier, NEW.ai_actions_limit, NEW.ai_actions_used, NEW.ai_actions_rollover,
      NEW.actions_purchased, NEW.grace_actions_given, NEW.billing_period_start, NEW.billing_period_end,
      NEW.stripe_customer_id, NEW.stripe_subscription_id, NEW.trial_start, NEW.trial_end, NEW.subscription_status)
     IS DISTINCT FROM
     (OLD.user_id, OLD.plan_tier, OLD.ai_actions_limit, OLD.ai_actions_used, OLD.ai_actions_rollover,
      OLD.actions_purchased, OLD.grace_actions_given, OLD.billing_period_start, OLD.billing_period_end,
      OLD.stripe_customer_id, OLD.stripe_subscription_id, OLD.trial_start, OLD.trial_end, OLD.subscription_status) THEN
    RAISE EXCEPTION 'Usage and billing fields can only be changed by the server';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_user_usage_billing ON public.user_usage;
CREATE TRIGGER trg_guard_user_usage_billing
BEFORE INSERT OR UPDATE ON public.user_usage
FOR EACH ROW EXECUTE FUNCTION public.guard_user_usage_billing_columns();

-- 2) track_ai_action: reject non-positive costs, lock row to prevent concurrent overspend
CREATE OR REPLACE FUNCTION public.track_ai_action(p_user_id uuid, p_action_type ai_action_type, p_action_cost integer, p_page_id uuid DEFAULT NULL::uuid, p_section_type text DEFAULT NULL::text, p_description text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_usage RECORD;
  v_available INTEGER;
  v_remaining INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'error', 'Authentication required');
  END IF;
  IF auth.uid() != p_user_id THEN
    RETURN jsonb_build_object('allowed', false, 'error', 'Cannot modify another user''s credits');
  END IF;
  IF p_action_cost IS NULL OR p_action_cost <= 0 THEN
    RETURN jsonb_build_object('allowed', false, 'error', 'Invalid action cost');
  END IF;

  INSERT INTO public.user_usage (user_id, plan_tier, ai_actions_limit)
  VALUES (p_user_id, 'starter', 30)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_usage FROM public.user_usage WHERE user_id = p_user_id FOR UPDATE;

  IF v_usage.plan_tier = 'agency' THEN
    INSERT INTO public.usage_log (user_id, action_type, action_cost, page_id, section_type, description)
    VALUES (p_user_id, p_action_type, p_action_cost, p_page_id, p_section_type, p_description);
    RETURN jsonb_build_object('allowed', true, 'remaining', -1, 'unlimited', true);
  END IF;

  v_available := COALESCE(v_usage.ai_actions_limit, 30) + v_usage.actions_purchased - v_usage.ai_actions_used + v_usage.ai_actions_rollover;

  IF p_action_cost > v_available THEN
    RETURN jsonb_build_object('allowed', false, 'remaining', v_available, 'unlimited', false);
  END IF;

  IF v_usage.ai_actions_rollover >= p_action_cost THEN
    UPDATE public.user_usage SET ai_actions_rollover = ai_actions_rollover - p_action_cost, updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE public.user_usage
    SET ai_actions_used = ai_actions_used + (p_action_cost - ai_actions_rollover), ai_actions_rollover = 0, updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  INSERT INTO public.usage_log (user_id, action_type, action_cost, page_id, section_type, description)
  VALUES (p_user_id, p_action_type, p_action_cost, p_page_id, p_section_type, p_description);

  v_remaining := v_available - p_action_cost;
  RETURN jsonb_build_object('allowed', true, 'remaining', v_remaining, 'unlimited', false);
END;
$function$;

-- 3) Idempotency ledger for one-time action-pack purchases (service role only)
CREATE TABLE public.credit_pack_grants (
  stripe_session_id text PRIMARY KEY,
  user_id uuid NOT NULL,
  price_id text NOT NULL,
  actions integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_pack_grants TO authenticated;
GRANT ALL ON public.credit_pack_grants TO service_role;
ALTER TABLE public.credit_pack_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own pack grants" ON public.credit_pack_grants
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 4) Atomic pack credit (service role only)
CREATE OR REPLACE FUNCTION public.grant_action_pack(p_session_id text, p_user_id uuid, p_price_id text, p_actions integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.credit_pack_grants (stripe_session_id, user_id, price_id, actions)
  VALUES (p_session_id, p_user_id, p_price_id, p_actions)
  ON CONFLICT (stripe_session_id) DO NOTHING;
  IF NOT FOUND THEN RETURN false; END IF;
  UPDATE public.user_usage SET actions_purchased = actions_purchased + p_actions, updated_at = now()
  WHERE user_id = p_user_id;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.grant_action_pack(text, uuid, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_action_pack(text, uuid, text, integer) TO service_role;