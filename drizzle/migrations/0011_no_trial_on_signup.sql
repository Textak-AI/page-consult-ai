-- Free accounts are not trials: the free plan has no clock. Nothing enforces
-- trial_end anywhere (allowances are enforced per-action via track_ai_action),
-- so new rows no longer claim 'trialing' or carry trial dates. Stripe paid
-- subscriptions no longer use trial_period_days either (checkout change).
-- Only the INSERT defaults change; the server-only update guard is unchanged.

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
    NEW.subscription_status := 'free';
    NEW.trial_start := NULL;
    NEW.trial_end := NULL;
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

-- Existing free rows: drop the fictional trial state. Rows attached to a real
-- Stripe subscription are left alone (their status comes from the webhook).
UPDATE public.user_usage
SET subscription_status = 'free', trial_start = NULL, trial_end = NULL
WHERE subscription_status = 'trialing' AND stripe_subscription_id IS NULL;
