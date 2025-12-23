-- Cache for generated brand scenes (avoid regenerating same logo + industry)
CREATE TABLE public.brand_scene_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  logo_hash TEXT NOT NULL,
  industry TEXT NOT NULL,
  subcategory TEXT,
  scenes JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brand_scene_cache_key ON public.brand_scene_cache(cache_key);
CREATE INDEX idx_brand_scene_cache_logo ON public.brand_scene_cache(logo_hash);

-- Enable RLS
ALTER TABLE public.brand_scene_cache ENABLE ROW LEVEL SECURITY;

-- Public read (cached scenes can be served to anyone with the key)
CREATE POLICY "Public read access" ON public.brand_scene_cache
  FOR SELECT USING (true);

-- Service role can insert/update (edge function uses service role)
CREATE POLICY "Service role insert" ON public.brand_scene_cache
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role update" ON public.brand_scene_cache
  FOR UPDATE USING (true);

-- Tracking table for rate limiting and analytics
CREATE TABLE public.brand_scene_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  consultation_id UUID,
  cache_key TEXT,
  scenes_count INTEGER DEFAULT 1,
  from_cache BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brand_generations_user ON public.brand_scene_generations(user_id, created_at);
CREATE INDEX idx_brand_generations_cache ON public.brand_scene_generations(from_cache, created_at);

-- Enable RLS
ALTER TABLE public.brand_scene_generations ENABLE ROW LEVEL SECURITY;

-- Users can see their own generations
CREATE POLICY "Users view own generations" ON public.brand_scene_generations
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert (edge function uses service role)
CREATE POLICY "Service role insert generations" ON public.brand_scene_generations
  FOR INSERT WITH CHECK (true);