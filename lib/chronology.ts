import type { BidDocument, EventRow, Party, RequirementChange } from "@/lib/types";

export type ChronologyKind = "event" | "document" | "change";

export interface ChronologyItem {
  id: string;
  date: string;
  kind: ChronologyKind;
  eventType?: string;
  partyRole?: string;
  partyName?: string;
  title: string;
  detail: string | null;
}

export function buildChronology(
  events: EventRow[],
  parties: Party[],
  documents: BidDocument[],
  changes: RequirementChange[],
): ChronologyItem[] {
  const partyById = new Map(parties.map((p) => [p.id, p]));

  const items: ChronologyItem[] = [];

  for (const e of events) {
    const party = e.party_id ? partyById.get(e.party_id) : undefined;
    items.push({
      id: `event-${e.id}`,
      date: e.event_date,
      kind: "event",
      eventType: e.event_type,
      partyRole: party?.role,
      partyName: party?.name,
      title: `${e.event_type[0].toUpperCase()}${e.event_type.slice(1)}${party ? ` · ${party.name}` : ""}`,
      detail: e.summary ?? e.raw_content,
    });
  }

  for (const d of documents) {
    items.push({
      id: `document-${d.id}`,
      date: d.created_at,
      kind: "document",
      title: `Bid document added: ${d.title} v${d.version}`,
      detail: d.ai_summary,
    });
  }

  for (const c of changes) {
    items.push({
      id: `change-${c.id}`,
      date: c.created_at,
      kind: "change",
      title: `Requirement ${c.change_type}`,
      detail: [c.previous_value, c.new_value].filter(Boolean).join(" → ") || null,
    });
  }

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
