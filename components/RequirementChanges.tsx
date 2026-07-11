"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChangeTypeBadge, ReviewStatusBadge } from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/format";
import type { BidDocument, RequirementChange } from "@/lib/types";

function ApproveChangeButton({ change }: { change: RequirementChange }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (change.review_status !== "unreviewed") return null;

  async function approve() {
    setBusy(true);
    try {
      await fetch(`/api/requirement-changes/${change.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_status: "approved" }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={approve}
      disabled={busy}
      className="text-xs font-medium text-green-700 hover:underline disabled:opacity-50"
    >
      Approve
    </button>
  );
}

export function RequirementChanges({
  changes,
  documents,
}: {
  changes: RequirementChange[];
  documents: BidDocument[];
}) {
  if (changes.length === 0) {
    return <p className="text-sm text-neutral-500">No requirement changes detected yet.</p>;
  }

  const docById = new Map(documents.map((d) => [d.id, d]));
  const rank: Record<string, number> = { added: 0, removed: 0, modified: 1 };
  const sorted = [...changes].sort((a, b) => (rank[a.change_type] ?? 2) - (rank[b.change_type] ?? 2));

  return (
    <ul className="space-y-2">
      {sorted.map((change) => {
        const doc = change.bid_document_id ? docById.get(change.bid_document_id) : undefined;
        return (
          <li key={change.id} className="rounded-lg border border-neutral-200 bg-neutral-50/70 p-3 transition hover:border-neutral-300">
            <div className="flex items-start justify-between gap-3">
              <div className="text-xs text-neutral-500">
                {doc ? `${doc.title} v${doc.version}` : "Manual"} ·{" "}
                {formatDateTime(change.created_at)}
              </div>
              <ChangeTypeBadge type={change.change_type} />
            </div>
            <div className="mt-1 space-y-1 text-sm">
              {change.previous_value && (
                <p className="text-neutral-500 line-through decoration-neutral-300">
                  {change.previous_value}
                </p>
              )}
              {change.new_value && <p className="text-neutral-900">{change.new_value}</p>}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <ReviewStatusBadge status={change.review_status} />
              <ApproveChangeButton change={change} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
