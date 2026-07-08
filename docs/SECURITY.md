# Security

## Secret Handling
- `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` stored in Vercel environment variables only.
- Never referenced in any client-side file. All AI calls go through Next.js server route handlers (`/api/...`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_URL` are the only values exposed to the browser — these are safe by design (RLS enforces access).

## Permission Model
**v1 (demo):** Permissive RLS — all rows readable and writable without auth. Acceptable only while no real user data exists.
**Lock-down sprint:** Every table's policies replaced with `auth.uid() = user_id`. Rows without a `user_id` (seed demos) become inaccessible after lock-down — migrate or mark them.

## Approved Tools Rule
Server route handlers call only explicitly imported, named functions (`extract_event`, `summarise_document`, `diff_documents`). No dynamic tool dispatch. No `eval`, no `run_any`, no wildcard API forwarding.

## Agent Permissions
Agent actions execute with the same Supabase client and RLS context as the authenticated user. The agent cannot escalate beyond what the user's session permits.

## Audit Principle
Every meaningful write (create, update, status change, AI action) appends a row to `audit_logs` with actor, target, and a before/after snapshot. Audit rows are append-only — no delete policy on `audit_logs`.

## Sensitive Data Warning
Do not store customer PII (ID numbers, financial account data) in event `raw_content` until a data-handling policy and encryption-at-rest review is completed. Flag this before onboarding external clients.
