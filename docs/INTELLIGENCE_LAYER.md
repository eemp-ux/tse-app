# Intelligence Layer

## Messy Inputs
- Forwarded/pasted email threads (multi-party, mixed formatting)
- WhatsApp or Teams message pastes
- Pasted bid document text (clauses, tables, bullet specs)
- Manual free-text notes

## Extraction Schema (JSON returned by AI)
```json
{
  "event_date": "2024-11-05",
  "party_name": "Sandra Okafor",
  "direction": "inbound",
  "summary": "Customer requesting HVAC quote for floors 2-4, budget ~$180k.",
  "requirements": [
    { "title": "HVAC replacement floors 2-4", "description": "...", "priority": "high" }
  ],
  "confidence": 0.93
}
```

## Events to Track
- New event ingested (auto-extract triggered)
- New bid document version added (change-detection triggered)
- Requirement status changed by user
- AI summary approved or overridden

## Scoring Rules (v1 — rule-based)
- **Requirement priority** set by AI using keyword signals: "mandatory", "must", "critical" → high; "preferred", "if possible" → low.
- **Confidence** < 0.7 → UI shows yellow warning badge; user prompted to review.
- **Change significance:** `added` or `removed` requirements rank above `modified` in the change log.

## What Gets Ranked
- Requirements ordered by status (changed first, then open, then confirmed) within a project.
- Timeline events shown newest-first by default; filterable by party or event type.

## v1 vs Later
**v1:** Extraction on paste, change detection on new document version, confidence badges.
**Later:** Learning from user overrides to refine extraction prompts; named-entity recognition for dates and values; cross-project trend spotting.
