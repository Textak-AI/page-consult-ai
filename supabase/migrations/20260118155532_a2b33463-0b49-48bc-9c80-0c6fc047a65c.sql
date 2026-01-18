-- Add target_market to landing_pages
ALTER TABLE landing_pages 
ADD COLUMN IF NOT EXISTS target_market TEXT;

-- Add index for filtering by user and target market
CREATE INDEX IF NOT EXISTS idx_landing_pages_target_market 
ON landing_pages(user_id, target_market);