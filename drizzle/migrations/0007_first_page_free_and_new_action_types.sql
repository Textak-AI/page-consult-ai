ALTER TYPE public.ai_action_type ADD VALUE IF NOT EXISTS 'section_chat';
ALTER TYPE public.ai_action_type ADD VALUE IF NOT EXISTS 'image_generation';
ALTER TYPE public.ai_action_type ADD VALUE IF NOT EXISTS 'prospect_page';

-- Durable per-account record that the free first page build has been consumed (server-written only).
ALTER TABLE public.user_usage ADD COLUMN IF NOT EXISTS free_page_build_used_at timestamptz;
ALTER TABLE public.usage_log ADD COLUMN IF NOT EXISTS used_free_build boolean NOT NULL DEFAULT false;

-- Accounts that already built a page have used their free build.
UPDATE public.user_usage u
SET free_page_build_used_at = p.first_at
FROM (SELECT user_id, min(created_at) AS first_at FROM public.landing_pages GROUP BY user_id) p
WHERE p.user_id = u.user_id AND u.free_page_build_used_at IS NULL;

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
    NEW.free_page_build_used_at := NULL;
    RETURN NEW;
  END IF;
  IF (NEW.user_id, NEW.plan_tier, NEW.ai_actions_limit, NEW.ai_actions_used, NEW.ai_actions_rollover,
      NEW.actions_purchased, NEW.grace_actions_given, NEW.billing_period_start, NEW.billing_period_end,
      NEW.stripe_customer_id, NEW.stripe_subscription_id, NEW.trial_start, NEW.trial_end, NEW.subscription_status,
      NEW.free_page_build_used_at)
     IS DISTINCT FROM
     (OLD.user_id, OLD.plan_tier, OLD.ai_actions_limit, OLD.ai_actions_used, OLD.ai_actions_rollover,
      OLD.actions_purchased, OLD.grace_actions_given, OLD.billing_period_start, OLD.billing_period_end,
      OLD.stripe_customer_id, OLD.stripe_subscription_id, OLD.trial_start, OLD.trial_end, OLD.subscription_status,
      OLD.free_page_build_used_at) THEN
    RAISE EXCEPTION 'Usage and billing fields can only be changed by the server';
  END IF;
  RETURN NEW;
END;
$$;

-- New page build: the account's first is free (consumed once, atomically); later builds charge p_cost.
CREATE OR REPLACE FUNCTION public.charge_page_build(p_user_id uuid, p_cost integer, p_page_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_usage RECORD;
  v_log_id uuid;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RETURN jsonb_build_object('allowed', false, 'error', 'Authentication required');
  END IF;

  INSERT INTO public.user_usage (user_id, plan_tier, ai_actions_limit)
  VALUES (p_user_id, 'starter', 30)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_usage FROM public.user_usage WHERE user_id = p_user_id FOR UPDATE;

  IF v_usage.free_page_build_used_at IS NULL THEN
    UPDATE public.user_usage SET free_page_build_used_at = now(), updated_at = now() WHERE user_id = p_user_id;
    INSERT INTO public.usage_log (user_id, action_type, action_cost, page_id, description, used_free_build)
    VALUES (p_user_id, 'page_generation', 0, p_page_id, 'First page free', true)
    RETURNING id INTO v_log_id;
    RETURN jsonb_build_object('allowed', true, 'free', true, 'log_id', v_log_id);
  END IF;

  RETURN public.track_ai_action(p_user_id, 'page_generation', p_cost, p_page_id, NULL, 'Page build');
END;
$function$;
REVOKE ALL ON FUNCTION public.charge_page_build(uuid, integer, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.charge_page_build(uuid, integer, uuid) TO authenticated, service_role;

-- Refund also restores an unconsumed free build.
CREATE OR REPLACE FUNCTION public.refund_ai_action(p_log_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_log RECORD;
BEGIN
  UPDATE public.usage_log SET refunded_at = now()
  WHERE id = p_log_id AND refunded_at IS NULL
  RETURNING * INTO v_log;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('refunded', false);
  END IF;
  UPDATE public.user_usage
  SET ai_actions_rollover = ai_actions_rollover + v_log.charged_rollover,
      ai_actions_used = GREATEST(ai_actions_used - v_log.charged_monthly, 0),
      actions_purchased = actions_purchased + v_log.charged_pack,
      free_page_build_used_at = CASE WHEN v_log.used_free_build THEN NULL ELSE free_page_build_used_at END,
      updated_at = now()
  WHERE user_id = v_log.user_id;
  RETURN jsonb_build_object('refunded', true, 'actions', v_log.action_cost, 'free_build_restored', v_log.used_free_build);
END;
$function$;
REVOKE ALL ON FUNCTION public.refund_ai_action(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refund_ai_action(uuid) TO service_role;