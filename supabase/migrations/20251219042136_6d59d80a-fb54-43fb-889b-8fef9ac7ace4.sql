-- Add unique constraint on session_id for upsert operations
ALTER TABLE public.demo_sessions ADD CONSTRAINT demo_sessions_session_id_key UNIQUE (session_id);