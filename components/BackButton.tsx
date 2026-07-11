"use client";

import { useRouter } from "next/navigation";

export function BackButton({
  label = "Back",
  fallbackHref = "/",
}: {
  label?: string;
  fallbackHref?: string;
}) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M10 12.5 5.5 8 10 3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </button>
  );
}
