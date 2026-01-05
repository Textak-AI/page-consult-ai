-- Guest sessions for unauthenticated users
CREATE TABLE public.guest_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text UNIQUE NOT NULL,
  email text,
  consultation_data jsonb DEFAULT '{}'::jsonb,
  generated_brief_id uuid,
  generated_page_id uuid,
  intelligence_state jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  converted_to_user_id uuid,
  converted_at timestamptz
);

-- Indexes for fast lookups
CREATE INDEX idx_guest_sessions_token ON public.guest_sessions(session_token);
CREATE INDEX idx_guest_sessions_expires ON public.guest_sessions(expires_at);

-- RLS policies for guest_sessions
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create guest session"
  ON public.guest_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sessions accessible by token"
  ON public.guest_sessions FOR SELECT
  USING (true);

CREATE POLICY "Sessions updatable by token"
  ON public.guest_sessions FOR UPDATE
  USING (true);

-- Leads captured before account creation
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  guest_session_id uuid REFERENCES public.guest_sessions(id),
  source text DEFAULT 'consultation_complete',
  consultation_snapshot jsonb,
  converted_to_user_id uuid,
  created_at timestamptz DEFAULT now(),
  converted_at timestamptz
);

CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_guest_session ON public.leads(guest_session_id);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create lead"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view leads"
  ON public.leads FOR SELECT
  USING (is_admin(auth.uid()));

-- Add guest_session_id to consultations
ALTER TABLE public.consultations 
  ADD COLUMN IF NOT EXISTS guest_session_id uuid REFERENCES public.guest_sessions(id);

-- Make user_id nullable (required for guest consultations)
ALTER TABLE public.consultations 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint: must have either user_id OR guest_session_id
ALTER TABLE public.consultations
  ADD CONSTRAINT consultations_owner_check 
  CHECK (user_id IS NOT NULL OR guest_session_id IS NOT NULL);

-- Update RLS to allow guest session consultations
CREATE POLICY "Guest sessions can create consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (guest_session_id IS NOT NULL OR auth.uid() = user_id);

CREATE POLICY "Guest sessions can view their consultations"
  ON public.consultations FOR SELECT
  USING (guest_session_id IS NOT NULL OR auth.uid() = user_id);

CREATE POLICY "Guest sessions can update their consultations"
  ON public.consultations FOR UPDATE
  USING (guest_session_id IS NOT NULL OR auth.uid() = user_id);