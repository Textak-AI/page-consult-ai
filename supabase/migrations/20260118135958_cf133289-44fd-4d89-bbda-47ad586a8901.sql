-- Add design_intelligence column to landing_pages table for persisting SDI decisions
ALTER TABLE landing_pages 
ADD COLUMN IF NOT EXISTS design_intelligence JSONB DEFAULT '{}';