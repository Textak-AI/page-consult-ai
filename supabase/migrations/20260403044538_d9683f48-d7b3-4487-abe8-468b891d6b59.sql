CREATE TABLE preview_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id UUID NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
  token VARCHAR(12) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_preview_links_token ON preview_links(token);
CREATE INDEX idx_preview_links_landing_page ON preview_links(landing_page_id);

ALTER TABLE preview_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "preview_links_anon_blocked"
ON preview_links FOR ALL TO anon USING (false);

CREATE POLICY "Public can read preview links by token"
ON preview_links FOR SELECT TO anon USING (true);

CREATE POLICY "Users can manage own preview links"
ON preview_links FOR ALL TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());