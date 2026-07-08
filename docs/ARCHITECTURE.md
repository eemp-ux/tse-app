# Architecture

## Stack
- **Frontend:** Next.js 14 (App Router) — Vercel
- **Database + Auth:** Supabase (Postgres + RLS + Auth)
- **AI:** OpenAI API (server-side route handler only — key never in client)
- **Styling:** Tailwind CSS

## What Is Built Now vs Later
**Now:** project CRUD, party management, event capture with AI extraction, requirements list, bid document ingestion, requirement change detection, chronology timeline — all without login.
**Later:** login + per-user RLS, file upload, PDF parsing, email ingestion webhook, export.

## Key User Action — Step by Step
1. User opens a project page and pastes raw email text into the capture panel.
2. Browser POSTs raw text to `/api/events/ingest` (server route).
3. Server calls OpenAI with a structured extraction prompt; receives JSON (party, date, summary, requirements[], confidence).
4. Server writes one `events` row and one or more `requirements` rows to Supabase, storing AI fields with source, confidence, and `review_status = 'unreviewed'`.
5. Server returns the new event; UI appends it to the timeline without a full reload.
6. User reviews AI-extracted fields inline; can approve, edit, or override.

## Layer Order
1. **Data layer first** — tables, constraints, RLS policies, seed data.
2. **App logic** — CRUD routes, forms, timeline rendering, all working without AI.
3. **AI on top** — extraction and change detection layered in; if the API is down, the manual-input path still works.

## Why Core Runs Without AI
Every event, requirement, and document can be entered manually. AI fields are nullable. The timeline and requirements list are pure database reads.
