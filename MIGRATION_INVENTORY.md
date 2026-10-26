# Migration inventory

Audit date: 2026-10-26 (UTC). Destination: self-managed Supabase + Vercel. Documentation only; no application, schema, or configuration changes. Credential **names only**; no credential values are included.

Evidence: repository source; production PostgreSQL catalogs and applied migration statements; hosted public Auth settings; hosted Site URL / redirect allowlist; configured secret names. Source inventory is not proof every function is deployed or every third-party account is configured.

## 1. EDGE FUNCTIONS

71 deployable `supabase/functions/<name>/index.ts` entrypoints. `_shared/` and its `industryLayouts/` subtree are dependency source, not extra deployments. Their inspected TypeScript has no environment reads. Deploy the dependency source with the handlers.

Auth below distinguishes handler user verification from an outgoing provider Authorization header. Repository gateway `verify_jwt` is separate; preserve deliberately public endpoints, and verify destination JWT/key compatibility. Unspecified gateway settings are not assumed. No Edge Function directly addresses a storage bucket in inspected source; frontend Storage access is inventoried in section 4.

| Function | Environment / secret names read | Tables touched (including dynamic lists) | Buckets | Handler auth validation | Repository gateway verify_jwt | Outbound API evidence |
|---|---|---|---|---|---|---|
| admin-delete-consultation | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | admin_roles, consultations, landing_pages | — | JWT verified in handler | true | — |
| admin-delete-page | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | admin_roles, landing_pages | — | JWT verified in handler | true | — |
| admin-delete-user | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | admin_roles, brand_briefs, consultation_drafts, consultation_sessions, consultations, generation_logs, landing_pages, persona_intelligence, testimonial_requests, usage_log, user_plans, user_usage | — | JWT verified in handler | true | — |
| admin-get-consultations | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | admin_roles, consultations | — | JWT verified in handler | true | — |
| admin-get-pages | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | admin_roles, landing_pages | — | JWT verified in handler | true | — |
| admin-get-stats | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | admin_roles, beta_signups, consultations, landing_pages | — | JWT verified in handler | true | — |
| admin-get-users | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | admin_roles, landing_pages, user_usage | — | JWT verified in handler | true | — |
| ai-consultant | LOVABLE_API_KEY, SUPABASE_ANON_KEY, SUPABASE_URL | user_plans | — | JWT verified in handler | true | https://ai.gateway.lovable.dev/v1/chat/completions |
| analyze-website | LOVABLE_API_KEY | — | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | false | https://${normalizedUrl}, https://ai.gateway.lovable.dev/v1/chat/completions |
| anthropic-proxy | ANTHROPIC_API_KEY, SUPABASE_ANON_KEY, SUPABASE_URL | — | — | JWT verified in handler | true | Anthropic SDK |
| beta-signup | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | beta_pages, beta_signups | — | No Authorization handling seen | false | — |
| beta-stats | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | beta_pages, beta_signups | — | No Authorization handling seen | false | — |
| classify-industry | ANTHROPIC_API_KEY, SUPABASE_ANON_KEY, SUPABASE_URL | — | — | JWT verified in handler | false | Anthropic SDK |
| clear-session-cookie | — | — | — | No Authorization handling seen | false | — |
| company-research | PERPLEXITY_API_KEY | — | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | false | https://api.perplexity.ai/chat/completions |
| consultant-chat | ANTHROPIC_API_KEY | — | — | No Authorization handling seen | false | Anthropic SDK; https://api.anthropic.com/v1/messages |
| consultant-suggestions | LOVABLE_API_KEY | — | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | true | https://ai.gateway.lovable.dev/v1/chat/completions |
| create-anonymous-session | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | consultation_sessions | — | No Authorization handling seen | false | — |
| create-checkout-session | STRIPE_PRICE_AGENCY, STRIPE_PRICE_FOUNDING, STRIPE_PRICE_PRO, STRIPE_PRICE_STARTER, STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | subscriptions, user_usage | — | JWT verified in handler | true | Stripe SDK (api.stripe.com) |
| delete-user | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | admin_roles, beta_pages, brand_briefs, consultation_drafts, consultation_sessions, consultations, generation_logs, landing_pages, persona_intelligence, prospect_pages, subscriptions, testimonial_requests, usage_log, user_plans, user_usage | — | JWT verified in handler | true | — |
| demo-extract-intelligence | LOVABLE_API_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | demo_sessions | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | false | https://ai.gateway.lovable.dev/v1/chat/completions |
| demo-generate-response | LOVABLE_API_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | demo_sessions | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | false | https://ai.gateway.lovable.dev/v1/chat/completions |
| demo-market-research | PERPLEXITY_API_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | demo_market_cache, demo_sessions | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | false | https://api.perplexity.ai/chat/completions |
| demo-update-session | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | demo_sessions | — | No Authorization handling seen | false | — |
| extract-ai-seo-data | ANTHROPIC_API_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | consultations | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | true | Anthropic SDK; https://api.anthropic.com/v1/messages |
| extract-brand | — | — | — | No Authorization handling seen | false | https://${normalizedUrl} |
| extract-brand-brief | ANTHROPIC_API_KEY, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | brand_briefs | — | JWT verified in handler | true | Anthropic SDK |
| extract-colors-from-image | LOVABLE_API_KEY | — | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | false | https://ai.gateway.lovable.dev/v1/chat/completions |
| extract-communication-style | LOVABLE_API_KEY | — | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | false | Anthropic SDK; https://ai.gateway.lovable.dev/v1/chat/completions |
| extract-logo | — | — | — | No Authorization handling seen | false | — |
| extract-style-inspiration | LOVABLE_API_KEY | — | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | unspecified | Stripe SDK (api.stripe.com) |
| extract-website-intelligence | — | — | — | No Authorization handling seen | false | — |
| generate-brand-scene | LOVABLE_API_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | brand_scene_cache, brand_scene_generations | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | true | https://ai.gateway.lovable.dev/v1/chat/completions |
| generate-content | ANTHROPIC_API_KEY | — | — | No Authorization handling seen | true | Anthropic SDK |
| generate-faq-content | LOVABLE_API_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | — | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | unspecified | https://ai.gateway.lovable.dev/v1/chat/completions |
| generate-hero-images | REPLICATE_API_TOKEN, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | hero_image_cache | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | true | Replicate SDK; https://api.replicate.com/v1/predictions, https://api.replicate.com/v1/predictions/${prediction.id} |
| generate-page-content | LOVABLE_API_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | brand_briefs | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | true | https://ai.gateway.lovable.dev/v1/chat/completions |
| generate-prospect-page | ANTHROPIC_API_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | demo_sessions, landing_pages, prospect_pages | — | JWT verified in handler | true | Anthropic SDK |
| generate-prospect-pivot | LOVABLE_API_KEY, PUBLIC_SITE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | landing_pages, profiles, prospects | — | JWT verified in handler | true | https://ai.gateway.lovable.dev/v1/chat/completions |
| generate-section-image | REPLICATE_API_TOKEN | — | — | No Authorization handling seen | false | Replicate SDK; — |
| generate-strategy-brief | LOVABLE_API_KEY | — | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | true | https://ai.gateway.lovable.dev/v1/chat/completions |
| get-session | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | consultation_sessions | — | No Authorization handling seen | false | — |
| improve-content | LOVABLE_API_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | — | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | unspecified | https://ai.gateway.lovable.dev/v1/chat/completions |
| industry-insights | PERPLEXITY_API_KEY, SUPABASE_ANON_KEY, SUPABASE_URL | user_plans | — | JWT verified in handler | true | https://api.perplexity.ai/chat/completions |
| intake-chat | LOVABLE_API_KEY, SUPABASE_ANON_KEY, SUPABASE_URL | — | — | JWT verified in handler | false | https://ai.gateway.lovable.dev/v1/chat/completions |
| loops-contact | LOOPS_API_KEY | — | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | false | https://app.loops.so/api/v1 |
| loops-sync | LOOPS_API_KEY | — | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | unspecified | https://app.loops.so/api/v1 |
| market-intelligence | PERPLEXITY_API_KEY | — | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | true | https://api.perplexity.ai/chat/completions |
| migrate-anonymous-session | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | consultation_sessions, consultations | — | JWT verified in handler | true | — |
| modify-section | — | — | — | No Authorization handling seen | true | Anthropic SDK |
| orchestrator-research | PERPLEXITY_API_KEY | — | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | false | https://api.perplexity.ai/chat/completions |
| perplexity-research | PERPLEXITY_API_KEY, SUPABASE_ANON_KEY, SUPABASE_URL | user_plans | — | JWT verified in handler | true | https://api.perplexity.ai/chat/completions |
| remove-logo-background | REPLICATE_API_TOKEN | — | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | false | Replicate SDK; https://api.replicate.com/v1/predictions, https://api.replicate.com/v1/predictions/${prediction.id} |
| render-prospect-page | PUBLIC_SITE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | landing_pages, prospects | — | No Authorization handling seen | false | https://schema.org |
| render-public-page | PUBLIC_SITE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | consultations, landing_pages, landing_pages (RPC increment) | — | No Authorization handling seen | false | https://schema.org |
| reset-user-data | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | beta_pages, brand_briefs, brands, consultation_drafts, consultation_sessions, consultations, demo_sessions, generation_logs, guest_sessions, intelligence_accumulator, landing_pages, persona_intelligence, prospect_pages, prospects, testimonial_requests, usage_log | — | JWT verified in handler | true | — |
| send-prospect-email | LOOPS_API_KEY, QUICK_PIVOT_EMAIL_ID, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | profiles, prospects | — | JWT verified in handler | true | https://app.loops.so/api/v1/transactional |
| send-testimonial-request | RESEND_API_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | testimonial_requests | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | true | https://api.resend.com/emails |
| set-session-cookie | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | consultation_sessions | — | No Authorization handling seen | false | — |
| strategic-orchestrator | ANTHROPIC_API_KEY | — | — | No Authorization handling seen | false | Anthropic SDK |
| stripe-checkout | STRIPE_SECRET_KEY, SUPABASE_ANON_KEY, SUPABASE_URL | user_usage | — | JWT verified in handler | true | Stripe SDK (api.stripe.com) |
| stripe-webhook | STRIPE_PRICE_AGENCY, STRIPE_PRICE_FOUNDING, STRIPE_PRICE_PRO, STRIPE_PRICE_STARTER, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | subscriptions, user_usage | — | No user JWT; validates stripe-signature with STRIPE_WEBHOOK_SECRET | false | Stripe SDK (api.stripe.com) |
| submit-form | LOOPS_API_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | form_submissions, published_pages | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | unspecified | https://app.loops.so/api/v1/transactional |
| track-page-view | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | landing_pages | — | No Authorization handling seen | false | — |
| track-prospect-page-view | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | prospect_page_views, prospect_pages (RPC increment) | — | No Authorization handling seen | false | — |
| track-prospect-view | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | prospect_views, prospects | — | No Authorization handling seen | false | — |
| unsplash-search | SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL, UNSPLASH_ACCESS_KEY | user_plans | — | JWT verified in handler | true | https://api.unsplash.com/search/photos?query=${encodeURIComponent |
| unsplash-track-download | SUPABASE_ANON_KEY, SUPABASE_URL, UNSPLASH_ACCESS_KEY | — | — | JWT verified in handler | true | https://api.unsplash.com/ |
| update-anonymous-session | SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | consultation_sessions | — | No Authorization handling seen | false | — |
| upscale-logo | REPLICATE_API_TOKEN | — | — | No incoming Authorization validation (header is outgoing-only / forwarded; not verified) | false | Replicate SDK; https://api.replicate.com/v1/predictions, https://api.replicate.com/v1/predictions/${prediction.id} |
| validate-brief-intelligence | ANTHROPIC_API_KEY | — | — | No Authorization handling seen | false | Anthropic SDK |
Additional operations: administrative handlers access the Auth admin API (`listUsers`, `getUserById`, `deleteUser`), not just public tables; `submit-form` reads the page owner through Auth admin. `track-prospect-page-view` invokes `increment_prospect_page_views`; `render-public-page` invokes `increment_page_view`. Deletion loops can cascade through foreign keys beyond explicit table calls. `clear-session-cookie` only clears its cookie. Public/session handlers may use body identifiers or cookies; that is not user-JWT verification.

