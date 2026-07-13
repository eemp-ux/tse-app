"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteProjectButton({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = confirm(
      `Delete "${projectName}"? This permanently removes the project and all its parties, events, requirements, bid documents, and requirement changes. This cannot be undone.`,
    );
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to delete project.");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project.");
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-700">{error}</span>}
      <button
        onClick={handleDelete}
        disabled={busy}
        className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
      >
        {busy ? "Deleting…" : "Delete Project"}
      </button>
    </div>
  );
}
