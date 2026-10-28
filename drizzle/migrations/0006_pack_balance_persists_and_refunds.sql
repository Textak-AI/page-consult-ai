-- Pack-purchased actions ("Never expire") live in user_usage.actions_purchased as a persistent balance.
-- Spend order: rollover -> monthly allowance -> pack balance. Monthly reset no longer clears packs.

ALTER TABLE public.usage_log
  ADD COLUMN IF NOT EXISTS charged_rollover integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS charged_monthly integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS charged_pack integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz;

-- Backfill: under the old model pack spend was folded into ai_actions_used beyond the limit.
UPDATE public.user_usage
SET actions_purchased = GREATEST(actions_purchased - (ai_actions_used - COALESCE(ai_actions_limit, 30)), 0),
    ai_actions_used = COALESCE(ai_actions_limit, 30)
WHERE ai_actions_used > COALESCE(ai_actions_limit, 30) AND plan_tier <> 'agency';

CREATE OR REPLACE FUNCTION public.track_ai_action(p_user_id uuid, p_action_type ai_action_type, p_action_cost integer, p_page_id uuid DEFAULT NULL::uuid, p_section_type text DEFAULT NULL::text, p_description text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_usage RECORD;
  v_monthly_left INTEGER;
  v_available INTEGER;
  v_rem INTEGER;
  v_from_rollover INTEGER;
  v_from_monthly INTEGER;
  v_from_pack INTEGER;
  v_log_id uuid;
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
    VALUES (p_user_id, p_action_type, p_action_cost, p_page_id, p_section_type, p_description)
    RETURNING id INTO v_log_id;
    RETURN jsonb_build_object('allowed', true, 'remaining', -1, 'unlimited', true, 'log_id', v_log_id);
  END IF;

  v_monthly_left := GREATEST(COALESCE(v_usage.ai_actions_limit, 30) - v_usage.ai_actions_used, 0);
  v_available := v_usage.ai_actions_rollover + v_monthly_left + v_usage.actions_purchased;

  IF p_action_cost > v_available THEN
    RETURN jsonb_build_object('allowed', false, 'remaining', v_available, 'unlimited', false);
  END IF;

  v_from_rollover := LEAST(v_usage.ai_actions_rollover, p_action_cost);
  v_rem := p_action_cost - v_from_rollover;
  v_from_monthly := LEAST(v_monthly_left, v_rem);
  v_from_pack := v_rem - v_from_monthly;

  UPDATE public.user_usage
  SET ai_actions_rollover = ai_actions_rollover - v_from_rollover,
      ai_actions_used = ai_actions_used + v_from_monthly,
      actions_purchased = actions_purchased - v_from_pack,
      updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO public.usage_log (user_id, action_type, action_cost, page_id, section_type, description,
                                charged_rollover, charged_monthly, charged_pack)
  VALUES (p_user_id, p_action_type, p_action_cost, p_page_id, p_section_type, p_description,
          v_from_rollover, v_from_monthly, v_from_pack)
  RETURNING id INTO v_log_id;

  RETURN jsonb_build_object('allowed', true, 'remaining', v_available - p_action_cost, 'unlimited', false,
    'log_id', v_log_id, 'from_rollover', v_from_rollover, 'from_monthly', v_from_monthly, 'from_pack', v_from_pack);
END;
$function$;

-- Server-only refund of a specific charge, restoring each bucket it drew from. Idempotent.
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
      updated_at = now()
  WHERE user_id = v_log.user_id;
  RETURN jsonb_build_object('refunded', true, 'actions', v_log.action_cost);
END;
$function$;
REVOKE ALL ON FUNCTION public.refund_ai_action(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refund_ai_action(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.user_usage
  SET
    ai_actions_rollover = CASE
      WHEN plan_tier = 'pro' THEN LEAST(GREATEST(COALESCE(ai_actions_limit, 150) - ai_actions_used, 0), 50)
      ELSE 0
    END,
    ai_actions_used = 0,
    -- actions_purchased (pack balance) intentionally persists: packs never expire
    grace_actions_given = false,
    billing_period_start = now(),
    billing_period_end = now() + INTERVAL '30 days',
    updated_at = now()
  WHERE billing_period_end <= now();
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.reset_monthly_usage() FROM PUBLIC, anon, authenticated;