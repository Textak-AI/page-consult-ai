-- Drop the overly permissive public SELECT policy that exposes all columns including sensitive business intelligence
DROP POLICY IF EXISTS "Published landing pages are publicly viewable" ON public.landing_pages;

-- Create a secure function to get public landing page data (excludes sensitive fields)
-- This returns only the columns needed for rendering: sections, styles, meta info
-- Excludes: consultation_data, website_intelligence, strategy_brief, ai_seo_breakdown, ai_seo_score
CREATE OR REPLACE FUNCTION public.get_public_landing_page(page_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', id,
    'title', title,
    'slug', slug,
    'sections', sections,
    'styles', styles,
    'is_published', is_published,
    'published_at', published_at,
    'published_url', published_url,
    'meta_title', meta_title,
    'meta_description', meta_description,
    'hero_thumbnail_url', hero_thumbnail_url,
    'status', status
  )
  FROM public.landing_pages
  WHERE slug = page_slug AND is_published = true
  LIMIT 1;
$$;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_landing_page(text) TO anon, authenticated;