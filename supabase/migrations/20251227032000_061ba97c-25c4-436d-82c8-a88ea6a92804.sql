-- Add missing fields to consultations table for Strategy Brief Editor
ALTER TABLE consultations
ADD COLUMN IF NOT EXISTS audience_pain_points TEXT[],
ADD COLUMN IF NOT EXISTS audience_goals TEXT[],
ADD COLUMN IF NOT EXISTS key_benefits TEXT[],
ADD COLUMN IF NOT EXISTS competitor_differentiator TEXT,
ADD COLUMN IF NOT EXISTS authority_markers TEXT[],
ADD COLUMN IF NOT EXISTS credentials TEXT,
ADD COLUMN IF NOT EXISTS client_count TEXT,
ADD COLUMN IF NOT EXISTS case_study_highlight TEXT,
ADD COLUMN IF NOT EXISTS risk_reversals TEXT[],
ADD COLUMN IF NOT EXISTS secondary_cta TEXT,
ADD COLUMN IF NOT EXISTS primary_cta TEXT,
ADD COLUMN IF NOT EXISTS urgency_angle TEXT,
ADD COLUMN IF NOT EXISTS guarantee_offer TEXT,
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;