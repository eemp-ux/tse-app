# Data Model

## projects
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable until lock-down |
| name | text | project title |
| customer_name | text | |
| status | text | prospecting / bid_received / requirements_confirmed / won / lost |
| description | text | |
| created_at | timestamptz | |

## parties
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK → projects | |
| name | text | |
| role | text | customer / vendor / internal |
| organization | text | |
| email | text | |

## events
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK → projects | |
| party_id | uuid FK → parties | nullable |
| event_type | text | email / meeting / message / note / document |
| direction | text | inbound / outbound / internal |
| event_date | timestamptz | |
| raw_content | text | original pasted text |
| summary | text | **AI field** |
| summary_source | text | e.g. `ai_extraction` / `manual` |
| summary_confidence | numeric | 0–1 |
| summary_review_status | text | unreviewed / approved / overridden |

## requirements
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK → projects | |
| source_event_id | uuid FK → events | nullable |
| title | text | |
| description | text | |
| status | text | open / confirmed / changed / withdrawn |
| priority | text | high / medium / low |
| extracted_value | text | **AI field** — raw extracted phrase |
| extracted_source | text | |
| extracted_confidence | numeric | |
| extracted_review_status | text | unreviewed / approved / overridden |

## bid_documents
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK → projects | |
| title | text | |
| version | text | |
| received_date | timestamptz | |
| pasted_content | text | |
| ai_summary | text | **AI field** |
| ai_summary_source | text | |
| ai_summary_confidence | numeric | |
| ai_summary_review_status | text | unreviewed / approved / overridden |

## requirement_changes
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK → projects | |
| requirement_id | uuid FK → requirements | nullable |
| bid_document_id | uuid FK → bid_documents | nullable |
| change_type | text | added / modified / removed |
| previous_value | text | |
| new_value | text | |
| detected_by | text | ai / manual |
| review_status | text | unreviewed / approved / overridden |

## audit_logs
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable until lock-down |
| project_id | uuid | |
| action | text | e.g. `event.created`, `requirement.status_changed` |
| target_table | text | |
| target_id | uuid | |
| detail | jsonb | before/after snapshot |

**RLS:** All tables have permissive v1 policies (select/all using true). Lock-down sprint replaces these with `auth.uid() = user_id`.
