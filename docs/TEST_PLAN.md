# Test Plan

## End-to-End Success Scenario (manual)
1. Open `/` — confirm 3 seed projects visible, no login required.
2. Click "Westfield HVAC Upgrade" — confirm timeline shows at least 2 events.
3. Click "New Project" → enter name "Test Project", customer "Test Corp" → submit → confirm row appears in project list → refresh → still there.
4. Open Test Project → paste a sample email into the capture panel, select party "Manual Test User", type = email, direction = inbound → submit.
5. Confirm: new event appears in timeline with AI-generated summary. Confirm at least one requirement appears in requirements list.
6. Check confidence badge: if < 0.7 a yellow badge is visible.
7. Approve the AI summary inline → badge changes to "approved".
8. Add a Bid Document (paste 3 bullet requirements) → confirm AI summary stored.
9. Add a second version of same document (change one bullet, add one new) → confirm requirement_changes shows 1 modified + 1 added.
10. Open Chronology view → filter by "customer" party → confirm only customer events shown.
11. Generate project summary → confirm draft stored with `review_status = unreviewed` → approve it → confirm it appears pinned on project page.
12. Refresh all pages — confirm all data matches what was submitted (no localStorage-only state).

## Empty State Tests
- New project with no events: timeline shows "No events yet — paste a communication to get started."
- Project with no bid documents: bid section shows "No bid documents added yet."
- Requirements list with no requirements: shows "No requirements extracted yet."

## Error State Tests
- Submit capture panel with empty textarea → inline validation error, no API call made.
- Simulate OpenAI API failure (wrong key in dev env) → event saved with raw_content, summary = null, `review_status = unreviewed`; user sees "AI extraction failed — content saved for manual review."
- Submit new project with blank name → form validation blocks submit.

## Regression Checks (after Sprint 5 lock-down)
- Log in as User A, create project. Log out. Log in as User B. Confirm User A's project is absent.
- Confirm seed demo project is readable by unauthenticated visitor at `/demo`.
- Inspect browser network tab — confirm no `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` in any response.
