-- Add AI SEO score columns to landing_pages table
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS ai_seo_score integer,
ADD COLUMN IF NOT EXISTS ai_seo_breakdown jsonb,
ADD COLUMN IF NOT EXISTS ai_seo_last_calculated timestamp with time zone;