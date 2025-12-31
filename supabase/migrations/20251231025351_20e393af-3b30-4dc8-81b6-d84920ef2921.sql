-- Create prospect_pages table
CREATE TABLE prospect_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ownership
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Source (one of these should be set)
  source_demo_session_id UUID REFERENCES demo_sessions(id) ON DELETE SET NULL,
  source_landing_page_id UUID REFERENCES landing_pages(id) ON DELETE SET NULL,
  
  -- Prospect Information
  prospect_name VARCHAR(100) NOT NULL,
  prospect_email VARCHAR(255),
  prospect_title VARCHAR(100),
  prospect_company VARCHAR(100) NOT NULL,
  prospect_industry VARCHAR(100),
  prospect_company_size VARCHAR(50),
  
  -- Targeting Context
  deal_stage VARCHAR(20) NOT NULL DEFAULT 'cold' CHECK (deal_stage IN ('cold', 'warm', 'proposal', 'negotiation')),
  known_pain_points TEXT[],
  competitive_situation TEXT,
  specific_use_case TEXT,
  custom_instructions TEXT,
  
  -- Generated Content
  personalized_headline TEXT,
  personalized_subheadline TEXT,
  personalized_sections JSONB,
  personalized_brief JSONB,
  
  -- URL & Access
  unique_slug VARCHAR(50) UNIQUE NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Usage tracking
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_prospect_pages_user ON prospect_pages(user_id);
CREATE INDEX idx_prospect_pages_slug ON prospect_pages(unique_slug);
CREATE INDEX idx_prospect_pages_source_demo_session ON prospect_pages(source_demo_session_id);
CREATE INDEX idx_prospect_pages_source_landing_page ON prospect_pages(source_landing_page_id);
CREATE INDEX idx_prospect_pages_status ON prospect_pages(status);

-- RLS Policies
ALTER TABLE prospect_pages ENABLE ROW LEVEL SECURITY;

-- Users can manage their own prospect pages
CREATE POLICY "Users can manage own prospect pages" ON prospect_pages 
  FOR ALL TO authenticated 
  USING (user_id = auth.uid());

-- Public can read published prospect pages
CREATE POLICY "Public can read published prospect pages" ON prospect_pages 
  FOR SELECT TO anon 
  USING (status = 'published');

-- Create prospect_page_views table
CREATE TABLE prospect_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_page_id UUID NOT NULL REFERENCES prospect_pages(id) ON DELETE CASCADE,
  
  -- Visitor identification
  visitor_id VARCHAR(100),
  
  -- View metadata
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  
  -- Geo (optional)
  country VARCHAR(2),
  city VARCHAR(100)
);

CREATE INDEX idx_prospect_page_views_page ON prospect_page_views(prospect_page_id);
CREATE INDEX idx_prospect_page_views_viewed_at ON prospect_page_views(viewed_at DESC);

ALTER TABLE prospect_page_views ENABLE ROW LEVEL SECURITY;

-- Users can view analytics for their own pages
CREATE POLICY "Users can view own page views" ON prospect_page_views 
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM prospect_pages 
    WHERE prospect_pages.id = prospect_page_id 
    AND prospect_pages.user_id = auth.uid()
  ));

-- Public can insert views (for tracking)
CREATE POLICY "Public can insert views" ON prospect_page_views 
  FOR INSERT TO anon 
  WITH CHECK (true);

-- Function for incrementing views
CREATE OR REPLACE FUNCTION increment_prospect_page_views(page_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE prospect_pages 
  SET view_count = view_count + 1, 
      last_viewed_at = NOW() 
  WHERE id = page_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;