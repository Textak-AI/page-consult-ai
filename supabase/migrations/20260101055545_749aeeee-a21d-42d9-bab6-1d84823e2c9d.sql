-- Add consultation status tracking and readiness scoring
-- This enables proper handoff between demo → wizard → generate

-- Add consultation_status to track where user is in journey
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS consultation_status text 
DEFAULT 'not_started'
CHECK (consultation_status IN (
  'not_started',
  'demo_started',
  'demo_complete', 
  'wizard_in_progress',
  'wizard_complete',
  'generation_ready'
));

-- Add readiness_score to track how complete the consultation is
ALTER TABLE consultations
ADD COLUMN IF NOT EXISTS readiness_score integer DEFAULT 0;

-- Add extracted_intelligence to store structured intelligence data
ALTER TABLE consultations
ADD COLUMN IF NOT EXISTS extracted_intelligence jsonb DEFAULT '{}';

-- Comment on columns for documentation
COMMENT ON COLUMN consultations.consultation_status IS 'Tracks user journey: not_started → demo_started → demo_complete → wizard_in_progress → wizard_complete → generation_ready';
COMMENT ON COLUMN consultations.readiness_score IS 'Percentage 0-100 indicating how complete the intelligence gathering is';
COMMENT ON COLUMN consultations.extracted_intelligence IS 'Structured JSON containing all gathered intelligence data';