"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RequirementStatusBadge,
  PriorityBadge,
  ConfidenceBadge,
  ReviewStatusBadge,
} from "@/components/StatusBadge";
import type { Requirement } from "@/lib/types";

export function RequirementRow({
  requirement,
  isOwner,
}: {
  requirement: Requirement;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function updateStatus(status: string) {
    setBusy(true);
    try {
      await fetch(`/api/requirements/${requirement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function approve() {
    setBusy(true);
    try {
      await fetch(`/api/requirements/${requirement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extracted_review_status: "approved", status: "confirmed" }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const isAi = requirement.extracted_source === "ai_extraction";

  return (
    <li className="rounded-lg border border-neutral-200 bg-neutral-50/70 p-3 transition hover:border-neutral-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-900">{requirement.title}</p>
          {requirement.description && (
            <p className="mt-0.5 text-xs text-neutral-600">{requirement.description}</p>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-wrap justify-end gap-1.5">
          <RequirementStatusBadge status={requirement.status} />
          <PriorityBadge priority={requirement.priority} />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {isAi && <ConfidenceBadge confidence={requirement.extracted_confidence} />}
        {isAi && <ReviewStatusBadge status={requirement.extracted_review_status} />}
        {isOwner && isAi && requirement.extracted_review_status === "unreviewed" && (
          <button
            onClick={approve}
            disabled={busy}
            className="text-xs font-medium text-green-700 hover:underline disabled:opacity-50"
          >
            Approve
          </button>
        )}
        {isOwner && (
          <select
            value={requirement.status}
            disabled={busy}
            onChange={(e) => updateStatus(e.target.value)}
            className="rounded border border-neutral-300 px-1.5 py-0.5 text-xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="open">Open</option>
            <option value="confirmed">Confirmed</option>
            <option value="changed">Changed</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        )}
      </div>
    </li>
  );
}
