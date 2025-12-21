-- Create brand_briefs table for storing extracted brand guidelines
CREATE TABLE public.brand_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT DEFAULT 'My Brand',
  
  colors JSONB DEFAULT '{
    "primary": null,
    "secondary": null,
    "accent": null
  }',
  
  typography JSONB DEFAULT '{
    "headlineFont": null,
    "bodyFont": null
  }',
  
  voice_tone JSONB DEFAULT '{
    "personality": [],
    "description": null,
    "doSay": [],
    "dontSay": []
  }',
  
  source_file_name TEXT,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.brand_briefs ENABLE ROW LEVEL SECURITY;

-- Users can view their own brand briefs
CREATE POLICY "Users can view own brand briefs" ON public.brand_briefs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own brand briefs
CREATE POLICY "Users can insert own brand briefs" ON public.brand_briefs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own brand briefs
CREATE POLICY "Users can update own brand briefs" ON public.brand_briefs
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own brand briefs
CREATE POLICY "Users can delete own brand briefs" ON public.brand_briefs
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_brand_briefs_updated_at
  BEFORE UPDATE ON public.brand_briefs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_consultations_updated_at();