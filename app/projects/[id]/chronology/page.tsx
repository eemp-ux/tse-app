import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChronologyView } from "@/components/ChronologyView";
import { BackButton } from "@/components/BackButton";
import { buildChronology } from "@/lib/chronology";
import type { BidDocument, EventRow, Party, Project, RequirementChange } from "@/lib/types";

export default async function ChronologyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (projectError) throw new Error(projectError.message);
  if (!project) notFound();

  const [
    { data: parties, error: partiesError },
    { data: events, error: eventsError },
    { data: documents, error: documentsError },
    { data: changes, error: changesError },
  ] = await Promise.all([
    supabase.from("parties").select("*").eq("project_id", id),
    supabase.from("events").select("*").eq("project_id", id),
    supabase.from("bid_documents").select("*").eq("project_id", id),
    supabase.from("requirement_changes").select("*").eq("project_id", id),
  ]);

  if (partiesError) throw new Error(partiesError.message);
  if (eventsError) throw new Error(eventsError.message);
  if (documentsError) throw new Error(documentsError.message);
  if (changesError) throw new Error(changesError.message);

  const items = buildChronology(
    (events ?? []) as EventRow[],
    (parties ?? []) as Party[],
    (documents ?? []) as BidDocument[],
    (changes ?? []) as RequirementChange[],
  );

  const proj = project as Project;

  return (
    <div className="space-y-6">
      <div>
        <BackButton label={`Back to ${proj.name}`} fallbackHref={`/projects/${id}`} />
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">Chronology</h1>
        <p className="text-sm text-neutral-500">
          Unified timeline of communications, document versions, and requirement changes.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No activity yet — paste a communication or add a bid document to get started.
        </p>
      ) : (
        <ChronologyView items={items} />
      )}
    </div>
  );
}
