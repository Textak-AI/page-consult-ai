-- ============================================================
-- COMPREHENSIVE RLS REMEDIATION MIGRATION
-- Purpose: Establish secure baseline for all tables
-- Date: January 2026
-- ============================================================

-- ============================================================
-- CATEGORY A: USER-OWNED DATA
-- Pattern: Block anon entirely, auth users access own records
-- ============================================================

-- === PROFILES ===
-- Note: profiles.id = auth.uid() (not user_id)
DROP POLICY IF EXISTS "profiles_anon_blocked_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_anon_blocked_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_anon_blocked_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_anon_blocked_delete" ON public.profiles;
DROP POLICY IF EXISTS "profiles_authenticated_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_authenticated_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_authenticated_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_authenticated_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_anon_blocked" ON public.profiles;
DROP POLICY IF EXISTS "profiles_users_own_only" ON public.profiles;

CREATE POLICY "profiles_anon_blocked" 
  ON public.profiles FOR ALL TO anon USING (false);

CREATE POLICY "profiles_users_own_only" 
  ON public.profiles FOR ALL TO authenticated 
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);


-- === CONSULTATIONS ===
DROP POLICY IF EXISTS "Users can view their own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can create own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can update own consultations" ON public.consultations;
DROP POLICY IF EXISTS "consultations_anon_blocked" ON public.consultations;
DROP POLICY IF EXISTS "consultations_users_own_only" ON public.consultations;

CREATE POLICY "consultations_anon_blocked" 
  ON public.consultations FOR ALL TO anon USING (false);

CREATE POLICY "consultations_users_own_only" 
  ON public.consultations FOR ALL TO authenticated 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- === LANDING_PAGES ===
DROP POLICY IF EXISTS "Users can view their own landing pages" ON public.landing_pages;
DROP POLICY IF EXISTS "Users can create own landing pages" ON public.landing_pages;
DROP POLICY IF EXISTS "Users can update own landing pages" ON public.landing_pages;
DROP POLICY IF EXISTS "Users can delete own landing pages" ON public.landing_pages;
DROP POLICY IF EXISTS "landing_pages_anon_blocked" ON public.landing_pages;
DROP POLICY IF EXISTS "landing_pages_users_own_only" ON public.landing_pages;

CREATE POLICY "landing_pages_anon_blocked" 
  ON public.landing_pages FOR ALL TO anon USING (false);

CREATE POLICY "landing_pages_users_own_only" 
  ON public.landing_pages FOR ALL TO authenticated 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- === BRAND_BRIEFS ===
DROP POLICY IF EXISTS "Users can manage own brand briefs" ON public.brand_briefs;
DROP POLICY IF EXISTS "brand_briefs_anon_blocked" ON public.brand_briefs;
DROP POLICY IF EXISTS "brand_briefs_users_own_only" ON public.brand_briefs;

CREATE POLICY "brand_briefs_anon_blocked" 
  ON public.brand_briefs FOR ALL TO anon USING (false);

CREATE POLICY "brand_briefs_users_own_only" 
  ON public.brand_briefs FOR ALL TO authenticated 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- === SUBSCRIPTIONS ===
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_anon_blocked" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_users_own_only" ON public.subscriptions;

CREATE POLICY "subscriptions_anon_blocked" 
  ON public.subscriptions FOR ALL TO anon USING (false);

-- Users can only SELECT their subscription (INSERT/UPDATE via Stripe webhook)
CREATE POLICY "subscriptions_users_own_only" 
  ON public.subscriptions FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);


-- === PROSPECTS ===
DROP POLICY IF EXISTS "Users can manage own prospects" ON public.prospects;
DROP POLICY IF EXISTS "prospects_anon_blocked" ON public.prospects;
DROP POLICY IF EXISTS "prospects_users_own_only" ON public.prospects;

CREATE POLICY "prospects_anon_blocked" 
  ON public.prospects FOR ALL TO anon USING (false);

CREATE POLICY "prospects_users_own_only" 
  ON public.prospects FOR ALL TO authenticated 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- === PROSPECT_PAGES ===
