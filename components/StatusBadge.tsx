import { statusLabel } from "@/lib/format";

const PROJECT_STATUS_STYLES: Record<string, string> = {
  prospecting: "bg-neutral-100 text-neutral-700",
  bid_received: "bg-blue-100 text-blue-700",
  requirements_confirmed: "bg-purple-100 text-purple-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const REQUIREMENT_STATUS_STYLES: Record<string, string> = {
  open: "bg-neutral-100 text-neutral-700",
  confirmed: "bg-green-100 text-green-700",
  changed: "bg-amber-100 text-amber-800",
  withdrawn: "bg-red-100 text-red-700",
};

const CHANGE_TYPE_STYLES: Record<string, string> = {
  added: "bg-green-100 text-green-700",
  modified: "bg-amber-100 text-amber-800",
  removed: "bg-red-100 text-red-700",
};

const REVIEW_STATUS_STYLES: Record<string, string> = {
  unreviewed: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-700",
  overridden: "bg-neutral-200 text-neutral-700",
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      label={statusLabel(status)}
      className={PROJECT_STATUS_STYLES[status] ?? "bg-neutral-100 text-neutral-700"}
    />
  );
}

export function RequirementStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      label={statusLabel(status)}
      className={REQUIREMENT_STATUS_STYLES[status] ?? "bg-neutral-100 text-neutral-700"}
    />
  );
}

export function ChangeTypeBadge({ type }: { type: string }) {
  return (
    <Badge
      label={statusLabel(type)}
      className={CHANGE_TYPE_STYLES[type] ?? "bg-neutral-100 text-neutral-700"}
    />
  );
}

export function ReviewStatusBadge({ status }: { status: string | null }) {
  if (!status) return null;
  return (
    <Badge
      label={statusLabel(status)}
      className={REVIEW_STATUS_STYLES[status] ?? "bg-neutral-100 text-neutral-700"}
    />
  );
}

export function ConfidenceBadge({ confidence }: { confidence: number | null }) {
  if (confidence === null || confidence === undefined) return null;
  const low = confidence < 0.7;
  return (
    <Badge
      label={`${Math.round(confidence * 100)}% confidence`}
      className={low ? "bg-yellow-100 text-yellow-800" : "bg-neutral-100 text-neutral-600"}
    />
  );
}

export function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return null;
  const styles: Record<string, string> = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-neutral-100 text-neutral-600",
  };
  return <Badge label={statusLabel(priority)} className={styles[priority] ?? "bg-neutral-100 text-neutral-600"} />;
}
