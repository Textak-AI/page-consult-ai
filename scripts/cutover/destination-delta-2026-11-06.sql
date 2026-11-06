-- PageConsult AI — destination schema delta, 2026-11-06
-- Target: Supabase project ydskkkcdmtmjpvlmdkkt (pageconsult-production), which has
-- supabase/migrations (104) + drizzle 0000–0003 applied on 2026-10-26.
-- Contents: drizzle 0003 → 0014 in journal order (0003 included in case the Oct 26 apply
-- stopped at 0002; it is re-runnable). 0015 is a byte-identical duplicate of 0014
-- and is skipped; supabase/migrations 20261031210000 and 20261101040000 duplicate 0011 and
-- 0012 and are skipped. Statements made re-runnable where the originals were not
-- (quickpivot_leads table, guard_first_lead_email triggers) so a partial earlier run is safe.
-- Run in the SQL editor as one script. Expect "Success. No rows returned."
--
-- Preflight (run first, read the counts): should all be 0 before this script and 1 after.
-- SELECT
--   (SELECT count(*) FROM pg_tables WHERE schemaname='public' AND tablename='quickpivot_leads') AS quickpivot_leads,
--   (SELECT count(*) FROM pg_tables WHERE schemaname='public' AND tablename='edge_rate_limits') AS edge_rate_limits,
--   (SELECT count(*) FROM pg_proc WHERE proname='page_shows_badge') AS page_shows_badge,
--   (SELECT count(*) FROM pg_proc WHERE proname='roll_usage_period') AS roll_usage_period,
--   (SELECT count(*) FROM information_schema.columns WHERE table_name='profiles' AND column_name='onboarded_at') AS onboarded_at;


-- ===================== 0003_secure_anonymous_sessions =====================
-- Finding 2 has 12 scanner instances but 10 distinct policies (two demo policies counted twice).
DROP POLICY IF EXISTS "Token holders can read own session" ON public.guest_sessions;
DROP POLICY IF EXISTS "Token holders can update own session" ON public.guest_sessions;
DROP POLICY IF EXISTS "guest_sessions_anon_update_own_only" ON public.guest_sessions;
DROP POLICY IF EXISTS "Guest sessions can create own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Guest sessions can view own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Guest sessions can update own consultations" ON public.consultations;
DROP POLICY IF EXISTS "consultation_sessions_anon_insert_with_token" ON public.consultation_sessions;
DROP POLICY IF EXISTS "consultation_sessions_anon_update_own_only" ON public.consultation_sessions;
DROP POLICY IF EXISTS "Demo sessions updatable by session_id" ON public.demo_sessions;
DROP POLICY IF EXISTS "demo_sessions_anon_update" ON public.demo_sessions;
-- No browser anonymous INSERT operations remain on these session tables.
DROP POLICY IF EXISTS "Anon can create guest session" ON public.guest_sessions;
DROP POLICY IF EXISTS "guest_sessions_anon_insert" ON public.guest_sessions;
DROP POLICY IF EXISTS "Anon can insert own demo session" ON public.demo_sessions;
DROP POLICY IF EXISTS "demo_sessions_anon_insert" ON public.demo_sessions;
-- Preserve all deny-only anon policies, authenticated policies, and policies on other tables.

-- ===================== 0004_lifecycle_email_idempotency =====================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS welcome_email_sent_at timestamp with time zone;
ALTER TABLE public.landing_pages ADD COLUMN IF NOT EXISTS first_lead_email_sent_at timestamp with time zone;
COMMENT ON COLUMN public.profiles.welcome_email_sent_at IS 'Set by service role when the welcome email is sent; idempotency guard, written only by edge functions.';
COMMENT ON COLUMN public.landing_pages.first_lead_email_sent_at IS 'Set by service role when the first-lead email is sent; idempotency guard, written only by edge functions.';


-- ===================== 0005_enforce_usage_limits =====================
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
CREATE TABLE IF NOT EXISTS public.credit_pack_grants (
  stripe_session_id text PRIMARY KEY,
  user_id uuid NOT NULL,
  price_id text NOT NULL,
  actions integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_pack_grants TO authenticated;
GRANT ALL ON public.credit_pack_grants TO service_role;
ALTER TABLE public.credit_pack_grants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own pack grants" ON public.credit_pack_grants;
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


-- ===================== 0006_pack_balance_persists_and_refunds =====================
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


-- ===================== 0007_first_page_free_and_new_action_types =====================
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


-- ===================== 0008_page_shows_badge =====================
-- Server-side badge decision for published pages: shown unless the page owner is on a paid tier above starter.
-- Returns only a boolean; never exposes the owner or their plan.
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
    (SELECT u.plan_tier = 'starter' FROM owner o JOIN public.user_usage u ON u.user_id = o.user_id),
    true
  );
