"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewStatusBadge } from "@/components/StatusBadge";
import type { ProjectSummary } from "@/lib/types";

export function ProjectSummaryPanel({
  projectId,
  latestSummary,
  isOwner,
}: {
  projectId: string;
  latestSummary: ProjectSummary | null;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(latestSummary?.summary ?? "");

  async function handleGenerate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/summary`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to generate summary.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate summary.");
    } finally {
      setBusy(false);
    }
  }

  async function handleApprove() {
    if (!latestSummary) return;
    setBusy(true);
    try {
      await fetch(`/api/summaries/${latestSummary.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_status: "approved" }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveEdit() {
    if (!latestSummary) return;
    setBusy(true);
    try {
      await fetch(`/api/summaries/${latestSummary.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: text, review_status: "overridden" }),
      });
      setEditing(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!latestSummary) {
    if (!isOwner) return null;
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-5 shadow-sm">
        <p className="text-sm text-neutral-500">No project summary yet.</p>
        {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
        <button
          onClick={handleGenerate}
          disabled={busy}
          className="mt-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy ? "Generating…" : "Generate Summary"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-800">Project Summary</h2>
        <ReviewStatusBadge status={latestSummary.review_status} />
      </div>
      {isOwner && editing ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={busy}
              className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-md px-3 py-1 text-xs text-neutral-500 hover:text-neutral-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-neutral-800">{latestSummary.summary}</p>
          {isOwner && (
            <div className="mt-2 flex flex-wrap gap-3">
              {latestSummary.review_status === "unreviewed" && (
                <button
                  onClick={handleApprove}
                  disabled={busy}
                  className="text-xs font-medium text-green-700 hover:underline disabled:opacity-50"
                >
                  Approve
                </button>
              )}
              <button
                onClick={() => {
                  setText(latestSummary.summary);
                  setEditing(true);
                }}
                className="text-xs font-medium text-neutral-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={handleGenerate}
                disabled={busy}
                className="text-xs font-medium text-neutral-600 hover:underline disabled:opacity-50"
              >
                {busy ? "Regenerating…" : "Regenerate"}
              </button>
            </div>
          )}
        </>
      )}
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}
