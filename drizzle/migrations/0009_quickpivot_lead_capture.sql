ALTER TABLE public.prospect_pages ADD COLUMN IF NOT EXISTS first_lead_email_sent_at timestamptz;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS first_lead_email_sent_at timestamptz;
REVOKE UPDATE ON public.prospect_pages, public.prospects FROM authenticated;
GRANT UPDATE (source_demo_session_id, source_landing_page_id, prospect_name, prospect_email, prospect_title, prospect_company, prospect_industry, prospect_company_size, deal_stage, known_pain_points, competitive_situation, specific_use_case, custom_instructions, personalized_headline, personalized_subheadline, personalized_sections, personalized_brief, unique_slug, status, updated_at, published_at, expires_at, view_count, last_viewed_at) ON public.prospect_pages TO authenticated;
GRANT UPDATE (first_name, last_name, full_name, email, company, job_title, industry, context_raw, context_summary, meeting_context, base_page_id, personalized_headline, personalized_subhead, personalized_cta_text, slug, email_status, email_subject, email_body, email_sent_at, first_viewed_at, last_viewed_at, view_count, engagement_score, status, updated_at) ON public.prospects TO authenticated;
CREATE TABLE public.quickpivot_leads (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
 prospect_page_id uuid REFERENCES public.prospect_pages(id) ON DELETE CASCADE,
 prospect_id uuid REFERENCES public.prospects(id) ON DELETE CASCADE,
 prospect_slug text NOT NULL, page_title text, email varchar(255) NOT NULL,
 name varchar(255), phone varchar(50), company varchar(255), message text,
 custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb, source_url text,
 utm_source varchar(100), utm_medium varchar(100), utm_campaign varchar(100),
 submitted_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT one_prospect CHECK ((prospect_page_id IS NULL) <> (prospect_id IS NULL))
);
GRANT SELECT ON public.quickpivot_leads TO authenticated;
GRANT ALL ON public.quickpivot_leads TO service_role;
ALTER TABLE public.quickpivot_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read QuickPivot leads" ON public.quickpivot_leads FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.guard_prospect_first_lead() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF current_user IN ('authenticated','anon') THEN
  IF TG_OP = 'INSERT' THEN NEW.first_lead_email_sent_at := NULL;
  ELSIF NEW.first_lead_email_sent_at IS DISTINCT FROM OLD.first_lead_email_sent_at THEN RAISE EXCEPTION 'First-lead timestamp is server-written'; END IF;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER guard_first_lead_email BEFORE INSERT OR UPDATE ON public.prospect_pages FOR EACH ROW EXECUTE FUNCTION public.guard_prospect_first_lead();
CREATE TRIGGER guard_first_lead_email BEFORE INSERT OR UPDATE ON public.prospects FOR EACH ROW EXECUTE FUNCTION public.guard_prospect_first_lead();
CREATE OR REPLACE FUNCTION public.claim_quickpivot_first_lead(p_lead_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE l public.quickpivot_leads; claimed uuid;
BEGIN
 SELECT * INTO l FROM public.quickpivot_leads WHERE id = p_lead_id;
 IF NOT FOUND THEN RETURN false; END IF;
 IF l.prospect_page_id IS NOT NULL THEN
  UPDATE public.prospect_pages SET first_lead_email_sent_at = now() WHERE id = l.prospect_page_id AND first_lead_email_sent_at IS NULL AND NOT EXISTS (SELECT 1 FROM public.quickpivot_leads q WHERE q.prospect_page_id = l.prospect_page_id AND (q.submitted_at,q.id) < (l.submitted_at,l.id)) RETURNING id INTO claimed;
 ELSE
  UPDATE public.prospects SET first_lead_email_sent_at = now() WHERE id = l.prospect_id AND first_lead_email_sent_at IS NULL AND NOT EXISTS (SELECT 1 FROM public.quickpivot_leads q WHERE q.prospect_id = l.prospect_id AND (q.submitted_at,q.id) < (l.submitted_at,l.id)) RETURNING id INTO claimed;
 END IF;
 RETURN claimed IS NOT NULL;
END; $$;
REVOKE ALL ON FUNCTION public.claim_quickpivot_first_lead(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_quickpivot_first_lead(uuid) TO service_role;