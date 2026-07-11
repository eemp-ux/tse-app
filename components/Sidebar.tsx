"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { statusLabel } from "@/lib/format";

const STATUS_DOT: Record<string, string> = {
  prospecting: "bg-neutral-400",
  bid_received: "bg-blue-500",
  requirements_confirmed: "bg-purple-500",
  won: "bg-green-500",
  lost: "bg-red-500",
};

export interface SidebarProject {
  id: string;
  name: string;
  status: string;
}

export function Sidebar({
  projects,
  collapsed,
}: {
  projects: SidebarProject[];
  collapsed: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`shrink-0 overflow-hidden border-r border-neutral-200 bg-white transition-[width] duration-200 ease-in-out ${
        collapsed ? "w-0" : "w-64"
      }`}
    >
      <nav className="flex h-full w-64 flex-col overflow-y-auto py-4">
        <Link
          href="/"
          className={`mx-3 mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
            pathname === "/"
              ? "bg-indigo-50 text-indigo-700"
              : "text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M2 7.5 8 2l6 5.5M3.5 6.5V14h9V6.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          All Projects
        </Link>

        <div className="mx-3 mt-4 mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Projects
        </div>
        <ul className="flex-1 space-y-0.5 px-3">
          {projects.map((project) => {
            const href = `/projects/${project.id}`;
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={project.id}>
                <Link
                  href={href}
                  title={project.name}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-indigo-50 font-medium text-indigo-700"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[project.status] ?? "bg-neutral-300"}`}
                    title={statusLabel(project.status)}
                  />
                  <span className="truncate">{project.name}</span>
                </Link>
              </li>
            );
          })}
          {projects.length === 0 && (
            <li className="px-3 py-2 text-xs text-neutral-400">No projects yet.</li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
