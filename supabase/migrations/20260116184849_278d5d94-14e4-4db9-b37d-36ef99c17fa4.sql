-- =============================================
-- FIX RLS POLICIES: profiles and demo_leads tables
-- =============================================
-- Security requirement: Use explicit role-targeted policies
-- instead of generic USING(false) which scanner flags as unreliable

-- =============================================
-- 1. FIX PROFILES TABLE POLICIES
-- =============================================
-- Drop existing blocking policies (not role-targeted)
DROP POLICY IF EXISTS "Block public access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Block public delete on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Block public insert on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Block public update on profiles" ON public.profiles;

-- Drop existing user policies to rebuild with explicit role targeting
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Block anonymous role explicitly for all operations
CREATE POLICY "profiles_anon_blocked_select" 
  ON public.profiles 
  FOR SELECT
  TO anon 
  USING (false);

CREATE POLICY "profiles_anon_blocked_insert" 
  ON public.profiles 
  FOR INSERT
  TO anon 
  WITH CHECK (false);

CREATE POLICY "profiles_anon_blocked_update" 
  ON public.profiles 
  FOR UPDATE
  TO anon 
  USING (false);

CREATE POLICY "profiles_anon_blocked_delete" 
  ON public.profiles 
  FOR DELETE
  TO anon 
  USING (false);

-- Authenticated users can only access their own profile
-- profiles.id = auth.uid() (profiles uses id as user identifier)
CREATE POLICY "profiles_authenticated_select_own" 
  ON public.profiles 
  FOR SELECT
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "profiles_authenticated_insert_own" 
  ON public.profiles 
  FOR INSERT
  TO authenticated 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_authenticated_update_own" 
  ON public.profiles 
  FOR UPDATE
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_authenticated_delete_own" 
  ON public.profiles 
  FOR DELETE
  TO authenticated 
  USING (auth.uid() = id);

-- =============================================
-- 2. FIX DEMO_LEADS TABLE POLICIES
-- =============================================
-- Note: demo_leads has no user_id column, it uses session_id
-- Anonymous INSERT is intentionally allowed for lead capture (rate limited at app layer)

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can read demo leads" ON public.demo_leads;
DROP POLICY IF EXISTS "Block public access to demo_leads" ON public.demo_leads;
DROP POLICY IF EXISTS "Block public delete on demo_leads" ON public.demo_leads;
DROP POLICY IF EXISTS "Block public insert on demo_leads" ON public.demo_leads;
DROP POLICY IF EXISTS "Block public update on demo_leads" ON public.demo_leads;

-- Anonymous can INSERT only (lead capture form)
-- Rate limited at application layer (5/hour per session)
CREATE POLICY "demo_leads_anon_insert_only" 
  ON public.demo_leads 
  FOR INSERT
  TO anon 
  WITH CHECK (true);

-- Anonymous cannot SELECT/UPDATE/DELETE
CREATE POLICY "demo_leads_anon_no_select" 
  ON public.demo_leads 
  FOR SELECT
  TO anon 
  USING (false);

CREATE POLICY "demo_leads_anon_no_update" 
  ON public.demo_leads 
  FOR UPDATE
  TO anon 
  USING (false);

CREATE POLICY "demo_leads_anon_no_delete" 
  ON public.demo_leads 
  FOR DELETE
  TO anon 
  USING (false);

-- Only admins can read demo leads (for admin dashboard)
CREATE POLICY "demo_leads_admin_select" 
  ON public.demo_leads 
  FOR SELECT
  TO authenticated 
  USING (is_admin(auth.uid()));

-- Service role (edge functions) bypasses RLS for all operations
-- No additional policies needed for service role access