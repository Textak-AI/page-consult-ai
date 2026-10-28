-- Server-side badge decision for published pages: shown unless the page owner is on a paid tier above starter.
-- Returns only a boolean; never exposes the owner or their plan.
CREATE OR REPLACE FUNCTION public.page_shows_badge(page_slug text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH owner AS (
    SELECT user_id FROM public.published_pages WHERE slug = page_slug AND status = 'published'
    UNION ALL
    SELECT user_id FROM public.landing_pages WHERE slug = page_slug AND (status = 'published' OR is_published = true)
    LIMIT 1
  )
  SELECT COALESCE(
    (SELECT u.plan_tier = 'starter' FROM owner o JOIN public.user_usage u ON u.user_id = o.user_id),
    true
  );
$function$;
REVOKE ALL ON FUNCTION public.page_shows_badge(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.page_shows_badge(text) TO anon, authenticated, service_role;