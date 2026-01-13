-- Flow state tracking for consultations
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS flow_state text DEFAULT 'started';
-- Values: started, demo_complete, signed_up, brand_captured, consultation_complete, brief_generated, page_generated, published

ALTER TABLE consultations ADD COLUMN IF NOT EXISTS flow_history jsonb DEFAULT '[]'::jsonb;
-- Structure: [{ state: string, timestamp: string, trigger: string }]

-- Huddle tracking  
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS last_huddle_type text;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS last_huddle_at timestamptz;

-- Card notes (for user annotations on intelligence cards)
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS card_notes jsonb DEFAULT '{}'::jsonb;
-- Structure: { "edge": "note text", "audience": "note text", ... }

-- Brief versioning
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS brief_versions jsonb DEFAULT '[]'::jsonb;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS active_brief_version integer DEFAULT 1;

-- Strategy brief content (structured, editable)
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS strategy_brief jsonb;
-- Structure: { positioning, headlines, valueProps, proofPoints, objectionHandlers, ctaStrategy }

-- Add preferred mode to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_mode text DEFAULT 'strategy_partner';
-- Values: 'strategy_partner', 'fast_track' (for future use)