# Architecture rules

- Generate's asynchronous brief dispatcher reads current router state through a ref before falling back to the mount snapshot and consultation data, preventing stale render closures without parsing or coercing brief values.