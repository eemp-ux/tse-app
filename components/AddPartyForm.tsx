"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddPartyForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("customer");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/parties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, organization, email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to add party.");
      }
      setName("");
      setOrganization("");
      setEmail("");
      setRole("customer");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add party.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
      >
        + Add Party
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-md border border-neutral-200 p-3">
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name *"
          className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="internal">Internal</option>
        </select>
        <input
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="Organization"
          className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add"}
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
  );
}
