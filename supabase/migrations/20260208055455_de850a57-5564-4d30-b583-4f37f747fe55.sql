-- Add layout_id column to landing_pages table for storing layout template selection
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS layout_id TEXT;

-- Add an index for faster lookups by layout
CREATE INDEX IF NOT EXISTS idx_landing_pages_layout_id 
ON public.landing_pages(layout_id);

-- Add comment for documentation
COMMENT ON COLUMN public.landing_pages.layout_id IS 'ID of the layout template used for this page (e.g., consulting-authority, saas-product-led)';