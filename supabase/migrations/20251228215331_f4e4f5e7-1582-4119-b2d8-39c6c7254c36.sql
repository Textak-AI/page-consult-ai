-- Add brief_viewed_at column to track when users view their strategy brief
ALTER TABLE public.demo_sessions 
ADD COLUMN IF NOT EXISTS brief_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.demo_sessions.brief_viewed_at IS 'Timestamp when user first viewed their strategy brief page';