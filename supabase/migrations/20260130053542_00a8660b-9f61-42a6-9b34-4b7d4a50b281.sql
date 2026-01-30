-- Create inspiration_sites table for Style Intelligence feature
CREATE TABLE public.inspiration_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  screenshot_url TEXT,
  extracted_style JSONB,
  extraction_confidence TEXT CHECK (extraction_confidence IN ('high', 'medium', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.inspiration_sites ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own inspiration sites
CREATE POLICY "Users can view their own inspiration sites"
  ON public.inspiration_sites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inspiration sites"
  ON public.inspiration_sites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inspiration sites"
  ON public.inspiration_sites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inspiration sites"
  ON public.inspiration_sites FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_inspiration_sites_updated_at
  BEFORE UPDATE ON public.inspiration_sites
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_inspiration_sites_user_id ON public.inspiration_sites(user_id);
CREATE INDEX idx_inspiration_sites_brand_id ON public.inspiration_sites(brand_id);