-- ============================================
-- 1. Create Brands Table
-- ============================================
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Core Identity
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  industry_vertical TEXT,
  
  -- Voice & Style
  tone_profile TEXT[],
  vocabulary_notes TEXT,
  
  -- Design Preferences
  color_mode TEXT DEFAULT 'dark',
  brand_colors JSONB DEFAULT '{}',
  
  -- Metadata
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Block anon access entirely
CREATE POLICY "brands_anon_blocked"
  ON brands FOR ALL TO anon USING (false);

-- Authenticated users manage their own brands
CREATE POLICY "brands_users_select"
  ON brands FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "brands_users_insert"
  ON brands FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "brands_users_update"
  ON brands FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "brands_users_delete"
  ON brands FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Indexes for fast lookups
CREATE INDEX idx_brands_user_id ON brands(user_id);
CREATE INDEX idx_brands_is_default ON brands(user_id, is_default) WHERE is_default = true;

-- ============================================
-- 2. Create Brand Memory Table
-- ============================================
CREATE TABLE brand_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
  
  -- Proof Bank
  credentials TEXT[],
  results TEXT[],
  client_logos TEXT[],
  testimonials JSONB DEFAULT '[]',
  case_studies JSONB DEFAULT '[]',
  
  -- Audience Intelligence
  known_audiences JSONB DEFAULT '[]',
  
  -- Objection Library
  common_objections TEXT[],
  objection_responses JSONB DEFAULT '{}',
  
  -- AI-Gathered Insights
  conversation_insights TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE brand_memory ENABLE ROW LEVEL SECURITY;

-- Block anon access
CREATE POLICY "brand_memory_anon_blocked"
  ON brand_memory FOR ALL TO anon USING (false);

-- Users access memory through brand ownership
CREATE POLICY "brand_memory_users_manage"
  ON brand_memory FOR ALL TO authenticated
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()))
  WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

-- Index
CREATE INDEX idx_brand_memory_brand_id ON brand_memory(brand_id);

-- ============================================
-- 3. Add brand_id to Existing Tables (nullable for backward compatibility)
-- ============================================
ALTER TABLE landing_pages 
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_landing_pages_brand_id ON landing_pages(brand_id);

ALTER TABLE consultations
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_consultations_brand_id ON consultations(brand_id);

-- ============================================
-- 4. Auto-create Brand Memory on Brand Creation
-- ============================================
CREATE OR REPLACE FUNCTION public.create_brand_memory()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO brand_memory (brand_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_brand_created
  AFTER INSERT ON brands
  FOR EACH ROW EXECUTE FUNCTION public.create_brand_memory();

-- ============================================
-- 5. Updated_at Triggers for new tables
-- ============================================
CREATE TRIGGER brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER brand_memory_updated_at
  BEFORE UPDATE ON brand_memory
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();