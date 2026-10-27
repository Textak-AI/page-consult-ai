ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS welcome_email_sent_at timestamp with time zone;
ALTER TABLE public.landing_pages ADD COLUMN IF NOT EXISTS first_lead_email_sent_at timestamp with time zone;
COMMENT ON COLUMN public.profiles.welcome_email_sent_at IS 'Set by service role when the welcome email is sent; idempotency guard, written only by edge functions.';
COMMENT ON COLUMN public.landing_pages.first_lead_email_sent_at IS 'Set by service role when the first-lead email is sent; idempotency guard, written only by edge functions.';