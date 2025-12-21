-- Create consultation drafts table for auto-save
CREATE TABLE IF NOT EXISTS public.consultation_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  wizard_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.consultation_drafts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own drafts" ON public.consultation_drafts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drafts" ON public.consultation_drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drafts" ON public.consultation_drafts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drafts" ON public.consultation_drafts
  FOR DELETE USING (auth.uid() = user_id);