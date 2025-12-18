-- Add strategic consultation columns to landing_pages
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS consultation_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS website_intelligence jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS strategy_brief text DEFAULT NULL;