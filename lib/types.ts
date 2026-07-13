export type ProjectStatus =
  | "prospecting"
  | "bid_received"
  | "requirements_confirmed"
  | "won"
  | "lost";

export type ReviewStatus = "unreviewed" | "approved" | "overridden";

export interface Project {
  id: string;
  user_id: string | null;
  name: string;
  customer_name: string;
  status: ProjectStatus;
  description: string | null;
  created_at: string;
}

export type PartyRole = "customer" | "vendor" | "internal";

export interface Party {
  id: string;
  project_id: string;
  name: string;
  role: PartyRole;
  organization: string | null;
  email: string | null;
  created_at: string;
}

export type EventType = "email" | "meeting" | "message" | "note" | "document";
export type EventDirection = "inbound" | "outbound" | "internal";

export interface EventRow {
  id: string;
  project_id: string;
  party_id: string | null;
  event_type: EventType;
  direction: EventDirection | null;
  event_date: string;
  raw_content: string | null;
  summary: string | null;
  summary_source: string | null;
  summary_confidence: number | null;
  summary_review_status: ReviewStatus | null;
  created_at: string;
}

export type RequirementStatus = "open" | "confirmed" | "changed" | "withdrawn";
export type RequirementPriority = "high" | "medium" | "low";
export type RequirementCategory = "commercial" | "technical";

export interface Requirement {
  id: string;
  project_id: string;
  source_event_id: string | null;
  title: string;
  description: string | null;
  status: RequirementStatus;
  priority: RequirementPriority | null;
  category: RequirementCategory;
  extracted_value: string | null;
  extracted_source: string | null;
  extracted_confidence: number | null;
  extracted_review_status: ReviewStatus | null;
  created_at: string;
}

export interface BidDocument {
  id: string;
  project_id: string;
  title: string;
  version: string;
  received_date: string | null;
  pasted_content: string | null;
  ai_summary: string | null;
  ai_summary_source: string | null;
  ai_summary_confidence: number | null;
  ai_summary_review_status: ReviewStatus | null;
  created_at: string;
}

export type ChangeType = "added" | "modified" | "removed";

export interface RequirementChange {
  id: string;
  project_id: string;
  requirement_id: string | null;
  bid_document_id: string | null;
  change_type: ChangeType;
  category: RequirementCategory;
  previous_value: string | null;
  new_value: string | null;
  detected_by: "ai" | "manual";
  review_status: ReviewStatus | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  project_id: string | null;
  action: string;
  target_table: string | null;
  target_id: string | null;
  detail: Record<string, unknown> | null;
  created_at: string;
}

export interface ProjectSummary {
  id: string;
  project_id: string;
  summary: string;
  review_status: ReviewStatus;
  created_at: string;
}
