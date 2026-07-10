import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import { AddPartyForm } from "@/components/AddPartyForm";
import { EventCard } from "@/components/EventCard";
import { CapturePanel } from "@/components/CapturePanel";
import { RequirementsList } from "@/components/RequirementsList";
import { BidDocuments } from "@/components/BidDocuments";
import { RequirementChanges } from "@/components/RequirementChanges";
import { statusLabel } from "@/lib/format";
import type {
  BidDocument,
  EventRow,
  Party,
  Project,
  Requirement,
  RequirementChange,
} from "@/lib/types";

async function loadProject(id: string) {
  const supabase = await createClient();

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
  ]);

  if (partiesError) throw new Error(partiesError.message);
  if (eventsError) throw new Error(eventsError.message);
  if (requirementsError) throw new Error(requirementsError.message);
  if (documentsError) throw new Error(documentsError.message);
  if (changesError) throw new Error(changesError.message);

  return {
    project: project as Project,
    parties: (parties ?? []) as Party[],
    events: (events ?? []) as EventRow[],
    requirements: (requirements ?? []) as Requirement[],
    documents: (documents ?? []) as BidDocument[],
    changes: (changes ?? []) as RequirementChange[],
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

  const { project, parties, events, requirements, documents, changes } = data;
  const partyById = new Map(parties.map((p) => [p.id, p]));

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-sm text-neutral-500">{project.customer_name}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>
        {project.description && (
          <p className="mt-3 max-w-2xl text-sm text-neutral-700">{project.description}</p>
        )}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-800">Parties</h2>
          <AddPartyForm projectId={project.id} />
        </div>
        {parties.length === 0 ? (
          <p className="text-sm text-neutral-500">No parties added yet.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {parties.map((party) => (
              <li
                key={party.id}
                className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
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

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-800">Log a Communication</h2>
        <CapturePanel projectId={project.id} parties={parties} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-800">Requirements</h2>
        <RequirementsList requirements={requirements} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-800">Bid Documents</h2>
        <BidDocuments projectId={project.id} documents={documents} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-800">Requirement Changes</h2>
        <RequirementChanges changes={changes} documents={documents} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-800">Timeline</h2>
        {events.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No events yet — paste a communication to get started.
          </p>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} party={partyById.get(event.party_id ?? "")} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
