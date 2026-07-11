"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventRow } from "@/lib/types";

export function EventActions({ event }: { event: EventRow }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const editField = event.summary !== null ? "summary" : "raw_content";
  const [text, setText] = useState(event.summary ?? event.raw_content ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary_review_status: "approved" }),
      });
      if (!res.ok) throw new Error("Failed to approve.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveEdit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [editField]: text }),
      });
      if (!res.ok) throw new Error("Failed to save.");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <div className="mt-2 space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        {error && <p className="text-xs text-red-700">{error}</p>}
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
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3">
      {event.summary_source === "ai_extraction" && event.summary_review_status === "unreviewed" && (
        <button
          onClick={handleApprove}
          disabled={busy}
          className="text-xs font-medium text-green-700 hover:underline disabled:opacity-50"
        >
          Approve
        </button>
      )}
      <button
        onClick={() => setEditing(true)}
        className="text-xs font-medium text-neutral-600 hover:underline"
      >
        Edit
      </button>
      <button
        onClick={handleDelete}
        disabled={busy}
        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
      >
        Delete
      </button>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}
