"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChangeTypeBadge, CategoryBadge, ReviewStatusBadge } from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/format";
import type { BidDocument, RequirementCategory, RequirementChange } from "@/lib/types";

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

function CategorySelect({ change }: { change: RequirementChange }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function updateCategory(category: string) {
    setBusy(true);
    try {
      await fetch(`/api/requirement-changes/${change.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <select
      value={change.category}
      disabled={busy}
      onChange={(e) => updateCategory(e.target.value)}
      title="Category"
      className="rounded border border-neutral-300 px-1.5 py-0.5 text-xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
    >
      <option value="commercial">Commercial</option>
      <option value="technical">Technical</option>
    </select>
  );
}

function ChangeItem({
  change,
  doc,
  isOwner,
}: {
  change: RequirementChange;
  doc: BidDocument | undefined;
  isOwner: boolean;
}) {
  return (
    <li className="rounded-lg border border-neutral-200 bg-neutral-50/70 p-3 transition hover:border-neutral-300">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs text-neutral-500">
          {doc ? `${doc.title} v${doc.version}` : "Manual"} · {formatDateTime(change.created_at)}
        </div>
        <div className="flex flex-shrink-0 gap-1.5">
          <CategoryBadge category={change.category} />
          <ChangeTypeBadge type={change.change_type} />
        </div>
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
        {isOwner && <ApproveChangeButton change={change} />}
        {isOwner && <CategorySelect change={change} />}
      </div>
    </li>
  );
}

function Group({
  title,
  items,
  docById,
  isOwner,
}: {
  title: string;
  items: RequirementChange[];
  docById: Map<string, BidDocument>;
  isOwner: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
        {title} <span className="text-neutral-300">({items.length})</span>
      </h3>
      <ul className="space-y-2">
        {items.map((change) => (
          <ChangeItem
            key={change.id}
            change={change}
            doc={change.bid_document_id ? docById.get(change.bid_document_id) : undefined}
            isOwner={isOwner}
          />
        ))}
      </ul>
    </div>
  );
}

export function RequirementChanges({
  changes,
  documents,
  isOwner,
}: {
  changes: RequirementChange[];
  documents: BidDocument[];
  isOwner: boolean;
}) {
  if (changes.length === 0) {
    return <p className="text-sm text-neutral-500">No requirement changes detected yet.</p>;
  }

  const docById = new Map(documents.map((d) => [d.id, d]));
  const rank: Record<string, number> = { added: 0, removed: 0, modified: 1 };
  const sortByType = (items: RequirementChange[]) =>
    [...items].sort((a, b) => (rank[a.change_type] ?? 2) - (rank[b.change_type] ?? 2));

  const byCategory = (category: RequirementCategory) =>
    sortByType(changes.filter((c) => c.category === category));

  return (
    <div className="space-y-5">
      <Group title="Commercial" items={byCategory("commercial")} docById={docById} isOwner={isOwner} />
      <Group title="Technical" items={byCategory("technical")} docById={docById} isOwner={isOwner} />
    </div>
  );
}