`loops-sync`, `extract-style-inspiration`, `generate-faq-content`, and `improve-content` have no per-function `verify_jwt` entry in the repository. Actual deployed function list, revisions and gateway overrides were not available through the inspected read tools.

## 2. SECRETS

18 environment names read by Edge Functions, deduplicated. 15 third-party/config names are confirmed configured by the secret-name listing; the three backend names are runtime-provided. Recreate third-party credentials from their owners, not from this inventory. Backend credentials must come from the destination project. None belongs in Vercel public `VITE_*` variables except the separate publishable configuration described in section 6.

| Name | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Direct Claude calls / Anthropic SDK. |
| `LOOPS_API_KEY` | Loops contacts, events and transactional email. |
| `LOVABLE_API_KEY` | Lovable AI gateway; managed credential. Portability/continued gateway entitlement outside Lovable is unverified; arrange an independently authorized gateway credential or replace gateway calls. |
| `PERPLEXITY_API_KEY` | Perplexity research / chat completions. |
| `PUBLIC_SITE_URL` | Public frontend origin used by prospect links, email and public HTML renderers; set to Vercel/custom-domain origin. |
| `QUICK_PIVOT_EMAIL_ID` | Loops transactional template ID for prospect emails; configuration, not a password. |
| `REPLICATE_API_TOKEN` | Image generation, logo cleanup/upscale and Replicate predictions. |
| `RESEND_API_KEY` | Testimonial request emails via Resend. |
| `STRIPE_PRICE_AGENCY` | Stripe Agency recurring price mapping. |
| `STRIPE_PRICE_FOUNDING` | Stripe Founding recurring price mapping. |
| `STRIPE_PRICE_PRO` | Stripe Pro recurring price mapping. |
| `STRIPE_PRICE_STARTER` | Stripe Starter recurring price mapping. |
| `STRIPE_SECRET_KEY` | Server-side Stripe Checkout / subscription API. |
| `STRIPE_WEBHOOK_SECRET` | Signature verification for the destination webhook endpoint; regenerate/retrieve for that endpoint. |
| `SUPABASE_ANON_KEY` | Destination public/anon key for backend clients using caller JWT/RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Destination privileged backend key; server-only and runtime-provided. Source Cloud service-role value is not accessible. |
| `SUPABASE_URL` | Destination backend API origin; runtime-provided. |
| `UNSPLASH_ACCESS_KEY` | Unsplash photo search and required download tracking. |

`SUPABASE_DB_URL`, `SUPABASE_JWKS`, `SUPABASE_PUBLISHABLE_KEYS`, `SUPABASE_SECRET_KEYS` were named in managed runtime context, but no inspected handler reads them: destination infrastructure supplies its own equivalent where needed; do not copy managed credential material. OAuth credentials / SMTP credentials are not established by the secret-name list; see sections 5 and 8.

## 3. DATABASE

### Live application tables and RLS

36 public application tables; all have RLS enabled. 176 public-table policies, listed below by their actual live name and operation. Every listed policy is PERMISSIVE: applicable permits combine with OR; a separate `false` policy does not override another permit. `ALL` applies across operations. USING filters existing rows; CHECK constrains new rows; for UPDATE/ALL without a separate CHECK, PostgreSQL reuses USING. `public` in the roles column means all roles, not the public schema. Service-role bypass is distinct from ordinary user RLS. Rules are catalog expressions, whitespace condensed, not softened summaries.

### `public.admin_roles` — RLS enabled

Columns: `id`, `user_id`, `role`, `granted_by`, `granted_at`, `expires_at`, `created_at`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Super admins can delete roles | DELETE | authenticated | USING has_role(auth.uid(), 'super_admin'::app_role) |
| Super admins can insert roles | INSERT | authenticated | CHECK has_role(auth.uid(), 'super_admin'::app_role) |
| Super admins can update roles | UPDATE | authenticated | USING has_role(auth.uid(), 'super_admin'::app_role) |
| Super admins can view all roles | SELECT | authenticated | USING has_role(auth.uid(), 'super_admin'::app_role) |
| Users can view own roles | SELECT | authenticated | USING (auth.uid() = user_id) |
| admin_roles_admin_read | SELECT | authenticated | USING is_admin(auth.uid()) |
| admin_roles_anon_blocked | ALL | anon | USING false |

### `public.beta_pages` — RLS enabled

Columns: `id`, `user_id`, `consultation_id`, `launch_date`, `signup_goal`, `max_signups`, `referral_enabled`, `reward_tiers`, `scarcity_value`, `total_signups`, `created_at`, `updated_at`, `page_type`, `launch_stage`, `launch_channels`, `perks`, `scarcity_type`, `status`, `published_url`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Published beta pages are public | SELECT | public | USING ((status)::text = 'published'::text) |
| Users can create their own beta pages | INSERT | public | CHECK (auth.uid() = user_id) |
| Users can delete their own beta pages | DELETE | public | USING (auth.uid() = user_id) |
| Users can update their own beta pages | UPDATE | public | USING (auth.uid() = user_id) |
| Users can view their own beta pages | SELECT | public | USING (auth.uid() = user_id) |
| beta_pages_anon_blocked | ALL | anon | USING false |
| beta_pages_users_own_only | ALL | authenticated | USING (auth.uid() = user_id); CHECK (auth.uid() = user_id) |

### `public.beta_signups` — RLS enabled

