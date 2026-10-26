# Security Findings — RLS inventory (documentation only)

Snapshot of three open `lov_pgscan` findings, taken 2026-10-26 from live `pg_policies`.
No policies, schema, or code were changed. "Depends on it" names the app behavior that
currently relies on the policy; "service role" means the caller is an edge function that
bypasses RLS, so the policy is likely not load-bearing for that path.

---

## Finding 1 — Some access rules let everyone through (error)

Internal IDs: lov_db_rls_tautology_permissive_v1_{bceba55ddbf11df2, 04e3b3e302b6828e, 8ba6c09b2179e47a, 9e63249ac2f5c331, cbfb9cce6740002f, d4464bbc4a64724a, d9314bd212cccb32, f9514227c97ace48, ff6a9dd7eddbeb0b, 7bb87fc4b57f1fbb, c41812105ec77eea}

| Table | Policy | Op | Roles | Rule | Depends on it |
|---|---|---|---|---|---|
| preview_links | Public can read preview links by token | SELECT | anon | `USING (true)` | PreviewPage.tsx looks up a 7-day share-preview token signed out. **Exposes every token** (error-level). |
| demo_leads | demo_leads_anon_insert | INSERT | anon | `WITH CHECK (true)` | IntelligenceContext.tsx inserts demo-chat email captures from the browser. |
| leads | Anon can create lead | INSERT | anon | `WITH CHECK (true)` | leadCapture.ts / sessionMigration.ts insert guest email leads from the browser. |
| leads | leads_anon_insert | INSERT | anon | `WITH CHECK (true)` | Duplicate of the above. |
| beta_signups | beta_signups_anon_insert | INSERT | anon | `WITH CHECK (true)` | None from the client — beta-signup edge function inserts with service role. |
| demo_sessions | Anon can insert own demo session | INSERT | anon | `WITH CHECK (true)` | Demo chat session creation for signed-out visitors (client + demo-* functions). |
| demo_sessions | authenticated_insert_demo_sessions | INSERT | authenticated | `WITH CHECK (true)` | Demo chat started while signed in. |
| demo_sessions | demo_sessions_anon_insert | INSERT | anon | `WITH CHECK (true)` | Duplicate of the anon insert. |
| guest_sessions | Anon can create guest session | INSERT | anon | `WITH CHECK (true)` | Anonymous consultation guest session creation (guestSession.ts / SessionContext). |
| guest_sessions | guest_sessions_anon_insert | INSERT | anon | `WITH CHECK (true)` | Duplicate of the above. |
| prospect_page_views | prospect_page_views_anon_insert | INSERT | anon | `WITH CHECK (true)` | None from the client — track-prospect-page-view uses service role. |
| prospect_views | Anon can track prospect views | INSERT | anon | `WITH CHECK (true)` | None from the client — track-prospect-view uses service role (/for/:slug analytics). |
| prospect_views | prospect_views_anon_insert | INSERT | anon | `WITH CHECK (true)` | Duplicate of the above. |
| form_submissions | Public can submit forms | INSERT | anon | `WITH CHECK (true)` | None from the client — submit-form (published-page lead forms) uses service role. |
| industries | Public read industries | SELECT | public | `USING (true)` | Industry reference list; intentionally public, no sensitive columns. |
| industries | industries_public_read | SELECT | anon, authenticated | `USING (true)` | Duplicate of the above. |
| hero_image_cache | Authenticated users can read hero cache | SELECT | authenticated | `USING (true)` | heroImages.ts reads shared cached hero images in the editor. |

## Finding 2 — Some access rules trust what the caller tells them (error)

Internal IDs: lov_db_rls_spoofable_request_context_v1_{12cb98c25fede67e, 64c0d1fcff942442, 7426dabe4118f39d, 84fa1ac4ce7926a3, a4f6b4157c328dd0, c47b4b1e25e78bce, c6e65d72a8e0b3ea, e13627c9a1e73236, ecec89d8cb3e1f8a, ef897e04dcfdbff9, f8b783b97180b46d, ff2d91811922cddb}

