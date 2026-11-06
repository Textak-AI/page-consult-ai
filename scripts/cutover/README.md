# Cutover scripts (Lovable → own Supabase + Vercel), Nov 2026

Rehearsed on 2026-11-06 against a local Postgres 16 replica of the destination state
(104 supabase/ migrations + drizzle 0000–0003 = 37 tables, 162 policies).

- `destination-delta-2026-11-06.sql` — drizzle 0003 → 0014, re-runnable. Takes the destination
  to the live schema (40 tables, 168 policies). Run in the SQL editor before the data restore.
- `url-remap-and-cleanup.sql` — run once after the restore: rewrites the old storage origin
  in every text/jsonb column, then strips the injected offer-term boilerplate.

The checklist with the dashboard steps is `claude/CUTOVER_CHECKLIST_2026-11.md` in the project.
