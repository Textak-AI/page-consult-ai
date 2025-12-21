-- Add website_url column to brand_briefs table
ALTER TABLE public.brand_briefs 
ADD COLUMN IF NOT EXISTS website_url TEXT;