-- Per-caller hourly limits for public (pre-sign-in) edge functions that spend AI credits.
-- Written and read only by edge functions with the service role. No client access.
CREATE TABLE IF NOT EXISTS public.edge_rate_limits (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fn text NOT NULL,
  caller_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS edge_rate_limits_lookup ON public.edge_rate_limits (fn, caller_hash, created_at DESC);

ALTER TABLE public.edge_rate_limits ENABLE ROW LEVEL SECURITY;

-- Block anon and authenticated entirely; the service role bypasses RLS.
DROP POLICY IF EXISTS "No client access" ON public.edge_rate_limits;
CREATE POLICY "No client access" ON public.edge_rate_limits FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
REVOKE ALL ON public.edge_rate_limits FROM anon, authenticated;