Columns: `id`, `page_id`, `referral_count`, `position`, `created_at`, `email`, `name`, `referral_code`, `referred_by`, `utm_source`, `utm_medium`, `utm_campaign`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Anyone can signup to published pages | INSERT | public | CHECK (EXISTS ( SELECT 1 FROM beta_pages WHERE ((beta_pages.id = beta_signups.page_id) AND ((beta_pages.status)::text = 'published'::text)))) |
| Page owners can delete signups | DELETE | public | USING (EXISTS ( SELECT 1 FROM beta_pages WHERE ((beta_pages.id = beta_signups.page_id) AND (beta_pages.user_id = auth.uid())))) |
| Page owners can view their signups | SELECT | public | USING (EXISTS ( SELECT 1 FROM beta_pages WHERE ((beta_pages.id = beta_signups.page_id) AND (beta_pages.user_id = auth.uid())))) |
| beta_signups_anon_insert | INSERT | anon | CHECK true |
| beta_signups_anon_no_read | SELECT | anon | USING false |
| beta_signups_users_own_only | SELECT | authenticated | USING (EXISTS ( SELECT 1 FROM beta_pages bp WHERE ((bp.id = beta_signups.page_id) AND (bp.user_id = auth.uid())))) |

### `public.brand_briefs` — RLS enabled

Columns: `id`, `user_id`, `colors`, `typography`, `voice_tone`, `is_active`, `created_at`, `updated_at`, `name`, `source_file_name`, `logo_url`, `logo_storage_path`, `website_url`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Users can delete own brand briefs | DELETE | public | USING (auth.uid() = user_id) |
| Users can insert own brand briefs | INSERT | public | CHECK (auth.uid() = user_id) |
| Users can update own brand briefs | UPDATE | public | USING (auth.uid() = user_id) |
| Users can view own brand briefs | SELECT | public | USING (auth.uid() = user_id) |
| brand_briefs_anon_blocked | ALL | anon | USING false |
| brand_briefs_users_own_only | ALL | authenticated | USING (auth.uid() = user_id); CHECK (auth.uid() = user_id) |

### `public.brand_memory` — RLS enabled

Columns: `id`, `brand_id`, `testimonials`, `case_studies`, `known_audiences`, `objection_responses`, `created_at`, `updated_at`, `client_logos`, `conversation_insights`, `common_objections`, `credentials`, `results`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| brand_memory_anon_blocked | ALL | anon | USING false |
| brand_memory_users_manage | ALL | authenticated | USING (brand_id IN ( SELECT brands.id FROM brands WHERE (brands.user_id = auth.uid()))); CHECK (brand_id IN ( SELECT brands.id FROM brands WHERE (brands.user_id = auth.uid()))) |

### `public.brand_scene_cache` — RLS enabled

Columns: `id`, `scenes`, `created_at`, `updated_at`, `cache_key`, `logo_hash`, `industry`, `subcategory`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Authenticated users can read shared scene cache | SELECT | authenticated | USING (auth.uid() IS NOT NULL) |

### `public.brand_scene_generations` — RLS enabled

Columns: `id`, `user_id`, `consultation_id`, `scenes_count`, `from_cache`, `created_at`, `cache_key`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Users view own generations | SELECT | public | USING (auth.uid() = user_id) |

### `public.brands` — RLS enabled

Columns: `id`, `user_id`, `brand_colors`, `is_default`, `created_at`, `updated_at`, `vocabulary_notes`, `color_mode`, `name`, `website`, `industry`, `industry_vertical`, `tone_profile`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| brands_anon_blocked | ALL | anon | USING false |
| brands_users_delete | DELETE | authenticated | USING (user_id = auth.uid()) |
| brands_users_insert | INSERT | authenticated | CHECK (user_id = auth.uid()) |
| brands_users_select | SELECT | authenticated | USING (user_id = auth.uid()) |
| brands_users_update | UPDATE | authenticated | USING (user_id = auth.uid()) |

### `public.consultation_drafts` — RLS enabled

Columns: `id`, `user_id`, `wizard_data`, `created_at`, `updated_at`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Users can delete own drafts | DELETE | public | USING (auth.uid() = user_id) |
| Users can insert own drafts | INSERT | public | CHECK (auth.uid() = user_id) |
| Users can update own drafts | UPDATE | public | USING (auth.uid() = user_id) |
| Users can view own drafts | SELECT | public | USING (auth.uid() = user_id) |
| consultation_drafts_anon_blocked | ALL | anon | USING false |
| consultation_drafts_users_own_only | ALL | authenticated | USING (auth.uid() = user_id); CHECK (auth.uid() = user_id) |

### `public.consultation_sessions` — RLS enabled

Columns: `id`, `consultation_answers`, `approved_sections`, `last_active`, `created_at`, `email_reminder_sent`, `user_id`, `user_email`, `session_token`, `current_step`, `status`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Authenticated users can create their own sessions | INSERT | authenticated | CHECK (auth.uid() = user_id) |
| Authenticated users can insert own sessions | INSERT | public | CHECK ((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)) |
| Authenticated users can update own sessions | UPDATE | public | USING ((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)) |
| Authenticated users can view own sessions | SELECT | public | USING ((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)) |
| Users can delete their own sessions | DELETE | public | USING ((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)) |
| Users can view their own sessions | SELECT | public | USING ((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)) |
| consultation_sessions_anon_insert_with_token | INSERT | anon | CHECK ((session_token = ((current_setting('request.cookies'::text, true))::json ->> 'consultation_session'::text)) OR (((current_setting('request.cookies'::text, true))::json ->> 'consultation_session'::text) IS NULL)) |
| consultation_sessions_anon_no_read | SELECT | anon | USING false |
| consultation_sessions_anon_update_own_only | UPDATE | anon | USING (session_token = ((current_setting('request.cookies'::text, true))::json ->> 'consultation_session'::text)); CHECK (session_token = ((current_setting('request.cookies'::text, true))::json ->> 'consultation_session'::text)) |
| consultation_sessions_users_own_only | ALL | authenticated | USING (user_id = auth.uid()) |

### `public.consultations` — RLS enabled

Columns: `updated_at`, `id`, `user_id`, `wants_calculator`, `calculator_config`, `created_at`, `ai_seo_data`, `readiness_score`, `extracted_intelligence`, `guest_session_id`, `flow_history`, `last_huddle_at`, `card_notes`, `brief_versions`, `active_brief_version`, `strategy_brief`, `communication_style`, `brand_id`, `industry`, `goal`, `target_audience`, `challenge`, `unique_value`, `offer`, `status`, `service_type`, `audience_pain_points`, `audience_goals`, `key_benefits`, `competitor_differentiator`, `authority_markers`, `credentials`, `client_count`, `case_study_highlight`, `risk_reversals`, `secondary_cta`, `primary_cta`, `urgency_angle`, `guarantee_offer`, `business_name`, `website_url`, `consultation_status`, `flow_state`, `last_huddle_type`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Guest sessions can create own consultations | INSERT | anon | CHECK ((guest_session_id IS NOT NULL) AND (guest_session_id IN ( SELECT guest_sessions.id FROM guest_sessions WHERE (guest_sessions.session_token = ((current_setting('request.cookies'::text, true))::json ->> 'guest_session'::text))))) |
| Guest sessions can update own consultations | UPDATE | anon | USING ((guest_session_id IS NOT NULL) AND (guest_session_id IN ( SELECT guest_sessions.id FROM guest_sessions WHERE (guest_sessions.session_token = ((current_setting('request.cookies'::text, true))::json ->> 'guest_session'::text))))) |
| Guest sessions can view own consultations | SELECT | anon | USING ((guest_session_id IS NOT NULL) AND (guest_session_id IN ( SELECT guest_sessions.id FROM guest_sessions WHERE (guest_sessions.session_token = ((current_setting('request.cookies'::text, true))::json ->> 'guest_session'::text))))) |
| Users can create their own consultations | INSERT | public | CHECK (auth.uid() = user_id) |
| Users can delete their own consultations | DELETE | public | USING (auth.uid() = user_id) |
| Users can update their own consultations | UPDATE | public | USING (auth.uid() = user_id) |
| authenticated_select_own_consultations | SELECT | authenticated | USING ((user_id = auth.uid()) OR (user_id IS NULL)) |
| authenticated_update_orphan_consultations | UPDATE | authenticated | USING ((user_id IS NULL) OR (user_id = auth.uid())); CHECK (user_id = auth.uid()) |
| consultations_anon_blocked | ALL | anon | USING false |
| consultations_users_own_only | ALL | authenticated | USING (auth.uid() = user_id); CHECK (auth.uid() = user_id) |

### `public.demo_leads` — RLS enabled

Columns: `id`, `extracted_intelligence`, `engagement_score`, `converted_to_user`, `created_at`, `updated_at`, `email`, `session_id`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| demo_leads_admin_read | SELECT | authenticated | USING is_admin(auth.uid()) |
| demo_leads_anon_insert | INSERT | anon | CHECK true |
| demo_leads_anon_no_delete | DELETE | anon | USING false |
| demo_leads_anon_no_read | SELECT | anon | USING false |
| demo_leads_anon_no_update | UPDATE | anon | USING false |

### `public.demo_market_cache` — RLS enabled

Columns: `expires_at`, `id`, `data`, `created_at`, `cache_key`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Admins can read demo market cache | SELECT | public | USING is_admin(auth.uid()) |

### `public.demo_sessions` — RLS enabled

