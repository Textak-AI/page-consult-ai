-- Create landing_pages table for generated pages
CREATE TABLE public.landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  
  -- Page info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Content (stored as JSON for flexibility)
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  styles JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  published_url TEXT,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Analytics
  analytics_enabled BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own landing pages"
  ON public.landing_pages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own landing pages"
  ON public.landing_pages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own landing pages"
  ON public.landing_pages
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own landing pages"
  ON public.landing_pages
  FOR DELETE
  USING (auth.uid() = user_id);

-- Published pages are publicly viewable
CREATE POLICY "Published landing pages are publicly viewable"
  ON public.landing_pages
  FOR SELECT
  USING (is_published = true);

-- Indexes
CREATE INDEX idx_landing_pages_user ON public.landing_pages(user_id);
CREATE INDEX idx_landing_pages_slug ON public.landing_pages(slug);
CREATE INDEX idx_landing_pages_consultation ON public.landing_pages(consultation_id);

-- Trigger for updated_at
CREATE TRIGGER update_landing_pages_updated_at
  BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_consultations_updated_at();