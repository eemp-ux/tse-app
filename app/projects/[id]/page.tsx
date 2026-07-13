import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import { AddPartyForm } from "@/components/AddPartyForm";
import { EventCard } from "@/components/EventCard";
import { CapturePanel } from "@/components/CapturePanel";
import { RequirementsList } from "@/components/RequirementsList";
import { BidDocuments } from "@/components/BidDocuments";
import { RequirementChanges } from "@/components/RequirementChanges";
import { ProjectSummaryPanel } from "@/components/ProjectSummaryPanel";
import { BackButton } from "@/components/BackButton";
import { DeleteProjectButton } from "@/components/DeleteProjectButton";
import { statusLabel } from "@/lib/format";
import type {
  BidDocument,
  EventRow,
  Party,
  Project,
  ProjectSummary,
  Requirement,
  RequirementChange,
} from "@/lib/types";

async function loadProject(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (projectError) throw new Error(projectError.message);
  if (!project) return null;

  const [
    { data: parties, error: partiesError },
    { data: events, error: eventsError },
    { data: requirements, error: requirementsError },
    { data: documents, error: documentsError },
    { data: changes, error: changesError },
    { data: summaries, error: summariesError },
  ] = await Promise.all([
    supabase.from("parties").select("*").eq("project_id", id).order("created_at"),
    supabase
      .from("events")
      .select("*")
      .eq("project_id", id)
      .order("event_date", { ascending: false }),
    supabase.from("requirements").select("*").eq("project_id", id).order("created_at"),
    supabase
      .from("bid_documents")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("requirement_changes")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("project_summaries")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  if (partiesError) throw new Error(partiesError.message);
  if (eventsError) throw new Error(eventsError.message);
  if (requirementsError) throw new Error(requirementsError.message);
  if (documentsError) throw new Error(documentsError.message);
  if (changesError) throw new Error(changesError.message);
  if (summariesError) throw new Error(summariesError.message);

  return {
    project: project as Project,
    parties: (parties ?? []) as Party[],
    events: (events ?? []) as EventRow[],
    requirements: (requirements ?? []) as Requirement[],
    documents: (documents ?? []) as BidDocument[],
    changes: (changes ?? []) as RequirementChange[],
    latestSummary: (summaries?.[0] ?? null) as ProjectSummary | null,
    isOwner: !!user && project.user_id === user.id,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadProject(id);

  if (!data) notFound();

  const { project, parties, events, requirements, documents, changes, latestSummary, isOwner } =
    data;
  const partyById = new Map(parties.map((p) => [p.id, p]));

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <BackButton label="All Projects" fallbackHref="/" />
          {isOwner && (
            <DeleteProjectButton projectId={project.id} projectName={project.name} />
          )}
        </div>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{project.name}</h1>
            <p className="text-sm text-neutral-500">{project.customer_name}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>
        {project.description && (
          <p className="mt-3 max-w-2xl text-sm text-neutral-700">{project.description}</p>
        )}
        <Link
          href={`/projects/${project.id}/chronology`}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          View full chronology
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M6 3.5 10.5 8 6 12.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      {!isOwner && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This is a read-only demo project.{" "}
          <Link href="/signup" className="font-medium underline underline-offset-2">
            Sign up
          </Link>{" "}
          to create and edit your own.
        </div>
      )}

      <ProjectSummaryPanel projectId={project.id} latestSummary={latestSummary} isOwner={isOwner} />

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-800">Parties</h2>
          {isOwner && <AddPartyForm projectId={project.id} />}
        </div>
        {parties.length === 0 ? (
          <p className="text-sm text-neutral-500">No parties added yet.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {parties.map((party) => (
              <li
                key={party.id}
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
              >
                <div className="font-medium text-neutral-900">{party.name}</div>
                <div className="text-xs text-neutral-500">
                  {statusLabel(party.role)}
                  {party.organization ? ` · ${party.organization}` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isOwner && (
        <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-neutral-800">Log a Communication</h2>
          <CapturePanel projectId={project.id} parties={parties} />
        </section>
      )}

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-800">Requirements</h2>
        <RequirementsList requirements={requirements} isOwner={isOwner} />
      </section>

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-800">Bid Documents</h2>
        <BidDocuments projectId={project.id} documents={documents} isOwner={isOwner} />
      </section>

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-800">Requirement Changes</h2>
        <RequirementChanges changes={changes} documents={documents} isOwner={isOwner} />
      </section>

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-800">Timeline</h2>
        {events.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No events yet — paste a communication to get started.
          </p>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                party={partyById.get(event.party_id ?? "")}
                isOwner={isOwner}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