Columns: `id`, `messages`, `extracted_intelligence`, `market_research`, `completed`, `continued_to_consultation`, `created_at`, `message_count`, `readiness`, `claimed_by`, `claimed_at`, `brief_viewed_at`, `brand_assets`, `brand_intake_completed`, `brand_intake_at`, `session_id`, `ip_hash`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Admins can read demo sessions | SELECT | authenticated | USING is_admin(auth.uid()) |
| Anon can insert own demo session | INSERT | anon | CHECK true |
| Demo sessions updatable by session_id | UPDATE | anon | USING ((session_id = ((current_setting('request.cookies'::text, true))::json ->> 'demo_session'::text)) OR (session_id = ((current_setting('request.headers'::text, true))::json ->> 'x-demo-session-id'::text))); CHECK ((claimed_by IS NULL) OR (claimed_by = auth.uid())) |
| Users can claim unclaimed demo sessions | UPDATE | authenticated | USING ((claimed_by IS NULL) OR (claimed_by = auth.uid())); CHECK (claimed_by = auth.uid()) |
| Users can read claimed sessions | SELECT | authenticated | USING (claimed_by = auth.uid()) |
| authenticated_insert_demo_sessions | INSERT | authenticated | CHECK true |
| demo_sessions_admin_select_all | SELECT | authenticated | USING is_admin(auth.uid()) |
| demo_sessions_anon_insert | INSERT | anon | CHECK true |
| demo_sessions_anon_no_delete | DELETE | anon | USING false |
| demo_sessions_anon_no_select | SELECT | anon | USING false |
| demo_sessions_anon_update | UPDATE | anon | USING ((session_id = ((current_setting('request.cookies'::text, true))::json ->> 'demo_session'::text)) OR (session_id = ((current_setting('request.headers'::text, true))::json ->> 'x-demo-session-id'::text))); CHECK ((session_id = ((current_setting('request.cookies'::text, true))::json ->> 'demo_session'::text)) OR (session_id = ((current_setting('request.headers'::text, true))::json ->> 'x-demo-session-id'::text))) |
| demo_sessions_users_own_only | ALL | authenticated | USING (claimed_by = auth.uid()) |

### `public.form_submissions` — RLS enabled

Columns: `id`, `published_page_id`, `custom_fields`, `submitted_at`, `source_url`, `utm_source`, `utm_medium`, `utm_campaign`, `status`, `name`, `email`, `phone`, `company`, `message`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Anon cannot delete submissions | DELETE | anon | USING false |
| Anon cannot read submissions | SELECT | anon | USING false |
| Anon cannot update submissions | UPDATE | anon | USING false |
| Public can submit forms | INSERT | anon | CHECK true |
| Users can update own submissions | UPDATE | authenticated | USING (EXISTS ( SELECT 1 FROM published_pages WHERE ((published_pages.id = form_submissions.published_page_id) AND (published_pages.user_id = auth.uid())))) |
| Users can view own submissions | SELECT | authenticated | USING (EXISTS ( SELECT 1 FROM published_pages WHERE ((published_pages.id = form_submissions.published_page_id) AND (published_pages.user_id = auth.uid())))) |

### `public.generation_logs` — RLS enabled

Columns: `id`, `consultation_id`, `persona_intelligence_id`, `user_id`, `input_data`, `intelligence_used`, `generated_content`, `confidence_score`, `regeneration_count`, `created_at`, `generation_type`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Users can create their own generation logs | INSERT | public | CHECK (auth.uid() = user_id) |
| Users can view their own generation logs | SELECT | public | USING (auth.uid() = user_id) |
| generation_logs_anon_blocked | ALL | anon | USING false |
| generation_logs_users_own_only | ALL | authenticated | USING (auth.uid() = user_id); CHECK (auth.uid() = user_id) |

### `public.guest_sessions` — RLS enabled

Columns: `id`, `consultation_data`, `generated_brief_id`, `generated_page_id`, `intelligence_state`, `created_at`, `expires_at`, `converted_to_user_id`, `converted_at`, `session_token`, `email`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Anon can create guest session | INSERT | anon | CHECK true |
| Token holders can read own session | SELECT | anon, authenticated | USING (session_token = ((current_setting('request.cookies'::text, true))::json ->> 'guest_session'::text)) |
| Token holders can update own session | UPDATE | anon, authenticated | USING (session_token = ((current_setting('request.cookies'::text, true))::json ->> 'guest_session'::text)) |
| guest_sessions_anon_insert | INSERT | anon | CHECK true |
| guest_sessions_anon_no_read | SELECT | anon | USING false |
| guest_sessions_anon_update_own_only | UPDATE | anon | USING (session_token = ((current_setting('request.cookies'::text, true))::json ->> 'guest_session'::text)); CHECK (session_token = ((current_setting('request.cookies'::text, true))::json ->> 'guest_session'::text)) |
| guest_sessions_users_own_only | ALL | authenticated | USING (converted_to_user_id = auth.uid()) |

### `public.hero_image_cache` — RLS enabled

Columns: `id`, `created_at`, `updated_at`, `cache_key`, `images`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Authenticated users can insert cache | INSERT | public | CHECK (auth.uid() IS NOT NULL) |
| Authenticated users can read hero cache | SELECT | authenticated | USING true |
| Authenticated users can read shared hero cache | SELECT | authenticated | USING (auth.uid() IS NOT NULL) |
| Authenticated users can update cache | UPDATE | public | USING (auth.uid() IS NOT NULL) |

### `public.industries` — RLS enabled

Columns: `id`, `display_order`, `name`, `slug`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Public read industries | SELECT | public | USING true |
| industries_public_read | SELECT | anon, authenticated | USING true |

### `public.inspiration_sites` — RLS enabled

Columns: `id`, `user_id`, `brand_id`, `extracted_style`, `created_at`, `updated_at`, `screenshot_url`, `extraction_confidence`, `url`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Users can delete their own inspiration sites | DELETE | public | USING (auth.uid() = user_id) |
| Users can insert their own inspiration sites | INSERT | public | CHECK (auth.uid() = user_id) |
| Users can update their own inspiration sites | UPDATE | public | USING (auth.uid() = user_id) |
| Users can view their own inspiration sites | SELECT | public | USING (auth.uid() = user_id) |

### `public.intelligence_accumulator` — RLS enabled

Columns: `id`, `user_id`, `consultation_data`, `brand_data`, `market_data`, `strategy_data`, `readiness_score`, `created_at`, `updated_at`, `session_id`, `completion_stage`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| intelligence_accumulator_anon_blocked | ALL | anon | USING false |
| intelligence_accumulator_users_delete | DELETE | authenticated | USING (auth.uid() = user_id) |
| intelligence_accumulator_users_insert | INSERT | authenticated | CHECK (auth.uid() = user_id) |
| intelligence_accumulator_users_select | SELECT | authenticated | USING (auth.uid() = user_id) |
| intelligence_accumulator_users_update | UPDATE | authenticated | USING (auth.uid() = user_id) |

### `public.landing_pages` — RLS enabled

Columns: `id`, `user_id`, `consultation_id`, `sections`, `styles`, `is_published`, `published_at`, `analytics_enabled`, `created_at`, `updated_at`, `consultation_data`, `website_intelligence`, `ai_seo_score`, `ai_seo_breakdown`, `ai_seo_last_calculated`, `parent_page_id`, `version_number`, `is_current_version`, `quick_pivot_enabled`, `view_count`, `last_viewed_at`, `design_intelligence`, `brand_id`, `title`, `slug`, `status`, `published_url`, `meta_title`, `meta_description`, `strategy_brief`, `last_change_summary`, `hero_thumbnail_url`, `session_id`, `industry`, `target_market`, `layout_id`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Public can read published landing pages | SELECT | anon | USING (status = 'published'::text) |
| Users can create their own landing pages | INSERT | public | CHECK (auth.uid() = user_id) |
| Users can delete their own landing pages | DELETE | public | USING (auth.uid() = user_id) |
| Users can update their own landing pages | UPDATE | public | USING (auth.uid() = user_id) |
| landing_pages_anon_blocked | ALL | anon | USING false |
| landing_pages_users_own_only | ALL | authenticated | USING (auth.uid() = user_id); CHECK (auth.uid() = user_id) |

### `public.leads` — RLS enabled

Columns: `id`, `guest_session_id`, `consultation_snapshot`, `converted_to_user_id`, `created_at`, `converted_at`, `email`, `source`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Admins can view leads | SELECT | public | USING is_admin(auth.uid()) |
| Anon can create lead | INSERT | anon | CHECK true |
| leads_admin_read | SELECT | authenticated | USING (is_admin(auth.uid()) OR (converted_to_user_id = auth.uid())) |
| leads_anon_insert | INSERT | anon | CHECK true |
| leads_anon_no_delete | DELETE | anon | USING false |
| leads_anon_no_read | SELECT | anon | USING false |
| leads_anon_no_update | UPDATE | anon | USING false |

### `public.persona_intelligence` — RLS enabled

