# Architecture rules

- Generate's asynchronous brief dispatcher reads current router state through a ref before falling back to the mount snapshot and consultation data, preventing stale render closures without parsing or coercing brief values.
- AI consultant transport translates Anthropic text-block events into OpenAI-compatible SSE deltas and a DONE sentinel because the existing editor consumes that streaming contract.
- Public prospect pages use a service-side display-field projection rather than direct anonymous table reads, so CRM status does not gate sharing and private prospect fields stay protected by existing RLS.