-- Add session_id column to landing_pages for demo flow (no foreign key constraint)
ALTER TABLE public.landing_pages ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_landing_pages_session_id ON public.landing_pages(session_id);