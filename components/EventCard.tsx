import { ConfidenceBadge, ReviewStatusBadge } from "@/components/StatusBadge";
import { EventActions } from "@/components/EventActions";
import { formatDateTime, statusLabel } from "@/lib/format";
import type { EventRow, Party } from "@/lib/types";

export function EventCard({
  event,
  party,
  isOwner,
}: {
  event: EventRow;
  party: Party | undefined;
  isOwner: boolean;
}) {
  const body = event.summary ?? event.raw_content;
  const isAi = event.summary_source === "ai_extraction";

  return (
    <li className="rounded-lg border border-neutral-200 bg-neutral-50/70 p-4 transition hover:border-neutral-300">
      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
        <span className="font-medium text-neutral-700">{statusLabel(event.event_type)}</span>
        {event.direction && <span>· {statusLabel(event.direction)}</span>}
        <span>· {formatDateTime(event.event_date)}</span>
        {party && <span>· {party.name}{party.organization ? ` (${party.organization})` : ""}</span>}
      </div>
      <p className="mt-2 text-sm text-neutral-900">
        {body ?? <span className="italic text-neutral-400">No content</span>}
      </p>
      {isAi && !event.summary && (
        <p className="mt-1 text-xs italic text-neutral-400">
          AI extraction failed — content saved for manual review.
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {isAi && <ConfidenceBadge confidence={event.summary_confidence} />}
        {isAi && <ReviewStatusBadge status={event.summary_review_status} />}
      </div>
      {isOwner && <EventActions event={event} />}
    </li>
  );
}
