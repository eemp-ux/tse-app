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

export function RequirementRow({ requirement }: { requirement: Requirement }) {
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
    <li className="rounded-md border border-neutral-200 bg-white p-3">
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
        {isAi && requirement.extracted_review_status === "unreviewed" && (
          <button
            onClick={approve}
            disabled={busy}
            className="text-xs font-medium text-green-700 hover:underline disabled:opacity-50"
          >
            Approve
          </button>
        )}
        <select
          value={requirement.status}
          disabled={busy}
          onChange={(e) => updateStatus(e.target.value)}
          className="rounded border border-neutral-300 px-1.5 py-0.5 text-xs"
        >
          <option value="open">Open</option>
          <option value="confirmed">Confirmed</option>
          <option value="changed">Changed</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>
    </li>
  );
}
