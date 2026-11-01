-- Customer onboarding: one short welcome after signup, once per account.
-- Existing RLS on public.profiles is unchanged (own-row select/insert/update via auth.uid() = id).
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;

-- Accounts that already started work are not sent through onboarding.
UPDATE public.profiles p
SET onboarded_at = now()
WHERE p.onboarded_at IS NULL
  AND (
    EXISTS (SELECT 1 FROM public.consultations c WHERE c.user_id = p.id)
    OR EXISTS (SELECT 1 FROM public.landing_pages l WHERE l.user_id = p.id)
  );
