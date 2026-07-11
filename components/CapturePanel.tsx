"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Party } from "@/lib/types";

const EVENT_TYPES = ["email", "meeting", "message", "note", "document"];
const DIRECTIONS = ["inbound", "outbound", "internal"];

export function CapturePanel({
  projectId,
  parties,
}: {
  projectId: string;
  parties: Party[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [content, setContent] = useState("");
  const [eventType, setEventType] = useState("email");
  const [direction, setDirection] = useState("inbound");
  const [partyId, setPartyId] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("Content cannot be empty.");
      return;
    }
    setError(null);
    setWarning(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/events/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          mode,
          raw_content: content,
          event_type: eventType,
          party_id: partyId || null,
          ...(mode === "manual" ? { direction, event_date: eventDate || undefined } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to save event.");
      if (data.warning) setWarning(data.warning);
      setContent("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode("ai")}
          className={`rounded-md px-3 py-1 text-sm font-medium ${
            mode === "ai" ? "bg-indigo-600 text-white" : "bg-neutral-100 text-neutral-600"
          }`}
        >
          Paste &amp; Extract (AI)
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`rounded-md px-3 py-1 text-sm font-medium ${
            mode === "manual" ? "bg-indigo-600 text-white" : "bg-neutral-100 text-neutral-600"
          }`}
        >
          Log Manually
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <p className="text-sm text-red-700">{error}</p>}
        {warning && <p className="text-sm text-amber-700">{warning}</p>}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder={
            mode === "ai"
              ? "Paste an email, meeting note, or message thread…"
              : "What happened?"
          }
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />

        <div className="grid gap-2 sm:grid-cols-3">
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t[0].toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
            className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">No party</option>
            {parties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {mode === "manual" && (
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {DIRECTIONS.map((d) => (
                <option key={d} value={d}>
                  {d[0].toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          )}
        </div>

        {mode === "manual" && (
          <input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Saving…" : mode === "ai" ? "Extract & Save" : "Save Event"}
        </button>
      </form>
    </div>
  );
}
