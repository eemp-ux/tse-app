# PRD — tse-app: Project Prospecting Tracker

## Problem
Project pursuits span months of emails, site visits, bid documents, and vendor messages. Critical requirement changes get buried, context is lost between sessions, and there is no single place to see what happened, what changed, and when across all parties.

## Target User
A single builder / estimator managing 5–20 active pursuits, juggling a customer and 2–4 vendors per project.

## Core Objects
- **Project** — a pursuit with a customer, status, and timeline
- **Party** — customer contact or vendor attached to a project
- **Event** — any captured communication (email paste, meeting note, message)
- **Requirement** — a confirmed or emerging need extracted from events
- **Bid Document** — a versioned RFQ/spec with pasted text and AI summary
- **Requirement Change** — a detected delta between document versions or events

## MVP Must-Haves
- [ ] Create a project and add parties (customer + vendors)
- [ ] Paste raw email/message text → AI extracts date, party, summary, requirements
- [ ] Manually log an event with no AI
- [ ] Add a bid document (pasted text) → AI summarises requirements
- [ ] Add a new document revision → AI detects changed/added/removed requirements
- [ ] View a full chronological timeline per project
- [ ] View all requirements per project with status (open / confirmed / changed)
- [ ] All screens demoable without login (seed data visible on load)

## Non-Goals (v1)
- File upload / PDF parsing
- Email forwarding ingestion address
- Multi-user teams / shared access
- Export to PDF/Word
- Mobile app

## Definition of Done
**Success scenario:** User creates a new project, pastes an inbound customer email, sees AI-extracted summary and requirements appear in the timeline, adds a bid document revision, sees a requirement-change entry auto-generated, and views the full chronology — all data persists after a page refresh and matches what was submitted.
