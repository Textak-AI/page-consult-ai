-- Monthly allowances actually renew (Nov 3, Stripe live readiness).
-- Before this, nothing ever called reset_monthly_usage and billing_period_end was NULL
-- for most accounts, so a free or paid account's monthly actions never came back.
--   * roll_usage_period: starts a new 30-day period when the current one has ended or never
--     started (used -> 0, Pro rollover up to 50, packs untouched). Called at the start of every
--     charge and by refresh_my_usage, so no scheduler is needed. Paid subscriptions also get
--     their exact Stripe period from the invoice.paid webhook.
--   * refresh_my_usage: lets the signed-in owner's own row roll over before the balance is shown.
--   * page_shows_badge: hidden for any active paid subscription (paid Starter included), shown
--     for free accounts. Mirrors showsBadgeForTier in supabase/functions/_shared/planLimits.ts.
-- Existing RLS policies, grants and the billing-column guard trigger are unchanged.

CREATE OR REPLACE FUNCTION public.roll_usage_period(p_user_id uuid)
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
    grace_actions_given = false,
    billing_period_start = now(),
    billing_period_end = now() + INTERVAL '30 days',
    updated_at = now()
  WHERE user_id = p_user_id
    AND (billing_period_end IS NULL OR billing_period_end <= now());
END;
$function$;
REVOKE ALL ON FUNCTION public.roll_usage_period(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.roll_usage_period(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.refresh_my_usage()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  PERFORM public.roll_usage_period(auth.uid());
END;
$function$;
REVOKE ALL ON FUNCTION public.refresh_my_usage() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.refresh_my_usage() TO authenticated, service_role;

-- Same function as 0006, plus the period roll before the balance is read.
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

  -- Start a new monthly period first if the current one has ended (or never started).
  PERFORM public.roll_usage_period(p_user_id);

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

-- Kept for any external caller; now also covers rows that never had a period.
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT user_id FROM public.user_usage WHERE billing_period_end IS NULL OR billing_period_end <= now() LOOP
    PERFORM public.roll_usage_period(r.user_id);
  END LOOP;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.reset_monthly_usage() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.page_shows_badge(page_slug text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH owner AS (
    SELECT user_id FROM public.published_pages WHERE slug = page_slug AND status = 'published'
    UNION ALL
    SELECT user_id FROM public.landing_pages WHERE slug = page_slug AND (status = 'published' OR is_published = true)
    LIMIT 1
  )
  SELECT COALESCE(
    (SELECT u.plan_tier = 'starter' AND COALESCE(u.subscription_status, '') <> 'active'
       FROM owner o JOIN public.user_usage u ON u.user_id = o.user_id),
    true
  );
$function$;
REVOKE ALL ON FUNCTION public.page_shows_badge(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.page_shows_badge(text) TO anon, authenticated, service_role;