$function$;
REVOKE ALL ON FUNCTION public.page_shows_badge(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.page_shows_badge(text) TO anon, authenticated, service_role;


-- ===================== 0009_quickpivot_lead_capture =====================
ALTER TABLE public.prospect_pages ADD COLUMN IF NOT EXISTS first_lead_email_sent_at timestamptz;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS first_lead_email_sent_at timestamptz;
REVOKE UPDATE ON public.prospect_pages, public.prospects FROM authenticated;
GRANT UPDATE (source_demo_session_id, source_landing_page_id, prospect_name, prospect_email, prospect_title, prospect_company, prospect_industry, prospect_company_size, deal_stage, known_pain_points, competitive_situation, specific_use_case, custom_instructions, personalized_headline, personalized_subheadline, personalized_sections, personalized_brief, unique_slug, status, updated_at, published_at, expires_at, view_count, last_viewed_at) ON public.prospect_pages TO authenticated;
GRANT UPDATE (first_name, last_name, full_name, email, company, job_title, industry, context_raw, context_summary, meeting_context, base_page_id, personalized_headline, personalized_subhead, personalized_cta_text, slug, email_status, email_subject, email_body, email_sent_at, first_viewed_at, last_viewed_at, view_count, engagement_score, status, updated_at) ON public.prospects TO authenticated;
CREATE TABLE IF NOT EXISTS public.quickpivot_leads (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
 prospect_page_id uuid REFERENCES public.prospect_pages(id) ON DELETE CASCADE,
 prospect_id uuid REFERENCES public.prospects(id) ON DELETE CASCADE,
 prospect_slug text NOT NULL, page_title text, email varchar(255) NOT NULL,
 name varchar(255), phone varchar(50), company varchar(255), message text,
 custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb, source_url text,
 utm_source varchar(100), utm_medium varchar(100), utm_campaign varchar(100),
 submitted_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT one_prospect CHECK ((prospect_page_id IS NULL) <> (prospect_id IS NULL))
);
GRANT SELECT ON public.quickpivot_leads TO authenticated;
GRANT ALL ON public.quickpivot_leads TO service_role;
ALTER TABLE public.quickpivot_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners read QuickPivot leads" ON public.quickpivot_leads;
CREATE POLICY "Owners read QuickPivot leads" ON public.quickpivot_leads FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.guard_prospect_first_lead() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF current_user IN ('authenticated','anon') THEN
  IF TG_OP = 'INSERT' THEN NEW.first_lead_email_sent_at := NULL;
  ELSIF NEW.first_lead_email_sent_at IS DISTINCT FROM OLD.first_lead_email_sent_at THEN RAISE EXCEPTION 'First-lead timestamp is server-written'; END IF;
 END IF;
 RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS guard_first_lead_email ON public.prospect_pages;
CREATE TRIGGER guard_first_lead_email BEFORE INSERT OR UPDATE ON public.prospect_pages FOR EACH ROW EXECUTE FUNCTION public.guard_prospect_first_lead();
DROP TRIGGER IF EXISTS guard_first_lead_email ON public.prospects;
CREATE TRIGGER guard_first_lead_email BEFORE INSERT OR UPDATE ON public.prospects FOR EACH ROW EXECUTE FUNCTION public.guard_prospect_first_lead();
CREATE OR REPLACE FUNCTION public.claim_quickpivot_first_lead(p_lead_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE l public.quickpivot_leads; claimed uuid;
BEGIN
 SELECT * INTO l FROM public.quickpivot_leads WHERE id = p_lead_id;
 IF NOT FOUND THEN RETURN false; END IF;
 IF l.prospect_page_id IS NOT NULL THEN
  UPDATE public.prospect_pages SET first_lead_email_sent_at = now() WHERE id = l.prospect_page_id AND first_lead_email_sent_at IS NULL AND NOT EXISTS (SELECT 1 FROM public.quickpivot_leads q WHERE q.prospect_page_id = l.prospect_page_id AND (q.submitted_at,q.id) < (l.submitted_at,l.id)) RETURNING id INTO claimed;
 ELSE
  UPDATE public.prospects SET first_lead_email_sent_at = now() WHERE id = l.prospect_id AND first_lead_email_sent_at IS NULL AND NOT EXISTS (SELECT 1 FROM public.quickpivot_leads q WHERE q.prospect_id = l.prospect_id AND (q.submitted_at,q.id) < (l.submitted_at,l.id)) RETURNING id INTO claimed;
 END IF;
 RETURN claimed IS NOT NULL;
END; $$;
REVOKE ALL ON FUNCTION public.claim_quickpivot_first_lead(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_quickpivot_first_lead(uuid) TO service_role;


-- ===================== 0010_preserve_prospect_update_grants =====================
GRANT UPDATE ON public.prospect_pages, public.prospects TO authenticated;


-- ===================== 0011_edge_rate_limits =====================
-- Per-caller hourly limits for public (pre-sign-in) edge functions that spend AI credits.
-- Written and read only by edge functions with the service role. No client access.
CREATE TABLE IF NOT EXISTS public.edge_rate_limits (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fn text NOT NULL,
  caller_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS edge_rate_limits_lookup ON public.edge_rate_limits (fn, caller_hash, created_at DESC);

ALTER TABLE public.edge_rate_limits ENABLE ROW LEVEL SECURITY;

-- Block anon and authenticated entirely; the service role bypasses RLS.
DROP POLICY IF EXISTS "No client access" ON public.edge_rate_limits;
DROP POLICY IF EXISTS "No client access" ON public.edge_rate_limits;
CREATE POLICY "No client access" ON public.edge_rate_limits FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
REVOKE ALL ON public.edge_rate_limits FROM anon, authenticated;


-- ===================== 0011_no_trial_on_signup =====================
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


-- ===================== 0012_add_profiles_onboarded_at =====================
-- Customer onboarding: one short welcome after signup, once per account.
-- Existing RLS on public.profiles is unchanged (own-row select/insert/update via auth.uid() = id).
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;

-- Accounts that already started work are not sent through onboarding.
UPDATE public.profiles p
SET onboarded_at = now()
WHERE p.onboarded_at IS NULL
  AND (
    EXISTS (SELECT 1 FROM public.consultations c WHERE c.user_id = p.id)
    OR EXISTS (SELECT 1 FROM public.landing_pages l WHERE l.user_id = p.id)
  );


-- ===================== 0013_owner_test_allowance =====================
UPDATE public.user_usage
SET actions_purchased = COALESCE(actions_purchased, 0) + 100,
    updated_at = now()
WHERE user_id = 'fd662c75-6e1d-44f8-88ff-53b4429a137e';


-- ===================== 0014_monthly_allowance_renews =====================
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
