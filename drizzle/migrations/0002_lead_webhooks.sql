ALTER TABLE public.profiles ADD COLUMN lead_webhook_url text;

CREATE TABLE public.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL DEFAULT 'lead.created',
  webhook_url text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL,
  response_status integer,
  error text,
  attempt_count integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.webhook_deliveries TO authenticated;
GRANT ALL ON public.webhook_deliveries TO service_role;

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can read their webhook deliveries"
  ON public.webhook_deliveries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);