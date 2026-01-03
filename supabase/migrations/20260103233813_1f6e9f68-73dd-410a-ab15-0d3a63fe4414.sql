-- Add columns for Quick Pivot and public page viewing
ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS quick_pivot_enabled BOOLEAN DEFAULT false;
ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ;

-- Ensure slug is unique and indexed
CREATE UNIQUE INDEX IF NOT EXISTS idx_landing_pages_slug ON landing_pages(slug);

-- Index for public page lookups
CREATE INDEX IF NOT EXISTS idx_landing_pages_public ON landing_pages(slug, is_published) WHERE is_published = true;

-- Index for Quick Pivot page matching
CREATE INDEX IF NOT EXISTS idx_landing_pages_quick_pivot ON landing_pages(user_id, industry) WHERE quick_pivot_enabled = true;

-- Allow public read access to published pages (by slug lookup)
DROP POLICY IF EXISTS "Public can view published pages" ON landing_pages;
CREATE POLICY "Public can view published pages"
  ON landing_pages FOR SELECT
  USING (is_published = true);

-- Function to increment page view count
CREATE OR REPLACE FUNCTION increment_page_view(page_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE landing_pages
  SET 
    view_count = COALESCE(view_count, 0) + 1,
    last_viewed_at = NOW()
  WHERE id = page_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_page_view(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_page_view(UUID) TO authenticated;