Columns: `id`, `consultation_id`, `user_id`, `market_research`, `synthesized_persona`, `confidence_score`, `created_at`, `updated_at`, `completed_at`, `industry`, `target_audience`, `location`, `service_type`, `research_sources`, `research_status`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Users can create their own intelligence | INSERT | public | CHECK (auth.uid() = user_id) |
| Users can delete their own intelligence | DELETE | public | USING (auth.uid() = user_id) |
| Users can update their own intelligence | UPDATE | public | USING (auth.uid() = user_id) |
| Users can view their own intelligence | SELECT | public | USING (auth.uid() = user_id) |
| persona_intelligence_anon_blocked | ALL | anon | USING false |
| persona_intelligence_users_own_only | ALL | authenticated | USING (auth.uid() = user_id); CHECK (auth.uid() = user_id) |

### `public.preview_links` — RLS enabled

Columns: `id`, `landing_page_id`, `created_at`, `expires_at`, `created_by`, `token`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Public can read preview links by token | SELECT | anon | USING true |
| Users can manage own preview links | ALL | authenticated | USING (created_by = auth.uid()); CHECK (created_by = auth.uid()) |
| preview_links_anon_blocked | ALL | anon | USING false |

### `public.profiles` — RLS enabled

Columns: `id`, `signature_enabled`, `created_at`, `updated_at`, `email_notifications`, `prospect_view_alerts`, `weekly_summary_emails`, `marketing_emails`, `full_name`, `avatar_url`, `signature_name`, `signature_title`, `signature_email`, `signature_phone`, `signature_website`, `company_name`, `job_title`, `phone_number`, `website`, `bio`, `timezone`, `signature_html`, `signature_headshot_url`, `signature_type`, `preferred_mode`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| profiles_anon_blocked | ALL | anon | USING false |
| profiles_users_own_only | ALL | authenticated | USING (auth.uid() = id); CHECK (auth.uid() = id) |

### `public.prospect_page_views` — RLS enabled

Columns: `id`, `prospect_page_id`, `viewed_at`, `ip_address`, `visitor_id`, `user_agent`, `referrer`, `country`, `city`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Anon can track prospect page views | INSERT | anon | CHECK (prospect_page_id IN ( SELECT prospect_pages.id FROM prospect_pages WHERE ((prospect_pages.status)::text = 'published'::text))) |
| Users can view own page views | SELECT | authenticated | USING (EXISTS ( SELECT 1 FROM prospect_pages WHERE ((prospect_pages.id = prospect_page_views.prospect_page_id) AND (prospect_pages.user_id = auth.uid())))) |
| prospect_page_views_anon_insert | INSERT | anon | CHECK true |
| prospect_page_views_anon_no_read | SELECT | anon | USING false |
| prospect_page_views_users_own_only | SELECT | authenticated | USING (EXISTS ( SELECT 1 FROM prospect_pages pp WHERE ((pp.id = prospect_page_views.prospect_page_id) AND (pp.user_id = auth.uid())))) |

### `public.prospect_pages` — RLS enabled

Columns: `id`, `user_id`, `source_demo_session_id`, `source_landing_page_id`, `personalized_sections`, `personalized_brief`, `created_at`, `updated_at`, `published_at`, `expires_at`, `view_count`, `last_viewed_at`, `prospect_name`, `prospect_email`, `prospect_title`, `prospect_company`, `prospect_industry`, `prospect_company_size`, `deal_stage`, `known_pain_points`, `competitive_situation`, `specific_use_case`, `custom_instructions`, `personalized_headline`, `personalized_subheadline`, `unique_slug`, `status`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Public can read published prospect pages | SELECT | anon | USING ((status)::text = 'published'::text) |
| prospect_pages_anon_blocked | ALL | anon | USING false |
| prospect_pages_users_own_only | ALL | authenticated | USING (auth.uid() = user_id); CHECK (auth.uid() = user_id) |

### `public.prospect_views` — RLS enabled

Columns: `id`, `prospect_id`, `viewed_at`, `time_on_page`, `scroll_depth`, `device_type`, `referrer_source`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Anon can track prospect views | INSERT | anon | CHECK true |
| Users read own prospect views | SELECT | public | USING (EXISTS ( SELECT 1 FROM prospects WHERE ((prospects.id = prospect_views.prospect_id) AND (prospects.user_id = auth.uid())))) |
| prospect_views_anon_insert | INSERT | anon | CHECK true |
| prospect_views_anon_no_read | SELECT | anon | USING false |
| prospect_views_users_own_only | SELECT | authenticated | USING (EXISTS ( SELECT 1 FROM prospects p WHERE ((p.id = prospect_views.prospect_id) AND (p.user_id = auth.uid())))) |

### `public.prospects` — RLS enabled

Columns: `id`, `user_id`, `base_page_id`, `email_sent_at`, `first_viewed_at`, `last_viewed_at`, `view_count`, `engagement_score`, `created_at`, `updated_at`, `first_name`, `last_name`, `full_name`, `email`, `company`, `job_title`, `industry`, `context_raw`, `context_summary`, `meeting_context`, `personalized_headline`, `personalized_subhead`, `personalized_cta_text`, `slug`, `email_status`, `email_subject`, `email_body`, `status`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Public can read published prospects by slug | SELECT | anon | USING ((slug IS NOT NULL) AND (status = 'published'::text)) |
| Users manage own prospects | ALL | public | USING (auth.uid() = user_id) |
| prospects_anon_blocked | ALL | anon | USING false |
| prospects_users_own_only | ALL | authenticated | USING (auth.uid() = user_id); CHECK (auth.uid() = user_id) |

### `public.published_pages` — RLS enabled

Columns: `id`, `landing_page_id`, `user_id`, `page_content`, `page_styles`, `published_at`, `updated_at`, `unpublished_at`, `view_count`, `last_viewed_at`, `design_intelligence`, `brand_settings`, `slug`, `page_title`, `meta_description`, `og_image_url`, `favicon_url`, `status`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Public can view published pages | SELECT | anon | USING ((status)::text = 'published'::text) |
| Users can manage own published pages | ALL | authenticated | USING (user_id = auth.uid()); CHECK (user_id = auth.uid()) |

### `public.subscriptions` — RLS enabled

Columns: `user_id`, `id`, `current_period_start`, `current_period_end`, `cancel_at_period_end`, `created_at`, `updated_at`, `stripe_customer_id`, `stripe_subscription_id`, `stripe_price_id`, `status`, `plan`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Users can read own subscription | SELECT | authenticated | USING (auth.uid() = user_id) |
| subscriptions_anon_blocked | ALL | anon | USING false |
| subscriptions_users_own_only | SELECT | authenticated | USING (auth.uid() = user_id) |

### `public.testimonial_requests` — RLS enabled

Columns: `id`, `user_id`, `consultation_id`, `sent_at`, `opened_at`, `clicked_at`, `responded_at`, `follow_up_scheduled_at`, `follow_up_sent_at`, `created_at`, `recipient_email`, `recipient_name`, `email_subject`, `email_body`, `request_page_url`, `status`, `resend_id`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Users can delete their own requests | DELETE | public | USING (auth.uid() = user_id) |
| Users can insert their own requests | INSERT | public | CHECK (auth.uid() = user_id) |
| Users can update their own requests | UPDATE | public | USING (auth.uid() = user_id) |
| Users can view their own requests | SELECT | public | USING (auth.uid() = user_id) |
| testimonial_requests_anon_blocked | ALL | anon | USING false |
| testimonial_requests_users_own_only | ALL | authenticated | USING (auth.uid() = user_id); CHECK (auth.uid() = user_id) |

### `public.usage_log` — RLS enabled

Columns: `id`, `user_id`, `action_type`, `action_cost`, `page_id`, `created_at`, `section_type`, `description`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Users can insert their own usage logs | INSERT | public | CHECK (auth.uid() = user_id) |
| Users can view their own usage logs | SELECT | public | USING (auth.uid() = user_id) |
| usage_log_anon_blocked | ALL | anon | USING false |
| usage_log_users_own_only | SELECT | authenticated | USING (auth.uid() = user_id) |

### `public.user_plans` — RLS enabled

Columns: `id`, `user_id`, `api_calls_remaining`, `api_calls_limit`, `reset_date`, `created_at`, `updated_at`, `plan_name`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| Users can create their own plan | INSERT | authenticated | CHECK (auth.uid() = user_id) |
| Users can view their own plan | SELECT | authenticated | USING (auth.uid() = user_id) |
| user_plans_anon_blocked | ALL | anon | USING false |
| user_plans_users_own_only | SELECT | authenticated | USING (auth.uid() = user_id) |

### `public.user_usage` — RLS enabled

Columns: `id`, `user_id`, `plan_tier`, `ai_actions_limit`, `ai_actions_used`, `ai_actions_rollover`, `grace_actions_given`, `billing_period_start`, `created_at`, `updated_at`, `actions_purchased`, `billing_period_end`, `trial_start`, `trial_end`, `subscription_status`, `stripe_customer_id`, `stripe_subscription_id`.

