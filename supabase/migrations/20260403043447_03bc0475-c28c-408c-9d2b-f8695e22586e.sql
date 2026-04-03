
-- Published pages table: stores content snapshots of landing pages at publish time
CREATE TABLE public.published_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  slug VARCHAR(100) UNIQUE NOT NULL,
  page_content JSONB NOT NULL,
  page_styles JSONB,
  page_title VARCHAR(255),
  meta_description TEXT,
  og_image_url TEXT,
  favicon_url TEXT,
  status VARCHAR(20) DEFAULT 'published',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  unpublished_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  design_intelligence JSONB,
  brand_settings JSONB
);

CREATE INDEX idx_published_pages_slug ON public.published_pages(slug);
CREATE INDEX idx_published_pages_user ON public.published_pages(user_id);
CREATE INDEX idx_published_pages_status ON public.published_pages(status);

-- Validation trigger for status field (instead of CHECK constraint)
CREATE OR REPLACE FUNCTION public.validate_published_page_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('published', 'unpublished', 'archived') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_published_page_status
BEFORE INSERT OR UPDATE ON public.published_pages
FOR EACH ROW EXECUTE FUNCTION public.validate_published_page_status();

-- Auto-update updated_at
CREATE TRIGGER trg_published_pages_updated_at
BEFORE UPDATE ON public.published_pages
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.published_pages ENABLE ROW LEVEL SECURITY;

-- Authenticated users can manage their own published pages
CREATE POLICY "Users can manage own published pages"
ON public.published_pages FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Public can view published pages by slug
CREATE POLICY "Public can view published pages"
ON public.published_pages FOR SELECT
TO anon
USING (status = 'published');

-- Function to increment view count on published pages
CREATE OR REPLACE FUNCTION public.increment_published_page_view(page_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.published_pages
  SET view_count = COALESCE(view_count, 0) + 1,
      last_viewed_at = NOW()
  WHERE slug = page_slug AND status = 'published';
END;
$$;
