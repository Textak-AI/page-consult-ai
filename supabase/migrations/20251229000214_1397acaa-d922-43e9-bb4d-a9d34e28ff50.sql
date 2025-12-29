-- Add brand intake columns to demo_sessions
ALTER TABLE demo_sessions ADD COLUMN IF NOT EXISTS brand_assets JSONB DEFAULT NULL;
ALTER TABLE demo_sessions ADD COLUMN IF NOT EXISTS brand_intake_completed BOOLEAN DEFAULT false;
ALTER TABLE demo_sessions ADD COLUMN IF NOT EXISTS brand_intake_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;