| Policy name | Operation | Roles | Rule |
|---|---|---|---|
| System can insert usage records | INSERT | public | CHECK (auth.uid() = user_id) |
| Users can update their own usage | UPDATE | public | USING (auth.uid() = user_id) |
| Users can view their own usage | SELECT | public | USING (auth.uid() = user_id) |
| user_usage_anon_blocked | ALL | anon | USING false |
| user_usage_users_own_only | SELECT | authenticated | USING (auth.uid() = user_id) |

### Extensions and enum types

| Live extension | Version | Schema | Migration coverage |
|---|---|---|---|
| `plpgsql` | 1.0 | `pg_catalog` | No CREATE EXTENSION in repository; provisioned by platform |
| `pgcrypto` | 1.3 | `extensions` | No CREATE EXTENSION in repository; provisioned by platform |
| `uuid-ossp` | 1.1 | `extensions` | No CREATE EXTENSION in repository; provisioned by platform |
| `pg_stat_statements` | 1.11 | `extensions` | No CREATE EXTENSION in repository; provisioned by platform |
| `supabase_vault` | 0.3.1 | `vault` | No CREATE EXTENSION in repository; provisioned by platform |

- `ai_action_type`: `page_generation`, `section_regeneration`, `ai_improvement`, `intelligence_refresh`, `style_change`, `research`, `consultation`, `generation`, `revision`, `calculator`, `copy_improve`.

- `app_role`: `super_admin`, `admin`, `support`.

- `plan_tier`: `starter`, `pro`, `agency`.

### Application database functions

24 application functions in public; extension-owned routines are excluded. Preserve signatures, security mode, search path and grants. Definitions are present in the migration history; functions are not deployed as Edge Functions.

| Function(signature) | Security | Behavior | Live EXECUTE roles |
|---|---|---|---|
| `create_brand_memory()` | DEFINER | Creates brand_memory after a brand INSERT. | anon, authenticated, service_role |
| `get_consultation_policies()` | DEFINER | Returns consultation policy catalog rows. | anon, authenticated, service_role |
| `get_public_landing_page(page_slug text)` | DEFINER | Returns permitted public snapshot fields for a published page slug. | anon, authenticated, service_role |
| `grant_grace_actions(p_user_id uuid)` | DEFINER | Validates caller ownership and grants one billing-period grace allotment. | anon, authenticated, service_role |
| `handle_new_user_plan()` | DEFINER | Creates free user_plans record after auth signup. | anon, authenticated, service_role |
| `handle_new_user_profile()` | DEFINER | Creates profile/signature email from new auth user. | anon, authenticated, service_role |
| `handle_new_user_usage()` | DEFINER | Creates trial usage record after signup. | anon, authenticated, service_role |
| `handle_updated_at()` | DEFINER | Sets updated_at timestamp. | anon, authenticated, service_role |
| `has_role(_user_id uuid, _role app_role)` | DEFINER | Tests admin_roles role and nonexpired grant. | anon, authenticated, service_role |
| `increment_page_view(page_id uuid)` | DEFINER | Increments landing page view count only when published. | anon, authenticated, service_role |
| `increment_prospect_page_views(page_id uuid)` | DEFINER | Increments prospect page view count only when published. | anon, authenticated, service_role |
| `increment_published_page_view(page_slug text)` | DEFINER | Increments published page view count by slug only when published. | anon, authenticated, service_role |
| `is_admin(_user_id uuid)` | DEFINER | Tests nonexpired super_admin/admin role. | anon, authenticated, service_role |
| `reset_api_calls()` | DEFINER | Resets due API quotas and next reset date. | anon, authenticated, service_role |
| `reset_monthly_usage()` | DEFINER | Resets due monthly counters/rollover. | service_role |
| `set_signup_position()` | DEFINER | Assigns beta signup position and increments page total. | anon, authenticated, service_role |
| `track_ai_action(p_user_id uuid, p_action_type ai_action_type, p_action_cost integer, p_page_id uuid, p_section_type text, p_description text)` | DEFINER | Validates caller ownership, checks/deducts credits and logs action. | anon, authenticated, service_role |
| `update_consultations_updated_at()` | INVOKER | Sets updated_at timestamp. | anon, authenticated, service_role |
| `update_profiles_updated_at()` | DEFINER | Sets profile.updated_at. | anon, authenticated, service_role |
| `update_prospects_timestamp()` | DEFINER | Sets prospects.updated_at. | anon, authenticated, service_role |
| `update_referral_count()` | DEFINER | Increments referring beta signup count. | anon, authenticated, service_role |
| `update_session_last_active()` | DEFINER | Sets session last_active on UPDATE. | anon, authenticated, service_role |
| `validate_form_submission_status()` | DEFINER | Rejects invalid form submission status. | anon, authenticated, service_role |
| `validate_published_page_status()` | DEFINER | Rejects invalid published page status. | anon, authenticated, service_role |

### Application triggers

21 live noninternal triggers on public tables and app-owned auth.users signup hooks. Foreign-key/internal platform triggers are excluded.

| Table | Trigger | Definition |
|---|---|---|
| `auth.users` | `on_auth_user_created_plan` | `CREATE TRIGGER on_auth_user_created_plan AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user_plan()` |
| `auth.users` | `on_auth_user_created_profile` | `CREATE TRIGGER on_auth_user_created_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user_profile()` |
| `auth.users` | `on_auth_user_created_usage` | `CREATE TRIGGER on_auth_user_created_usage AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user_usage()` |
| `public.beta_signups` | `trigger_set_signup_position` | `CREATE TRIGGER trigger_set_signup_position BEFORE INSERT ON public.beta_signups FOR EACH ROW EXECUTE FUNCTION set_signup_position()` |
| `public.beta_signups` | `trigger_update_referral_count` | `CREATE TRIGGER trigger_update_referral_count AFTER INSERT ON public.beta_signups FOR EACH ROW EXECUTE FUNCTION update_referral_count()` |
| `public.brand_briefs` | `update_brand_briefs_updated_at` | `CREATE TRIGGER update_brand_briefs_updated_at BEFORE UPDATE ON public.brand_briefs FOR EACH ROW EXECUTE FUNCTION update_consultations_updated_at()` |
| `public.brand_memory` | `brand_memory_updated_at` | `CREATE TRIGGER brand_memory_updated_at BEFORE UPDATE ON public.brand_memory FOR EACH ROW EXECUTE FUNCTION handle_updated_at()` |
| `public.brands` | `brands_updated_at` | `CREATE TRIGGER brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION handle_updated_at()` |
| `public.brands` | `on_brand_created` | `CREATE TRIGGER on_brand_created AFTER INSERT ON public.brands FOR EACH ROW EXECUTE FUNCTION create_brand_memory()` |
| `public.consultation_sessions` | `update_consultation_sessions_last_active` | `CREATE TRIGGER update_consultation_sessions_last_active BEFORE UPDATE ON public.consultation_sessions FOR EACH ROW EXECUTE FUNCTION update_session_last_active()` |
| `public.consultations` | `update_consultations_updated_at` | `CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON public.consultations FOR EACH ROW EXECUTE FUNCTION update_consultations_updated_at()` |
| `public.form_submissions` | `trg_validate_form_submission_status` | `CREATE TRIGGER trg_validate_form_submission_status BEFORE INSERT OR UPDATE ON public.form_submissions FOR EACH ROW EXECUTE FUNCTION validate_form_submission_status()` |
| `public.hero_image_cache` | `update_hero_image_cache_updated_at` | `CREATE TRIGGER update_hero_image_cache_updated_at BEFORE UPDATE ON public.hero_image_cache FOR EACH ROW EXECUTE FUNCTION update_consultations_updated_at()` |
| `public.inspiration_sites` | `update_inspiration_sites_updated_at` | `CREATE TRIGGER update_inspiration_sites_updated_at BEFORE UPDATE ON public.inspiration_sites FOR EACH ROW EXECUTE FUNCTION handle_updated_at()` |
| `public.intelligence_accumulator` | `set_accumulator_updated_at` | `CREATE TRIGGER set_accumulator_updated_at BEFORE UPDATE ON public.intelligence_accumulator FOR EACH ROW EXECUTE FUNCTION handle_updated_at()` |
| `public.landing_pages` | `update_landing_pages_updated_at` | `CREATE TRIGGER update_landing_pages_updated_at BEFORE UPDATE ON public.landing_pages FOR EACH ROW EXECUTE FUNCTION update_consultations_updated_at()` |
| `public.persona_intelligence` | `update_persona_intelligence_updated_at` | `CREATE TRIGGER update_persona_intelligence_updated_at BEFORE UPDATE ON public.persona_intelligence FOR EACH ROW EXECUTE FUNCTION update_consultations_updated_at()` |
| `public.profiles` | `update_profiles_timestamp` | `CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_profiles_updated_at()` |
| `public.prospects` | `prospects_updated` | `CREATE TRIGGER prospects_updated BEFORE UPDATE ON public.prospects FOR EACH ROW EXECUTE FUNCTION update_prospects_timestamp()` |
| `public.published_pages` | `trg_published_pages_updated_at` | `CREATE TRIGGER trg_published_pages_updated_at BEFORE UPDATE ON public.published_pages FOR EACH ROW EXECUTE FUNCTION handle_updated_at()` |
| `public.published_pages` | `trg_validate_published_page_status` | `CREATE TRIGGER trg_validate_published_page_status BEFORE INSERT OR UPDATE ON public.published_pages FOR EACH ROW EXECUTE FUNCTION validate_published_page_status()` |

