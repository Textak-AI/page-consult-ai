-- PageConsult AI — post-restore data fixes, run ONCE at the destination after the Lovable
-- export has been restored (Phase 3). Service-role / SQL editor. Both blocks are re-runnable.
--
-- 1) URL remap: rows hold absolute public-storage URLs on the Lovable project hostname
--    (logos, section images, hero images, OG images). Rewrites every text and jsonb column
--    in public.* that contains the old origin. Externally hosted assets are untouched.
--    First run the count query to see what will change; then the DO block; then the count again (expect 0).

-- Count query (how many columns still reference the old origin):
-- SELECT c.table_name, c.column_name FROM information_schema.columns c
--  WHERE c.table_schema='public' AND c.data_type IN ('text','character varying','jsonb','json') ORDER BY 1,2;

DO $$
DECLARE
  old_origin text := 'https://wopnfuzevpldhkshkmrk.supabase.co';
  new_origin text := 'https://ydskkkcdmtmjpvlmdkkt.supabase.co';
  r record; n bigint; total bigint := 0;
BEGIN
  FOR r IN
    SELECT c.table_name, c.column_name, c.data_type
    FROM information_schema.columns c
    JOIN pg_tables t ON t.schemaname = c.table_schema AND t.tablename = c.table_name
    WHERE c.table_schema = 'public' AND c.data_type IN ('text', 'character varying', 'jsonb', 'json')
      AND c.is_generated = 'NEVER' AND c.is_updatable = 'YES'
  LOOP
    IF r.data_type IN ('jsonb', 'json') THEN
      EXECUTE format('UPDATE public.%I SET %I = replace(%I::text, %L, %L)::%s WHERE %I::text LIKE %L',
        r.table_name, r.column_name, r.column_name, old_origin, new_origin, r.data_type, r.column_name, '%' || old_origin || '%');
    ELSE
      EXECUTE format('UPDATE public.%I SET %I = replace(%I, %L, %L) WHERE %I LIKE %L',
        r.table_name, r.column_name, r.column_name, old_origin, new_origin, r.column_name, '%' || old_origin || '%');
    END IF;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n > 0 THEN RAISE NOTICE 'remapped % rows in %.%', n, r.table_name, r.column_name; total := total + n; END IF;
  END LOOP;
  RAISE NOTICE 'URL remap: % row updates', total;
END $$;

-- 2) Offer-term boilerplate the generator used to inject without client input (runbook Phase 3).
--    Strips the exact phrases from saved sections and published snapshots, then tidies doubled separators.
DO $$
DECLARE
  phrases text[] := ARRAY['Free consultation • No obligation', 'No credit card required', 'Free to start', 'Cancel anytime'];
  p text; n bigint;
BEGIN
  FOREACH p IN ARRAY phrases LOOP
    UPDATE public.landing_pages SET sections = replace(sections::text, p, '')::jsonb WHERE sections::text LIKE '%' || p || '%';
    GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'landing_pages.sections: removed "%" from % rows', p, n;
    UPDATE public.published_pages SET page_content = replace(page_content::text, p, '')::jsonb WHERE page_content::text LIKE '%' || p || '%';
    GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE 'published_pages.page_content: removed "%" from % rows', p, n;
  END LOOP;
  -- leftovers: " • " at the start/end of a string value, or doubled
  UPDATE public.landing_pages SET sections = regexp_replace(regexp_replace(sections::text, '"\s*•\s*', '"', 'g'), '\s*•\s*"', '"', 'g')::jsonb WHERE sections::text ~ '"\s*•|•\s*"';
  UPDATE public.published_pages SET page_content = regexp_replace(regexp_replace(page_content::text, '"\s*•\s*', '"', 'g'), '\s*•\s*"', '"', 'g')::jsonb WHERE page_content::text ~ '"\s*•|•\s*"';
END $$;
