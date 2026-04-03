
CREATE TABLE public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  published_page_id UUID NOT NULL REFERENCES public.published_pages(id) ON DELETE CASCADE,
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  message TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  source_url TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  status VARCHAR(20) DEFAULT 'new'
);

-- Validation trigger for status
CREATE OR REPLACE FUNCTION public.validate_form_submission_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('new', 'contacted', 'qualified', 'archived') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_form_submission_status
BEFORE INSERT OR UPDATE ON public.form_submissions
FOR EACH ROW EXECUTE FUNCTION public.validate_form_submission_status();

CREATE INDEX idx_form_submissions_page ON public.form_submissions(published_page_id);
CREATE INDEX idx_form_submissions_submitted_at ON public.form_submissions(submitted_at DESC);

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view submissions for their own published pages
CREATE POLICY "Users can view own submissions"
ON public.form_submissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.published_pages
    WHERE published_pages.id = form_submissions.published_page_id
    AND published_pages.user_id = auth.uid()
  )
);

-- Users can update submission status for their own published pages
CREATE POLICY "Users can update own submissions"
ON public.form_submissions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.published_pages
    WHERE published_pages.id = form_submissions.published_page_id
    AND published_pages.user_id = auth.uid()
  )
);

-- Public can submit forms (anon insert)
CREATE POLICY "Public can submit forms"
ON public.form_submissions FOR INSERT
TO anon
WITH CHECK (true);

-- Block anon from reading submissions
CREATE POLICY "Anon cannot read submissions"
ON public.form_submissions FOR SELECT
TO anon
USING (false);

-- Block anon from updating submissions
CREATE POLICY "Anon cannot update submissions"
ON public.form_submissions FOR UPDATE
TO anon
USING (false);

-- Block anon from deleting submissions
CREATE POLICY "Anon cannot delete submissions"
ON public.form_submissions FOR DELETE
TO anon
USING (false);