### Migration completeness / exact gaps

104 repository SQL files and 104 live applied migration records were compared by SQL content (comments/whitespace ignored). **All 104 live statement bodies match repository files.** 81 version timestamps differ between the two histories, generally by seconds; they are not 81 missing schema migrations. Do not blindly copy the source migration bookkeeping IDs into a new migration runner.

The sequential source-to-catalog audit finds no missing live public table, column, RLS flag, policy, application function, trigger, explicit index or enum. It accounts for 488 columns, 111 constraints and 139 live indexes (including constraint-backed indexes). Catalog casts/qualification differences in policy text are not semantic drift.

**The directory is not a standalone reproduction of the whole live platform. Exact provisioning definitions absent from migrations:**

1. No `CREATE EXTENSION` statements for live `plpgsql`, `pgcrypto`, `uuid-ossp`, `pg_stat_statements`, `supabase_vault` (schemas/versions above). Some come preinstalled at a destination; confirm compatibility rather than treating app migrations as extension provisioning. No app handler reads Vault secrets.
2. No table GRANT statements for the 36 public tables. Live privilege checks show SELECT/INSERT/UPDATE/DELETE effective for anon, authenticated and service_role on every table; RLS still limits data access. Repository has only function EXECUTE grants/revokes. Recreate intentional Data API table/schema privileges at the destination together with RLS; missing GRANTs cause permission errors even with correct policies. Do not equate current broad grants with a recommendation to loosen RLS. Exact underlying platform default-ACL provenance is not established.
3. The platform-managed base schemas/tables for Auth, Storage, Realtime and Vault, and their infrastructure routines/default privileges, are not created by app migrations. A new managed Supabase project must supply those services. Preserve the app-owned auth.users triggers above and copy auth accounts through the supported export path, not by reconstructing managed schema from application SQL.

No schema was replayed into an empty destination during this audit, so clean-install execution/order/platform-version compatibility remains unverified. Metadata comparison is not a successful migration rehearsal. Scheduled invocation of reset functions is not proved by their existence; current jobs were not available from inspected metadata.

## 4. STORAGE

Three live buckets; all public, with no bucket-specific MIME allowlist or size limit configured in the live bucket rows. Public object URLs are readable without a signed URL; writes still follow policies. Files themselves were not downloaded or enumerated.

| Bucket | Visibility | Files/purpose and source evidence |
|---|---|---|
| `avatars` | Public | Profile avatars, `<user-id>/avatar.<extension>`; ProfileSettings.tsx:150–162. |
| `brand-assets` | Public | Brand logos/assets, SVG and optimized WebP plus other brand uploads; LogoUploader.tsx:67–92,161–186; BrandSettings.tsx:171–187,269–283; BrandIntake.tsx:347–355. |
| `section-images` | Public | Uploaded section images with original extension; edited logos stored as PNG; SectionImageGenerator.tsx:203–230; BrandSetup.tsx:330–352. Frontend section upload limit is 5 MB (not a bucket metadata limit). |

### All live storage.objects RLS policies

| Policy | Operation | Roles | Rule |
|---|---|---|---|
| Avatars are publicly accessible | SELECT | public | USING (bucket_id = 'avatars'::text) |
| Brand assets are publicly accessible | SELECT | public | USING (bucket_id = 'brand-assets'::text) |
| Public read access to brand assets | SELECT | public | USING (bucket_id = 'brand-assets'::text) |
| Section images are publicly accessible | SELECT | public | USING (bucket_id = 'section-images'::text) |
| Users can delete own section images | DELETE | public | USING ((bucket_id = 'section-images'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])) |
| Users can delete their own avatar | DELETE | authenticated | USING ((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)) |
| Users can update own section images | UPDATE | public | USING ((bucket_id = 'section-images'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])) |
| Users can update their own avatar | UPDATE | authenticated | USING ((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)) |
| Users can upload section images | INSERT | public | CHECK ((bucket_id = 'section-images'::text) AND (auth.uid() IS NOT NULL)) |
| Users can upload their own avatar | INSERT | authenticated | CHECK ((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)) |
| brand_assets_delete_own | DELETE | authenticated | USING ((bucket_id = 'brand-assets'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])) |
| brand_assets_insert_own | INSERT | authenticated | CHECK ((bucket_id = 'brand-assets'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])) |
| brand_assets_public_read | SELECT | public | USING (bucket_id = 'brand-assets'::text) |
| brand_assets_update_own | UPDATE | authenticated | USING ((bucket_id = 'brand-assets'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])) |
Preserve the rules as observed, not assumed: section-images INSERT requires a signed-in user but does not check folder ownership; UPDATE/DELETE do. LogoUploader uses `logos/<user-id>/...` whereas brand-assets write policy checks the **first** folder equals user ID. This source/path-policy mismatch is recorded, not fixed. Stored public URLs occur in profiles, brand records, sections/page snapshots/caches; migrate bytes separately and remap old origins/paths. External Replicate/Unsplash/website image URLs are not bucket contents.

## 5. AUTH

Hosted `/auth/v1/settings` read succeeded (HTTP 200); the following are observed settings, not inferred from code:

- Email/password provider enabled; public signups enabled (`disable_signup=false`).
- Email auto-confirm **enabled** (`mailer_autoconfirm=true`): confirmation is not required in current configuration. This audit did not change it.
- Anonymous Auth users disabled; phone disabled; phone auto-confirm false; SAML disabled.
- All listed social providers disabled: Apple, Azure/Microsoft, Bitbucket, Discord, Facebook, Snapchat, Figma, Fly, GitHub, GitLab, Google, Keycloak, Kakao, LinkedIn, LinkedIn OIDC, Notion, Spotify, Slack, Slack OIDC, WorkOS, Twitch, Twitter, Zoom. No frontend OAuth provider call found.
- OAuth server/MCP authorization server not configured (not a statement about email login).

Observed hosted Site URL: `https://page-consult-ai.lovable.app`.

Observed redirect allowlist:

- Project-scoped Lovable wildcard preview origin, `/**`.
- Project-scoped regional Lovable wildcard preview origin, `/**`.
- Project-scoped `lovableproject.com` origin, `/**`.
- `https://preview--page-consult-ai.lovable.app/**`.
- `https://page-consult-ai.lovable.app/**`.
- `https://pageconsult.app/**`.
- `https://www.pageconsult.app/**`.

At destination, set Site URL to the new primary origin and allow exact production/custom-domain auth-return paths and deliberately chosen Vercel preview origins; remove retired source-only origins after cutover. Add local-development callback origins intentionally. Source signup navigates internally to `/wizard` or router-state target (Signup.tsx:61,433,488,500), not proof of a hosted callback. No explicit emailRedirectTo found. Destination social OAuth, if added later, needs new provider app credentials/callback URLs.

SMTP sender/credentials, hosted email templates, rate limits, OTP expiry, password-strength/HIBP options, session expiry and additional provider configuration were not read by available settings endpoints and remain unverified. Do not assume defaults or flip confirmation settings as part of this documentation task.

## 6. FRONTEND CONFIG

No literal source-project API hostname or anon credential in frontend TypeScript; API/key references are environment-driven. Source project identifier occurs in `.env:1` and `supabase/config.toml:1`; values intentionally omitted. Every frontend environment-reference location is listed here. Values from `.env` were not reproduced.

| File:line | Reference / migration action |
|---|---|
| `.env:1` | VITE_SUPABASE_PROJECT_ID — destination identifier. |
| `.env:2` | VITE_SUPABASE_PUBLISHABLE_KEY — destination public key (not a privileged secret). |
| `.env:3` | VITE_SUPABASE_URL — destination API origin. |
| `src/integrations/supabase/client.ts:6,7,12` | Shared client reads URL/key; every imported SDK client call inherits these values. |
| `src/contexts/SessionContext.tsx:8,54,114,237,320,358` | URL alias and session-function calls. |
| `src/hooks/useFormSubmission.ts:37,38` | Reads project ID, constructs projectId.supabase.co function hostname; managed hostname assumption. |
| `src/hooks/useBetaPage.ts:151,155` | URL and publishable apikey for beta-stats. |
| `src/pages/Wizard.tsx:875,1045,1188` | URL for intake-chat/generate-strategy-brief. |
| `src/pages/ProspectPage.tsx:199` | URL for track-prospect-view. |
| `src/components/editor/AIConsultantSidebar.tsx:65,112` | URL for ai-consultant. |
| `src/components/editor/SectionImageGenerator.tsx:276` | Storage hostname pattern in a comment only, not a hardcoded configured endpoint. |
| `src/lib/contentGenerator.ts:67` | VITE_ANTHROPIC_API_KEY occurs only in an error-message check; not a required frontend secret. |
| `supabase/config.toml:1` | Backend deployment project identifier, not frontend config. |
| `supabase/functions/generate-prospect-page/index.ts:342` | Backend link builder replaces backend hostname suffix with lovable.app; migration-specific URL assumption, not a frontend key. |

