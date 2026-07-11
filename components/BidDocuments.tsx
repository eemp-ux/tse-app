"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfidenceBadge, ReviewStatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";
import type { BidDocument } from "@/lib/types";

function ApproveDocButton({ doc }: { doc: BidDocument }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (doc.ai_summary_review_status !== "unreviewed") return null;

  async function approve() {
    setBusy(true);
    try {
      await fetch(`/api/documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ai_summary_review_status: "approved" }),
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

export function BidDocuments({
  projectId,
  documents,
}: {
  projectId: string;
  documents: BidDocument[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and document content are required.");
      return;
    }
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/documents/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          title,
          version,
          received_date: receivedDate || undefined,
          pasted_content: content,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to add document.");
      if (data.warning) setNotice(data.warning);

      if (data.prior_document_id) {
        const diffRes = await fetch("/api/documents/diff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: projectId,
            old_document_id: data.prior_document_id,
            new_document_id: data.document.id,
          }),
        });
        const diffData = await diffRes.json().catch(() => ({}));
        if (diffRes.ok) {
          setNotice(
            `Detected ${diffData.changes?.length ?? 0} requirement change(s) vs. the prior version.`,
          );
        }
      }

      setTitle("");
      setVersion("");
      setReceivedDate("");
      setContent("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add document.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="text-sm font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
          >
            + Add Bid Document
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="space-y-2 rounded-md border border-neutral-200 p-3">
          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title *"
              className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm sm:col-span-2"
            />
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="Version (e.g. 1)"
              className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <input
            type="date"
            value={receivedDate}
            onChange={(e) => setReceivedDate(e.target.value)}
            className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Paste the RFQ / spec / bid document text…"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <p className="text-xs text-neutral-500">
            Tip: use the same title as an existing document to add a new version and trigger
            change detection.
          </p>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save Document"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {notice && <p className="text-sm text-amber-700">{notice}</p>}

      {documents.length === 0 ? (
        <p className="text-sm text-neutral-500">No bid documents added yet.</p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.id} className="rounded-lg border border-neutral-200 bg-neutral-50/70 p-3 transition hover:border-neutral-300">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {doc.title} <span className="text-neutral-400">· v{doc.version}</span>
                  </p>
                  <p className="text-xs text-neutral-500">
                    Received {formatDate(doc.received_date)}
                  </p>
                </div>
              </div>
              {doc.ai_summary && <p className="mt-1 text-sm text-neutral-700">{doc.ai_summary}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <ConfidenceBadge confidence={doc.ai_summary_confidence} />
                <ReviewStatusBadge status={doc.ai_summary_review_status} />
                <ApproveDocButton doc={doc} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
