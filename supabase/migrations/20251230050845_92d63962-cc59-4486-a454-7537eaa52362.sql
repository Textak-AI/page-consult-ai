-- Create app_role enum type
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'support');

-- Create admin_roles table for database-backed admin authorization
CREATE TABLE public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  granted_by UUID,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Create helper function to check if user has any admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- RLS Policies for admin_roles table
-- Only super_admins can view all roles
CREATE POLICY "Super admins can view all roles" ON public.admin_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON public.admin_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only super_admins can manage roles
CREATE POLICY "Super admins can insert roles" ON public.admin_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update roles" ON public.admin_roles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete roles" ON public.admin_roles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Seed initial super_admin (kyle@textak.ai) - using a subquery to get user_id
-- This needs to be done manually after finding the user_id, or via edge function

-- Fix track_ai_action to validate caller owns the user_id
CREATE OR REPLACE FUNCTION public.track_ai_action(
  p_user_id UUID,
  p_action_type ai_action_type,
  p_action_cost INTEGER,
  p_page_id UUID DEFAULT NULL,
  p_section_type TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usage RECORD;
  v_available INTEGER;
  v_remaining INTEGER;
BEGIN
  -- SECURITY: Validate caller owns the user_id
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'error', 'Authentication required');
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RETURN jsonb_build_object('allowed', false, 'error', 'Cannot modify another user''s credits');
  END IF;

  -- Get or create user usage record
  INSERT INTO public.user_usage (user_id, plan_tier, ai_actions_limit)
  VALUES (p_user_id, 'starter', 30)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_usage FROM public.user_usage WHERE user_id = p_user_id;

  -- Agency tier always allowed, don't track
  IF v_usage.plan_tier = 'agency' THEN
    INSERT INTO public.usage_log (user_id, action_type, action_cost, page_id, section_type, description)
    VALUES (p_user_id, p_action_type, p_action_cost, p_page_id, p_section_type, p_description);
    RETURN jsonb_build_object('allowed', true, 'remaining', -1, 'unlimited', true);
  END IF;

  -- Calculate available actions (limit + purchased + rollover - used)
  v_available := COALESCE(v_usage.ai_actions_limit, 30) + v_usage.actions_purchased - v_usage.ai_actions_used + v_usage.ai_actions_rollover;

  -- Check if action is allowed
  IF p_action_cost > v_available THEN
    RETURN jsonb_build_object('allowed', false, 'remaining', v_available, 'unlimited', false);
  END IF;

  -- Deduct from rollover first, then from limit
  IF v_usage.ai_actions_rollover >= p_action_cost THEN
    UPDATE public.user_usage 
    SET ai_actions_rollover = ai_actions_rollover - p_action_cost,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE public.user_usage 
    SET ai_actions_used = ai_actions_used + (p_action_cost - ai_actions_rollover),
        ai_actions_rollover = 0,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  -- Log the action with description
  INSERT INTO public.usage_log (user_id, action_type, action_cost, page_id, section_type, description)
  VALUES (p_user_id, p_action_type, p_action_cost, p_page_id, p_section_type, p_description);

  v_remaining := v_available - p_action_cost;

  RETURN jsonb_build_object('allowed', true, 'remaining', v_remaining, 'unlimited', false);
END;
$$;

-- Fix grant_grace_actions to validate caller owns the user_id (self-service only)
CREATE OR REPLACE FUNCTION public.grant_grace_actions(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usage RECORD;
BEGIN
  -- SECURITY: Validate caller owns the user_id
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  SELECT * INTO v_usage FROM public.user_usage WHERE user_id = p_user_id;

  IF v_usage IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF v_usage.grace_actions_given THEN
    RETURN jsonb_build_object('success', false, 'error', 'Grace actions already used this billing period');
  END IF;

  UPDATE public.user_usage
  SET ai_actions_rollover = ai_actions_rollover + 3,
      grace_actions_given = true,
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'actions_granted', 3);
END;
$$;

-- Restrict reset_monthly_usage to service role only
REVOKE EXECUTE ON FUNCTION public.reset_monthly_usage() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reset_monthly_usage() FROM anon;
REVOKE EXECUTE ON FUNCTION public.reset_monthly_usage() FROM authenticated;