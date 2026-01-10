-- Remove the overly permissive public SELECT policy that exposes sensitive columns
DROP POLICY IF EXISTS "Public can view published pages" ON public.landing_pages;

-- Note: The existing get_public_landing_page() function is already a SECURITY DEFINER
-- that returns only safe fields (id, title, slug, sections, styles, is_published, 
-- published_at, published_url, meta_title, meta_description, hero_thumbnail_url, status).
-- Public page rendering should use that RPC instead of direct table access.