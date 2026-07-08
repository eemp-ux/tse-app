# Agentic Layer

## Risk Levels & Actions

### Low — auto-execute (no approval needed)
- `extract_event_summary` — parse pasted text, write event + requirements rows
- `summarise_bid_document` — summarise pasted bid text, store with `review_status = unreviewed`
- `detect_requirement_changes` — diff two document versions, write `requirement_changes` rows
- `score_requirement_priority` — assign priority label based on keyword rules

### Medium — draft + user approval before write
- `update_requirement_status` — change a requirement from open → confirmed or changed (agent drafts, user one-click confirms)
- `create_follow_up_note` — agent drafts a note summarising open items; user edits and saves

### High — always requires explicit approval
- `compose_vendor_query` — draft an outbound message to a vendor; user must review and manually send
- `generate_chronology_summary` — AI drafts project summary; stored as `review_status = unreviewed` until user approves

### Critical — human only
- Delete a project or bulk-delete events
- Any outbound send (email/message) — agent may draft, never send

## Named Tools (v1)
- `extract_event` — input: raw_text + project_id; output: event row + requirements[]
- `summarise_document` — input: pasted_content + bid_document_id; output: ai_summary
- `diff_documents` — input: doc_id_old + doc_id_new; output: requirement_changes[]

## Audit Log Fields
Every agent action writes to `audit_logs`: `action`, `target_table`, `target_id`, `detail` (before/after JSON), `user_id`, `created_at`.

## v1 vs Later
**v1:** extract_event, summarise_document, diff_documents.
**Later:** compose_vendor_query with send-gating, scheduled re-scan of open requirements.
