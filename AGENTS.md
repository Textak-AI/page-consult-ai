# Architecture rules

- Password recovery shares the /reset-password route and redirect helper; only recovery-link/event sessions validated by getUser may show the reset form, and recovery updateUser omits current_password because recovery sessions are exempt.

- Brand-scene generation uses Replicate reference-image predictions and caches durable data URLs, preserving logo input and preventing expiring provider URLs from breaking cached scenes.

- Generate's asynchronous brief dispatcher reads current router state through a ref before falling back to the mount snapshot and consultation data, preventing stale render closures without parsing or coercing brief values.
- AI consultant transport translates Anthropic text-block events into OpenAI-compatible SSE deltas and a DONE sentinel because the existing editor consumes that streaming contract.
- Public prospect pages use a service-side display-field projection rather than direct anonymous table reads, so CRM status does not gate sharing and private prospect fields stay protected by existing RLS.- Public preview links resolve through a service-side single-token lookup returning display fields only, so preview_links never needs anonymous read access.
- Lead webhooks: profiles.lead_webhook_url (HTTPS-only) + webhook_deliveries log; delivery via _shared/leadWebhook.ts (5s timeout, 1 retry, never blocks lead capture); test-lead-webhook authenticates and only posts to the caller's own saved URL.
- Billing actions share create-portal-session; it validates the user and resolves only their stored Stripe customer ID, with a server-configured return URL, so clients cannot select another billing account or redirect target.
- Anonymous session access uses explicit bearer capabilities checked against service-side rows and expiry; demo tokens are session_id values (not record IDs), claimed sessions require their authenticated owner, and consultationAccess keeps authenticated queries unchanged while routing guest ID-scoped queries through guest-session.