Shorthand: `cookie(x)` = `current_setting('request.cookies', true)::json ->> 'x'`; `header(x)` = `current_setting('request.headers', true)::json ->> 'x'`. Both are caller-supplied.

| Table | Policy | Op | Roles | Rule | Depends on it |
|---|---|---|---|---|---|
| guest_sessions | Token holders can read own session | SELECT | anon, authenticated | `USING (session_token = cookie(guest_session))` | Anonymous consultation resume (get-session / sessionMigration reading the guest session). |
| guest_sessions | Token holders can update own session | UPDATE | anon, authenticated | `USING (session_token = cookie(guest_session))` | Saving anonymous consultation progress into the guest session. |
| guest_sessions | guest_sessions_anon_update_own_only | UPDATE | anon | `USING` and `WITH CHECK (session_token = cookie(guest_session))` | Same as above (duplicate, anon-only). |
| consultations | Guest sessions can create own consultations | INSERT | anon | `WITH CHECK (guest_session_id IS NOT NULL AND guest_session_id IN (SELECT id FROM guest_sessions WHERE session_token = cookie(guest_session)))` | Signed-out visitors creating a consultation tied to their guest session. |
| consultations | Guest sessions can view own consultations | SELECT | anon | `USING (` same guest-session subquery `)` | Signed-out visitors reading back their in-progress consultation. |
| consultations | Guest sessions can update own consultations | UPDATE | anon | `USING (` same guest-session subquery `)` | Signed-out visitors editing their consultation before sign-up / migration. |
| consultation_sessions | consultation_sessions_anon_insert_with_token | INSERT | anon | `WITH CHECK (session_token = cookie(consultation_session) OR cookie(consultation_session) IS NULL)` | Anonymous session creation (create-anonymous-session; set-session-cookie issues the cookie). The `IS NULL` branch admits any insert without a cookie. |
| consultation_sessions | consultation_sessions_anon_update_own_only | UPDATE | anon | `USING` and `WITH CHECK (session_token = cookie(consultation_session))` | Anonymous session progress saves (update-anonymous-session). |
| demo_sessions | Demo sessions updatable by session_id | UPDATE | anon | `USING (session_id = cookie(demo_session) OR session_id = header(x-demo-session-id))`; `WITH CHECK (claimed_by IS NULL OR claimed_by = auth.uid())` | Demo chat writing messages/intelligence by session id (demoHandoff, demo-* functions). Counted twice in the scan (cookie + header). |
| demo_sessions | demo_sessions_anon_update | UPDATE | anon | `USING` and `WITH CHECK (session_id = cookie(demo_session) OR session_id = header(x-demo-session-id))` | Same demo chat updates (duplicate). Counted twice in the scan (cookie + header). |

Note: demo-update-session, create/update/migrate-anonymous-session use the service role, so their writes do not pass through these policies; direct browser writes do.

## Finding 3 — Some access rules only check that someone is signed in (warn)

Internal IDs: lov_db_rls_authenticated_only_v1_{c41812105ec77eea, fc9117dadb43c5ce}

| Table | Policy | Op | Roles | Rule | Depends on it |
|---|---|---|---|---|---|
| hero_image_cache | Authenticated users can read shared hero cache | SELECT | authenticated | `USING (auth.uid() IS NOT NULL)` | heroImages.ts reads shared cached hero images (cache is cross-user by design). |
| hero_image_cache | Authenticated users can insert cache | INSERT | public | `WITH CHECK (auth.uid() IS NOT NULL)` | Client/editor writing new hero image cache entries; generate-hero-images also writes. |
| hero_image_cache | Authenticated users can update cache | UPDATE | public | `USING (auth.uid() IS NOT NULL)` | Refreshing existing cache entries — any signed-in user can overwrite any entry. |
| brand_scene_cache | Authenticated users can read shared scene cache | SELECT | authenticated | `USING (auth.uid() IS NOT NULL)` | Shared brand-scene cache; generate-brand-scene reads/writes it (service role). |
