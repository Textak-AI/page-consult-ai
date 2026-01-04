-- Create prospects table
CREATE TABLE prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Prospect info
  first_name TEXT NOT NULL,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    CASE WHEN last_name IS NOT NULL AND last_name != '' 
    THEN first_name || ' ' || last_name ELSE first_name END
  ) STORED,
  email TEXT,
  company TEXT,
  job_title TEXT,
  industry TEXT,
  
  -- Context from Quick Pivot
  context_raw TEXT,
  context_summary TEXT,
  meeting_context TEXT,
  
  -- Linked landing page
  base_page_id UUID REFERENCES landing_pages(id) ON DELETE SET NULL,
  
  -- AI-generated personalized content
  personalized_headline TEXT,
  personalized_subhead TEXT,
  personalized_cta_text TEXT,
  
  -- URL
  slug TEXT UNIQUE NOT NULL,
  
  -- Email
  email_status TEXT DEFAULT 'draft' CHECK (email_status IN ('draft', 'sent', 'failed')),
  email_subject TEXT,
  email_body TEXT,
  email_sent_at TIMESTAMPTZ,
  
  -- Engagement tracking
  first_viewed_at TIMESTAMPTZ,
  last_viewed_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'engaged', 'hot', 'converted', 'cold')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_prospects_user ON prospects(user_id);
CREATE INDEX idx_prospects_slug ON prospects(slug);
CREATE INDEX idx_prospects_status ON prospects(user_id, status);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_prospects_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER prospects_updated
  BEFORE UPDATE ON prospects
  FOR EACH ROW EXECUTE FUNCTION update_prospects_timestamp();

-- Create prospect_views table (separate from existing prospect_page_views)
CREATE TABLE prospect_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  time_on_page INTEGER,
  scroll_depth INTEGER,
  device_type TEXT,
  referrer_source TEXT
);

CREATE INDEX idx_prospect_views_prospect ON prospect_views(prospect_id);

-- Create industries table
CREATE TABLE industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0
);

INSERT INTO industries (name, slug, display_order) VALUES
  ('SaaS / Software', 'saas', 1),
  ('Healthcare', 'healthcare', 2),
  ('Financial Services', 'financial-services', 3),
  ('Logistics / Supply Chain', 'logistics', 4),
  ('Manufacturing', 'manufacturing', 5),
  ('Professional Services', 'professional-services', 6),
  ('E-commerce / Retail', 'ecommerce', 7),
  ('Real Estate', 'real-estate', 8),
  ('Education', 'education', 9),
  ('Marketing / Advertising', 'marketing', 10),
  ('Construction', 'construction', 11),
  ('Other', 'other', 100)
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;

-- Users manage their own prospects
CREATE POLICY "Users manage own prospects" ON prospects
  FOR ALL USING (auth.uid() = user_id);

-- Public can read prospects by slug (for rendering)
CREATE POLICY "Public read prospects by slug" ON prospects
  FOR SELECT USING (true);

-- Anyone can insert views
CREATE POLICY "Public insert prospect views" ON prospect_views
  FOR INSERT WITH CHECK (true);

-- Users can read their prospect views
CREATE POLICY "Users read own prospect views" ON prospect_views
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM prospects WHERE prospects.id = prospect_id AND prospects.user_id = auth.uid())
  );

-- Anyone can read industries
CREATE POLICY "Public read industries" ON industries FOR SELECT USING (true);