**Vercel build variables (three):** `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`. Configure destination values per environment **before** Vite builds; changing Vercel variables requires a rebuild. No Anthropic/Stripe/service-role secret may be exposed via VITE variables. Function-side secrets belong at the destination backend.

**Deployment:** Vite/React SPA, `build` script in package.json and output `dist`; Vercel must retain normal static asset handling and fall back to index.html for BrowserRouter routes (App.tsx), including `/p/:slug`, `/preview/:token`, `/for/:slug`, editor and account pages. No Vercel rewrite configuration exists in repository. Backend functions remain Deno Edge Functions at the destination, not automatically converted to Vercel functions.

**Cross-origin / URL assumptions:** shared CORS allowlist `_shared/cors.ts:5–9` contains source app origins and local dev ports; source-wide per-handler CORS settings vary. Reconfigure for the destination origins/cookies. `PUBLIC_SITE_URL` must be changed separately. Database-held public storage URLs and published/prospect URLs need remapping beyond these frontend source references.

## 7. EXTERNAL SERVICES

### Stripe

- Checkout handlers: `create-checkout-session`, `stripe-checkout`; API via Stripe SDK. Checkout code confirms subscription Checkout mode, **not test vs live account mode**.
- Webhook handler implemented: `/functions/v1/stripe-webhook` on the backend origin. Incoming `stripe-signature` verified with `STRIPE_WEBHOOK_SECRET`; repository gateway JWT checking disabled for Stripe. Configure a new destination endpoint, then its endpoint-specific signing secret.
- Handled events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Writes subscriptions/user_usage. Preserve metadata/user mapping, products/price IDs/customer/subscription IDs.
- Frontend prices also appear in `src/lib/stripe-config.ts:1–28`; price IDs do not reveal account mode.
- **Configured Stripe dashboard webhook endpoints, subscriptions to events, active account, test/live mode and delivery status are unverified.** Source handler existence is not proof an endpoint is registered. No Stripe secret was read and no checkout/webhook was sent.

### AI providers and outbound integrations

| Service | Calls from | Migration dependency |
|---|---|---|
| Lovable AI gateway | Function rows naming LOVABLE_API_KEY (strategy brief, page content, intake, demo, improvements, color/style/communication extraction, brand scenes, consultant and prospect pivot) | ai.gateway.lovable.dev chat/completions, including Gemini model identifiers. Gateway availability/key portability outside Lovable unverified; independently authorize or replace. |
| Anthropic | anthropic-proxy, classify-industry, consultant-chat, extract-ai-seo-data, extract-brand-brief, generate-content, generate-prospect-page, strategic-orchestrator, validate-brief-intelligence | ANTHROPIC_API_KEY; direct messages API / SDK. |
| Perplexity | company-research, demo-market-research, industry-insights, market-intelligence, orchestrator-research, perplexity-research | PERPLEXITY_API_KEY; api.perplexity.ai/chat/completions. |
| Replicate | generate-hero-images, generate-section-image, remove-logo-background, upscale-logo | REPLICATE_API_TOKEN; predictions API/SDK, polling; remote generated-image hosting is external. |
| Unsplash | unsplash-search, unsplash-track-download; showcase remote images | UNSPLASH_ACCESS_KEY; photo search and download tracking; public photo URLs not copied by SQL. |
| Loops | loops-contact, loops-sync, send-prospect-email, submit-form | LOOPS_API_KEY; contacts/events/transactional APIs; QUICK_PIVOT_EMAIL_ID template and lead-notification template IDs/account configuration. |
| Resend | send-testimonial-request | RESEND_API_KEY; sender-domain/account verification and transactional delivery configuration. |
| Microlink | extract-style-inspiration | api.microlink.io screenshots of supplied website; external service availability/quotas. |
| Customer websites | analyze/extract website, brand and logo functions | Live website HTML/CSS/logos/assets; website access and extracted image URLs remain external dependencies. |
| Google Fonts | index.html:10–12; EnhancedBrandSetup.tsx:751; BrandCustomization.tsx:191; CuratedFontSelect.tsx:65; stats variants | fonts.googleapis.com / fonts.gstatic.com runtime font requests. |
| DiceBear | ProfileSettings.tsx:31–36 | Remote default avatar SVGs. |
| Lovable asset hosting / metadata | index.html:17,21 | Remote default social-preview image hosted by lovable.dev; repository does not own the remote image bytes. |

Share/intent links for LinkedIn/Twitter and schema.org JSON-LD are links/metadata, not paid integrations. No external tracking script identified in index.html; runtime-injected platform analytics or tracking settings were not verified. Some generated review/email URLs still use source domains (e.g. testimonialTemplates.ts:215). Sender domains, email template IDs, provider quotas, billing and webhook dashboards are external state, not inferred from code.

## 8. NOT MIGRATED AUTOMATICALLY

GitHub export carries source and migration files; it does not perform the following operational steps. No transfer was performed during this audit.

| Not carried / not recreated automatically | Manual destination step |
|---|---|
| Live application rows (pages, consultations, brands, leads, subscriptions, usage, caches, roles, tokens) | Use the Cloud database export (More → Database → Manage → Settings → Export project data), restore into an isolated destination with a supported import; reconcile records and cutover writes. Schema-only migrations do not copy rows. |
| Auth users/password hashes/identities | Supported database export includes auth accounts and hashes; restore compatibly into destination. Test real login/recovery. Do not rebuild auth.users from public profiles or a CSV. |
| Existing sessions / cookies / stored browser tokens | Expect reauthentication after project/key/origin change; verify auth storage, guest-session cookies, SameSite/CORS and demo-to-user continuity. |
| Storage file bytes | Download/export separately from More → Storage and upload through destination storage tools, preserving paths/MIME types. Database export/backups do not include file bytes. |
| Absolute database image/page URLs and external-generated asset URLs | Remap old origins/paths in a separately authorized migration step, preserve externally hosted assets intentionally, validate published/preview/prospect pages and thumbnails. |
| Secrets / privileged runtime credentials | Set section 2 names from owners/destination runtime; never copy Cloud privileged keys into frontend or Git. Source service-role key/database password are not accessible on Cloud. |
| Lovable-managed AI gateway entitlement/key lifecycle | Verify independent authorization/continued access or replace provider calls before cutover. No portability guarantee. |
| Hosted Auth provider settings, callback allowlist and Site URL | Reconfigure section 5 from observed settings; create destination OAuth provider app credentials only if enabling social providers. |
| SMTP/email sender, auth email templates, rate limits/security settings | Read source hosted settings where available, recreate intentionally, verify sender DNS and delivery. Settings beyond section 5 remain unverified. |
| Platform extension/service provisioning and table/schema default grants | Provision section 3 gaps, apply migrations, explicitly validate Data API privileges/RLS and Auth/Storage/Realtime compatibility. |
| Deployed Edge Function instances/revisions/gateway flags | Deploy all 71 entrypoints with dependencies at destination and configure gateway/auth settings. Source code export is not a deployment or live revision manifest. |
| Scheduled jobs and platform workflow bindings | Inspect source Jobs/workflows and recreate schedules/triggers if present; reset function existence alone does not prove a scheduled job. Current job bindings unverified. |
| Stripe account products/prices/customers/subscriptions and webhook endpoint registration | Keep existing external account where intended, reconcile IDs/mode, register destination endpoint/events and signing secret, test Checkout and delivery. Actual source endpoint/mode unverified. |
| Loops contacts/templates/events, Resend sender domains, provider accounts/quotas | Preserve external account state, confirm templates/sender DNS/API permissions and delivery; SQL/code do not export it. |
| Vercel project/build variables, SPA rewrites, domain/DNS/TLS | Create Vercel deployment, set three build variables, routing fallback and custom domains; cut DNS deliberately. Current app domains pageconsult.app/www.pageconsult.app and source app hosting do not move with Git. |
| Lovable-hosted publish metadata, social image, platform analytics and deployment history | Configure equivalent hosting/metadata deliberately; export externally hosted assets if needed; history/platform settings are not application SQL. |
| Backups, monitoring/log retention, operational alerts and secret rotation | Configure independent destination backups, logs, alerts and rotation; source backup files/history do not migrate with Git. |
| Repository migration history IDs | All 104 SQL bodies match, but 81 live timestamps differ. Establish destination migration bookkeeping with its own runner; rehearse clean install instead of assuming identical IDs. |

**Could not determine inside this audit:** registered Stripe webhook URLs/test-live mode/events/delivery; actual deployed Edge Function revisions/gateway overrides; SMTP/templates/rate limits/password/session advanced settings; current jobs/workflow bindings; external provider account state/quotas/domain verification; Lovable gateway portability; successful empty-destination replay and migration end-to-end behavior; live storage byte inventory and backup retention. These are limitations, not guessed defaults.