DROP POLICY IF EXISTS "Users can manage own prospect pages" ON public.prospect_pages;
DROP POLICY IF EXISTS "prospect_pages_anon_blocked" ON public.prospect_pages;
DROP POLICY IF EXISTS "prospect_pages_users_own_only" ON public.prospect_pages;

CREATE POLICY "prospect_pages_anon_blocked" 
  ON public.prospect_pages FOR ALL TO anon USING (false);

CREATE POLICY "prospect_pages_users_own_only" 
  ON public.prospect_pages FOR ALL TO authenticated 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- === BETA_PAGES ===
DROP POLICY IF EXISTS "Users can manage own beta pages" ON public.beta_pages;
DROP POLICY IF EXISTS "beta_pages_anon_blocked" ON public.beta_pages;
DROP POLICY IF EXISTS "beta_pages_users_own_only" ON public.beta_pages;

CREATE POLICY "beta_pages_anon_blocked" 
  ON public.beta_pages FOR ALL TO anon USING (false);

CREATE POLICY "beta_pages_users_own_only" 
  ON public.beta_pages FOR ALL TO authenticated 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- === PERSONA_INTELLIGENCE ===
DROP POLICY IF EXISTS "Users can manage own persona intelligence" ON public.persona_intelligence;
DROP POLICY IF EXISTS "persona_intelligence_anon_blocked" ON public.persona_intelligence;
DROP POLICY IF EXISTS "persona_intelligence_users_own_only" ON public.persona_intelligence;

CREATE POLICY "persona_intelligence_anon_blocked" 
  ON public.persona_intelligence FOR ALL TO anon USING (false);

CREATE POLICY "persona_intelligence_users_own_only" 
  ON public.persona_intelligence FOR ALL TO authenticated 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- === GENERATION_LOGS ===
DROP POLICY IF EXISTS "Users can view own generation logs" ON public.generation_logs;
DROP POLICY IF EXISTS "generation_logs_anon_blocked" ON public.generation_logs;
DROP POLICY IF EXISTS "generation_logs_users_own_only" ON public.generation_logs;

CREATE POLICY "generation_logs_anon_blocked" 
  ON public.generation_logs FOR ALL TO anon USING (false);

CREATE POLICY "generation_logs_users_own_only" 
  ON public.generation_logs FOR ALL TO authenticated 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- === TESTIMONIAL_REQUESTS ===
DROP POLICY IF EXISTS "Users can manage own testimonial requests" ON public.testimonial_requests;
DROP POLICY IF EXISTS "testimonial_requests_anon_blocked" ON public.testimonial_requests;
DROP POLICY IF EXISTS "testimonial_requests_users_own_only" ON public.testimonial_requests;

CREATE POLICY "testimonial_requests_anon_blocked" 
  ON public.testimonial_requests FOR ALL TO anon USING (false);

CREATE POLICY "testimonial_requests_users_own_only" 
  ON public.testimonial_requests FOR ALL TO authenticated 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- === CONSULTATION_DRAFTS ===
DROP POLICY IF EXISTS "Users can manage own consultation drafts" ON public.consultation_drafts;
DROP POLICY IF EXISTS "consultation_drafts_anon_blocked" ON public.consultation_drafts;
DROP POLICY IF EXISTS "consultation_drafts_users_own_only" ON public.consultation_drafts;

CREATE POLICY "consultation_drafts_anon_blocked" 
  ON public.consultation_drafts FOR ALL TO anon USING (false);

CREATE POLICY "consultation_drafts_users_own_only" 
  ON public.consultation_drafts FOR ALL TO authenticated 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- === USER_USAGE ===
DROP POLICY IF EXISTS "Users can view own usage" ON public.user_usage;
DROP POLICY IF EXISTS "user_usage_anon_blocked" ON public.user_usage;
DROP POLICY IF EXISTS "user_usage_users_own_only" ON public.user_usage;

CREATE POLICY "user_usage_anon_blocked" 
  ON public.user_usage FOR ALL TO anon USING (false);

CREATE POLICY "user_usage_users_own_only" 
  ON public.user_usage FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);


