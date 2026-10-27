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