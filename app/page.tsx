import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NewProjectForm } from "@/components/NewProjectForm";
import { StatusBadge } from "@/components/StatusBadge";
import { ErrorBanner } from "@/components/ErrorBanner";
import { formatDate, daysSince } from "@/lib/format";
import type { Project } from "@/lib/types";

async function loadProjects() {
  const supabase = await createClient();

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (projectsError) throw new Error(projectsError.message);

  const { data: events } = await supabase
    .from("events")
    .select("project_id, event_date");

  const { data: requirements } = await supabase
    .from("requirements")
    .select("project_id, status");

  const lastEventByProject = new Map<string, string>();
  for (const e of events ?? []) {
    const current = lastEventByProject.get(e.project_id);
    if (!current || new Date(e.event_date) > new Date(current)) {
      lastEventByProject.set(e.project_id, e.event_date);
    }
  }

  const openReqsByProject = new Map<string, number>();
  for (const r of requirements ?? []) {
    if (r.status === "open" || r.status === "changed") {
      openReqsByProject.set(r.project_id, (openReqsByProject.get(r.project_id) ?? 0) + 1);
    }
  }

  return {
    projects: (projects ?? []) as Project[],
    lastEventByProject,
    openReqsByProject,
  };
}

export default async function HomePage() {
  let data: Awaited<ReturnType<typeof loadProjects>> | null = null;
  let loadError: string | null = null;

  try {
    data = await loadProjects();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load projects.";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-neutral-500">
            Pursuits, communications, and requirement changes in one place.
          </p>
        </div>
      </div>

      <NewProjectForm />

      {loadError && <ErrorBanner message={loadError} />}

      {data && data.projects.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
          No projects yet — create one above to get started.
        </div>
      )}

      {data && data.projects.length > 0 && (
        <ul className="space-y-3">
          {data.projects.map((project) => {
            const lastEvent = data!.lastEventByProject.get(project.id) ?? null;
            const openReqs = data!.openReqsByProject.get(project.id) ?? 0;
            const since = daysSince(lastEvent);
            return (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.id}`}
                  className="group block rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-neutral-900 group-hover:text-indigo-700">
                        {project.name}
                      </h2>
                      <p className="text-sm text-neutral-500">{project.customer_name}</p>
                      {project.description && (
                        <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="mt-4 flex gap-4 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
                    <span>
                      Last activity:{" "}
                      {lastEvent
                        ? `${formatDate(lastEvent)} (${since}d ago)`
                        : "No events yet"}
                    </span>
                    <span>{openReqs} open requirement{openReqs === 1 ? "" : "s"}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
