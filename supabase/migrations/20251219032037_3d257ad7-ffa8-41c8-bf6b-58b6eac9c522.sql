-- Demo market research cache table
CREATE TABLE public.demo_market_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days')
);

-- Index for fast cache lookups
CREATE INDEX idx_demo_cache_key ON public.demo_market_cache(cache_key);

-- Demo sessions for analytics
CREATE TABLE public.demo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  messages JSONB DEFAULT '[]',
  extracted_intelligence JSONB,
  market_research JSONB,
  completed BOOLEAN DEFAULT false,
  continued_to_consultation BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_hash TEXT,
  message_count INTEGER DEFAULT 0
);

-- Index for session lookups
CREATE INDEX idx_demo_session_id ON public.demo_sessions(session_id);
CREATE INDEX idx_demo_ip_hash ON public.demo_sessions(ip_hash);
CREATE INDEX idx_demo_created_at ON public.demo_sessions(created_at);

-- RLS Policies for demo_market_cache (public read, service role write)
ALTER TABLE public.demo_market_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read cache" 
ON public.demo_market_cache 
FOR SELECT 
USING (true);

-- RLS Policies for demo_sessions (public insert, no user access)
ALTER TABLE public.demo_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert demo sessions" 
ON public.demo_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update demo sessions" 
ON public.demo_sessions 
FOR UPDATE 
USING (true);