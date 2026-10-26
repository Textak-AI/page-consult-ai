# Architecture rules

- Password recovery shares the /reset-password route and redirect helper; only recovery-link/event sessions validated by getUser may show the reset form, and recovery updateUser omits current_password because recovery sessions are exempt.

- Brand-scene generation uses Replicate reference-image predictions and caches durable data URLs, preserving logo input and preventing expiring provider URLs from breaking cached scenes.

- Generate's asynchronous brief dispatcher reads current router state through a ref before falling back to the mount snapshot and consultation data, preventing stale render closures without parsing or coercing brief values.
- AI consultant transport translates Anthropic text-block events into OpenAI-compatible SSE deltas and a DONE sentinel because the existing editor consumes that streaming contract.
- Public prospect pages use a service-side display-field projection rather than direct anonymous table reads, so CRM status does not gate sharing and private prospect fields stay protected by existing RLS.- Public preview links resolve through a service-side single-token lookup returning display fields only, so preview_links never needs anonymous read access.
