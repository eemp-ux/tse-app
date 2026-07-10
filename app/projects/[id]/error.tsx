"use client";

import { ErrorBanner } from "@/components/ErrorBanner";

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-3">
      <ErrorBanner message={error.message || "Failed to load this project."} />
      <button
        onClick={reset}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100"
      >
        Try again
      </button>
    </div>
  );
}
