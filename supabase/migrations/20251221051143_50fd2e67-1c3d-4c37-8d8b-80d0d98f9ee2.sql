-- Add logo fields to brand_briefs table
ALTER TABLE brand_briefs
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS logo_storage_path TEXT;