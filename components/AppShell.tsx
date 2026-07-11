"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar, type SidebarProject } from "@/components/Sidebar";
import { UserMenu } from "@/components/UserMenu";

const STORAGE_KEY = "tse-sidebar-collapsed";

export function AppShell({
  projects,
  userEmail,
  children,
}: {
  projects: SidebarProject[];
  userEmail: string | null;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setCollapsed(true);
    setHydrated(true);
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-50">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4">
        <button
          onClick={toggle}
          aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
          className="rounded-md p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M2.5 4.5h13M2.5 9h13M2.5 13.5h13"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
            T
          </span>
          <span className="text-sm font-semibold tracking-tight text-neutral-900">
            TSE Tracker
          </span>
        </Link>
        <div className="ml-auto">
          <UserMenu userEmail={userEmail} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar projects={projects} collapsed={hydrated ? collapsed : false} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
