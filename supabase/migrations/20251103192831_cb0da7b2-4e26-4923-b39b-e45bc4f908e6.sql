-- Create consultation_sessions table
CREATE TABLE consultation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  session_token TEXT UNIQUE NOT NULL,
  consultation_answers JSONB DEFAULT '{}'::jsonb,
  approved_sections JSONB DEFAULT '{}'::jsonb,
  current_step TEXT DEFAULT 'consultation',
  status TEXT DEFAULT 'in_progress',
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_reminder_sent BOOLEAN DEFAULT false
);

-- Create indexes for performance
CREATE INDEX idx_session_token ON consultation_sessions(session_token);
CREATE INDEX idx_last_active ON consultation_sessions(last_active);
CREATE INDEX idx_status ON consultation_sessions(status);
CREATE INDEX idx_user_email ON consultation_sessions(user_email);

-- Enable RLS
ALTER TABLE consultation_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create a session (for anonymous users)
CREATE POLICY "Allow anonymous session creation"
  ON consultation_sessions
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read sessions (we filter by session_token in app)
CREATE POLICY "Allow session read by token"
  ON consultation_sessions
  FOR SELECT
  USING (true);

-- Allow anyone to update sessions (we filter by session_token in app)
CREATE POLICY "Allow session update by token"
  ON consultation_sessions
  FOR UPDATE
  USING (true);

-- Trigger to auto-update last_active timestamp
CREATE OR REPLACE FUNCTION update_session_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_consultation_sessions_last_active
  BEFORE UPDATE ON consultation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_last_active();