-- === USAGE_LOG ===
DROP POLICY IF EXISTS "Users can view own usage log" ON public.usage_log;
DROP POLICY IF EXISTS "usage_log_anon_blocked" ON public.usage_log;
DROP POLICY IF EXISTS "usage_log_users_own_only" ON public.usage_log;

CREATE POLICY "usage_log_anon_blocked" 
  ON public.usage_log FOR ALL TO anon USING (false);

CREATE POLICY "usage_log_users_own_only" 
  ON public.usage_log FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);


-- === USER_PLANS ===
DROP POLICY IF EXISTS "Users can view own plan" ON public.user_plans;
DROP POLICY IF EXISTS "user_plans_anon_blocked" ON public.user_plans;
DROP POLICY IF EXISTS "user_plans_users_own_only" ON public.user_plans;

CREATE POLICY "user_plans_anon_blocked" 
  ON public.user_plans FOR ALL TO anon USING (false);

CREATE POLICY "user_plans_users_own_only" 
  ON public.user_plans FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);


-- === ADMIN_ROLES ===
-- Special: Only admins can read, service role manages
DROP POLICY IF EXISTS "admin_roles_anon_blocked" ON public.admin_roles;
DROP POLICY IF EXISTS "admin_roles_admin_read" ON public.admin_roles;

CREATE POLICY "admin_roles_anon_blocked" 
  ON public.admin_roles FOR ALL TO anon USING (false);

CREATE POLICY "admin_roles_admin_read" 
  ON public.admin_roles FOR SELECT TO authenticated 
  USING (is_admin(auth.uid()));


-- ============================================================
-- CATEGORY B: ANONYMOUS INSERT + AUTHENTICATED READ
-- Pattern: Anon can insert, anon cannot read, auth users own records
-- ============================================================

-- === DEMO_LEADS ===
DROP POLICY IF EXISTS "demo_leads_anon_insert_only" ON public.demo_leads;
DROP POLICY IF EXISTS "demo_leads_anon_no_select" ON public.demo_leads;
DROP POLICY IF EXISTS "demo_leads_anon_no_update" ON public.demo_leads;
DROP POLICY IF EXISTS "demo_leads_anon_no_delete" ON public.demo_leads;
DROP POLICY IF EXISTS "demo_leads_admin_select" ON public.demo_leads;
DROP POLICY IF EXISTS "demo_leads_anon_insert" ON public.demo_leads;
DROP POLICY IF EXISTS "demo_leads_anon_no_read" ON public.demo_leads;
DROP POLICY IF EXISTS "demo_leads_users_own_only" ON public.demo_leads;

CREATE POLICY "demo_leads_anon_insert" 
  ON public.demo_leads FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "demo_leads_anon_no_read" 
  ON public.demo_leads FOR SELECT TO anon USING (false);

CREATE POLICY "demo_leads_anon_no_update" 
  ON public.demo_leads FOR UPDATE TO anon USING (false);

CREATE POLICY "demo_leads_anon_no_delete" 
  ON public.demo_leads FOR DELETE TO anon USING (false);

-- Only admins can view demo leads
CREATE POLICY "demo_leads_admin_read" 
  ON public.demo_leads FOR SELECT TO authenticated 
  USING (is_admin(auth.uid()));


-- === DEMO_SESSIONS ===
DROP POLICY IF EXISTS "Anyone can create demo sessions" ON public.demo_sessions;
DROP POLICY IF EXISTS "Anyone can update demo sessions" ON public.demo_sessions;
DROP POLICY IF EXISTS "demo_sessions_anon_insert" ON public.demo_sessions;
DROP POLICY IF EXISTS "demo_sessions_anon_update" ON public.demo_sessions;
DROP POLICY IF EXISTS "demo_sessions_anon_no_read" ON public.demo_sessions;
DROP POLICY IF EXISTS "demo_sessions_anon_no_delete" ON public.demo_sessions;
DROP POLICY IF EXISTS "demo_sessions_users_own_only" ON public.demo_sessions;

CREATE POLICY "demo_sessions_anon_insert" 
  ON public.demo_sessions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "demo_sessions_anon_update" 
  ON public.demo_sessions FOR UPDATE TO anon 
  USING (true) WITH CHECK (true);

