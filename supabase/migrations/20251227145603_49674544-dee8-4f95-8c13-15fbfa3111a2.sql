-- Add version tracking columns to landing_pages
ALTER TABLE landing_pages 
ADD COLUMN IF NOT EXISTS parent_page_id UUID REFERENCES landing_pages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_current_version BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS hero_thumbnail_url TEXT;

-- Create index for faster version grouping
CREATE INDEX IF NOT EXISTS idx_landing_pages_parent 
ON landing_pages(parent_page_id, updated_at DESC);

-- Create index for current version lookups
CREATE INDEX IF NOT EXISTS idx_landing_pages_current_version
ON landing_pages(is_current_version) WHERE is_current_version = true;

-- Create index on created_at for day grouping (without function)
CREATE INDEX IF NOT EXISTS idx_landing_pages_created_at
ON landing_pages(created_at DESC);