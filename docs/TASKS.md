# Tasks & Sprints

## Sprint 1 — Database, seed data, project list + timeline view
**Goal:** App renders real seed data without login. Core navigation works.
- [ ] Run migration SQL on Supabase (all tables + seed rows)
- [ ] Project list page: shows all projects, status badge, last-event date
- [ ] Project detail page: chronological event timeline from DB
- [ ] All five UI states on both pages: loading skeleton, empty state, partial data, error banner, ready
- [ ] New Project form → persists to `projects` table → appears in list immediately
- [ ] Add Party form on project detail → persists to `parties`

**Definition of Done:** Visiting `/` shows 3 seed projects. Clicking a project shows its timeline. Creating a new project from the form and refreshing still shows it.

---

## Sprint 2 — Core engine: paste communication → AI extract → timeline ✦ v1 core
**Goal:** The one core action works end-to-end.
- [ ] Capture panel on project detail: textarea + party selector + event type + submit
- [ ] POST `/api/events/ingest` → OpenAI extraction → write `events` + `requirements` rows
- [ ] Extracted summary + requirements appear in timeline and requirements list immediately
- [ ] Confidence < 0.7 shows yellow review badge; user can approve or edit inline
- [ ] Manual event form (no AI): all fields entered by hand, same DB write path
- [ ] Edit and delete any event (with audit log entry)
- [ ] Error state: if OpenAI fails, fall back to saving raw_content with `summary_review_status = 'unreviewed'`

**Definition of Done:** Paste a raw email, submit, see AI summary + at least one requirement in the timeline. Refresh — data persists. Disable OpenAI key — manual form still saves correctly.

---

## Sprint 3 — Bid documents, revisions, requirement change detection
**Goal:** Document lifecycle tracked with automatic change detection.
- [ ] Bid Documents section on project detail: list of versions
- [ ] Add Bid Document form: title, version, received date, paste content → POST `/api/documents/ingest`
- [ ] AI summarises requirements from pasted text → stored with `review_status = unreviewed`
- [ ] Add new version of same document → POST `/api/documents/diff` → writes `requirement_changes` rows
- [ ] Requirement Changes panel shows added / modified / removed with before/after text
- [ ] Requirements list updated: changed requirements flagged in status

**Definition of Done:** Add doc v1, then v2 with one new requirement and one modified clause. Change log shows exactly those two entries. Requirements list reflects updated statuses.

---

## Sprint 4 — Chronology summary view + project dashboard ✦ v1 functional milestone
**Goal:** Full overview is readable and shareable. End-to-end success scenario complete.
- [ ] Chronology page per project: unified timeline of events + document versions + requirement changes, filterable by party / type / date range
- [ ] POST `/api/projects/:id/summary` → AI drafts project summary (what happened, what changed, open items) → stored with `review_status = unreviewed`
- [ ] User approves or edits summary; approved summary pinned to top of project page
- [ ] Project list dashboard: status, open requirement count, last activity date, days since last event
- [ ] Empty states for projects with no events yet

**Definition of Done:** Full end-to-end scenario — create project, ingest email, add bid document v1 + v2, see change log, generate and approve summary, view chronology filtered by customer party — all data correct after page refresh.

---

## Sprint 5 — Lock it down (auth + per-user data isolation)
**Goal:** Real users can sign up; their data is private.
- [ ] Supabase Auth: email/password sign-up and login pages
- [ ] Replace all `_v1_read` / `_v1_write` RLS policies with `auth.uid() = user_id` owner-scoped policies
- [ ] On project/event/document create: set `user_id = auth.uid()`
- [ ] Unauthenticated visitors see a demo-only landing page with read-only seed project
- [ ] Authenticated users see only their own projects
- [ ] Audit logs record `user_id` for every write
- [ ] Confirm: no API route returns another user's data (manual test with two accounts)

**Definition of Done:** Two test accounts created. Account A's projects invisible to Account B. Seed demo row visible to unauthenticated visitor. No secrets in browser network tab.

---

## Gantt (sprint → feature)
```
Sprint 1  |--DB + seed + project list + timeline render
Sprint 2      |--Capture panel + AI extract + manual form  [core engine]
Sprint 3             |--Bid docs + revisions + change detection
Sprint 4                    |--Chronology + summary + dashboard  [v1 functional]
Sprint 5                           |--Auth + RLS lock-down
```