CREATE POLICY "demo_sessions_anon_no_read" 
  ON public.demo_sessions FOR SELECT TO anon USING (false);

CREATE POLICY "demo_sessions_anon_no_delete" 
  ON public.demo_sessions FOR DELETE TO anon USING (false);

CREATE POLICY "demo_sessions_users_own_only" 
  ON public.demo_sessions FOR ALL TO authenticated 
  USING (claimed_by = auth.uid());


-- === LEADS ===
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
DROP POLICY IF EXISTS "leads_anon_insert" ON public.leads;
DROP POLICY IF EXISTS "leads_anon_no_read" ON public.leads;
DROP POLICY IF EXISTS "leads_anon_no_update" ON public.leads;
DROP POLICY IF EXISTS "leads_anon_no_delete" ON public.leads;
DROP POLICY IF EXISTS "leads_users_own_only" ON public.leads;

CREATE POLICY "leads_anon_insert" 
  ON public.leads FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "leads_anon_no_read" 
  ON public.leads FOR SELECT TO anon USING (false);

CREATE POLICY "leads_anon_no_update" 
  ON public.leads FOR UPDATE TO anon USING (false);

CREATE POLICY "leads_anon_no_delete" 
  ON public.leads FOR DELETE TO anon USING (false);

-- Admin can view all leads
CREATE POLICY "leads_admin_read" 
  ON public.leads FOR SELECT TO authenticated 
  USING (is_admin(auth.uid()) OR converted_to_user_id = auth.uid());


-- === GUEST_SESSIONS ===
DROP POLICY IF EXISTS "Anyone can create guest sessions" ON public.guest_sessions;
DROP POLICY IF EXISTS "Anyone can update guest sessions" ON public.guest_sessions;
DROP POLICY IF EXISTS "guest_sessions_anon_insert" ON public.guest_sessions;
DROP POLICY IF EXISTS "guest_sessions_anon_update" ON public.guest_sessions;
DROP POLICY IF EXISTS "guest_sessions_anon_no_read" ON public.guest_sessions;
DROP POLICY IF EXISTS "guest_sessions_users_own_only" ON public.guest_sessions;

CREATE POLICY "guest_sessions_anon_insert" 
  ON public.guest_sessions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "guest_sessions_anon_update" 
  ON public.guest_sessions FOR UPDATE TO anon 
  USING (true) WITH CHECK (true);

CREATE POLICY "guest_sessions_anon_no_read" 
  ON public.guest_sessions FOR SELECT TO anon USING (false);

CREATE POLICY "guest_sessions_users_own_only" 
  ON public.guest_sessions FOR ALL TO authenticated 
  USING (converted_to_user_id = auth.uid());


-- === BETA_SIGNUPS ===
DROP POLICY IF EXISTS "Anyone can create beta signups" ON public.beta_signups;
DROP POLICY IF EXISTS "beta_signups_anon_insert" ON public.beta_signups;
DROP POLICY IF EXISTS "beta_signups_anon_no_read" ON public.beta_signups;
DROP POLICY IF EXISTS "beta_signups_users_own_only" ON public.beta_signups;

CREATE POLICY "beta_signups_anon_insert" 
  ON public.beta_signups FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "beta_signups_anon_no_read" 
  ON public.beta_signups FOR SELECT TO anon USING (false);

-- Users can view signups to their beta pages
CREATE POLICY "beta_signups_users_own_only" 
  ON public.beta_signups FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.beta_pages bp 
      WHERE bp.id = beta_signups.page_id 
      AND bp.user_id = auth.uid()
    )
  );


-- === PROSPECT_VIEWS ===
DROP POLICY IF EXISTS "Anyone can log prospect views" ON public.prospect_views;
DROP POLICY IF EXISTS "prospect_views_anon_insert" ON public.prospect_views;
DROP POLICY IF EXISTS "prospect_views_anon_no_read" ON public.prospect_views;
DROP POLICY IF EXISTS "prospect_views_users_own_only" ON public.prospect_views;

