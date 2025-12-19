-- Create demo_leads table for capturing emails during demo
CREATE TABLE public.demo_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  session_id text NOT NULL,
  extracted_intelligence jsonb DEFAULT '{}'::jsonb,
  engagement_score integer DEFAULT 0,
  converted_to_user boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index for email lookups
CREATE INDEX idx_demo_leads_email ON public.demo_leads(email);
CREATE INDEX idx_demo_leads_session ON public.demo_leads(session_id);

-- Enable RLS
ALTER TABLE public.demo_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (demo is public)
CREATE POLICY "Anyone can insert demo leads" ON public.demo_leads
  FOR INSERT WITH CHECK (true);

-- Allow anonymous updates (for conversion tracking)
CREATE POLICY "Anyone can update demo leads" ON public.demo_leads
  FOR UPDATE USING (true);