CREATE POLICY "prospect_views_anon_insert" 
  ON public.prospect_views FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "prospect_views_anon_no_read" 
  ON public.prospect_views FOR SELECT TO anon USING (false);

CREATE POLICY "prospect_views_users_own_only" 
  ON public.prospect_views FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.prospects p 
      WHERE p.id = prospect_views.prospect_id 
      AND p.user_id = auth.uid()
    )
  );


-- === PROSPECT_PAGE_VIEWS ===
DROP POLICY IF EXISTS "Anyone can log prospect page views" ON public.prospect_page_views;
DROP POLICY IF EXISTS "prospect_page_views_anon_insert" ON public.prospect_page_views;
DROP POLICY IF EXISTS "prospect_page_views_anon_no_read" ON public.prospect_page_views;
DROP POLICY IF EXISTS "prospect_page_views_users_own_only" ON public.prospect_page_views;

CREATE POLICY "prospect_page_views_anon_insert" 
  ON public.prospect_page_views FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "prospect_page_views_anon_no_read" 
  ON public.prospect_page_views FOR SELECT TO anon USING (false);

CREATE POLICY "prospect_page_views_users_own_only" 
  ON public.prospect_page_views FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.prospect_pages pp 
      WHERE pp.id = prospect_page_views.prospect_page_id 
      AND pp.user_id = auth.uid()
    )
  );


-- === CONSULTATION_SESSIONS ===
DROP POLICY IF EXISTS "Anyone can create consultation sessions" ON public.consultation_sessions;
DROP POLICY IF EXISTS "consultation_sessions_anon_insert" ON public.consultation_sessions;
DROP POLICY IF EXISTS "consultation_sessions_anon_update" ON public.consultation_sessions;
DROP POLICY IF EXISTS "consultation_sessions_anon_no_read" ON public.consultation_sessions;
DROP POLICY IF EXISTS "consultation_sessions_users_own_only" ON public.consultation_sessions;

CREATE POLICY "consultation_sessions_anon_insert" 
  ON public.consultation_sessions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "consultation_sessions_anon_update" 
  ON public.consultation_sessions FOR UPDATE TO anon 
  USING (true) WITH CHECK (true);

CREATE POLICY "consultation_sessions_anon_no_read" 
  ON public.consultation_sessions FOR SELECT TO anon USING (false);

CREATE POLICY "consultation_sessions_users_own_only" 
  ON public.consultation_sessions FOR ALL TO authenticated 
  USING (user_id = auth.uid());


-- ============================================================
-- CATEGORY C: SERVICE-ROLE ONLY (RLS enabled, no policies)
-- ============================================================

-- === BRAND_SCENE_CACHE ===
DROP POLICY IF EXISTS "Anyone can read brand scene cache" ON public.brand_scene_cache;
DROP POLICY IF EXISTS "Anyone can insert brand scene cache" ON public.brand_scene_cache;
-- No policies = blocked for clients, open for service role

-- === BRAND_SCENE_GENERATIONS ===
DROP POLICY IF EXISTS "Anyone can insert brand scene generations" ON public.brand_scene_generations;
-- No policies = blocked for clients, open for service role

-- === DEMO_MARKET_CACHE ===
DROP POLICY IF EXISTS "Anyone can read demo market cache" ON public.demo_market_cache;
DROP POLICY IF EXISTS "Anyone can insert demo market cache" ON public.demo_market_cache;
-- No policies = blocked for clients, open for service role

-- === HERO_IMAGE_CACHE ===
DROP POLICY IF EXISTS "Anyone can read hero image cache" ON public.hero_image_cache;
DROP POLICY IF EXISTS "Anyone can insert hero image cache" ON public.hero_image_cache;
-- No policies = blocked for clients, open for service role


-- ============================================================
-- CATEGORY D: REFERENCE/LOOKUP TABLES (Public read)
-- ============================================================

-- === INDUSTRIES ===
DROP POLICY IF EXISTS "Anyone can read industries" ON public.industries;
DROP POLICY IF EXISTS "industries_public_read" ON public.industries;

CREATE POLICY "industries_public_read" 
  ON public.industries FOR SELECT TO anon, authenticated USING (true);