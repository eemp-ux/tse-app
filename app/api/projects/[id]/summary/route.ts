import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { generateChronologySummary } from "@/lib/ai/summary";
import { getSessionUser, unauthorizedResponse, verifyProjectOwnership } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const user = await getSessionUser(supabase);
  if (!user) return unauthorizedResponse();

  const ownership = await verifyProjectOwnership(supabase, projectId, user.id);
  if (!ownership.ok) return ownership.response;

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) return NextResponse.json({ error: projectError.message }, { status: 500 });
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const [{ data: events }, { data: documents }, { data: changes }, { data: requirements }] =
    await Promise.all([
      supabase
        .from("events")
        .select("event_date, event_type, summary, raw_content")
        .eq("project_id", projectId)
        .order("event_date"),
      supabase
        .from("bid_documents")
        .select("created_at, title, version, ai_summary")
        .eq("project_id", projectId)
        .order("created_at"),
      supabase
        .from("requirement_changes")
        .select("created_at, change_type, previous_value, new_value")
        .eq("project_id", projectId)
        .order("created_at"),
      supabase
        .from("requirements")
        .select("title, status")
        .eq("project_id", projectId)
        .in("status", ["open", "changed"]),
    ]);

  type Line = { date: string; text: string };
  const lines: Line[] = [];

  for (const e of events ?? []) {
    lines.push({ date: e.event_date, text: `Event (${e.event_type}): ${e.summary ?? e.raw_content ?? ""}` });
  }
  for (const d of documents ?? []) {
    lines.push({
      date: d.created_at,
      text: `Bid document "${d.title}" v${d.version} added: ${d.ai_summary ?? "(no summary)"}`,
    });
  }
  for (const c of changes ?? []) {
    lines.push({
      date: c.created_at,
      text: `Requirement change (${c.change_type}): ${c.previous_value ?? ""} ${c.new_value ? "→ " + c.new_value : ""}`.trim(),
    });
  }

  lines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const openItems = (requirements ?? []).map((r) => `- ${r.title} (${r.status})`).join("\n");
  const timelineText =
    lines.map((l) => l.text).join("\n") + (openItems ? `\n\nOpen items:\n${openItems}` : "");

  if (!timelineText.trim()) {
    return NextResponse.json(
      { error: "Nothing to summarise yet — add events or documents first." },
      { status: 400 },
    );
  }

  try {
    const result = await generateChronologySummary({
      projectName: project.name,
      customerName: project.customer_name,
      timelineText,
    });

    const { data: summary, error } = await supabase
      .from("project_summaries")
      .insert({
        user_id: user.id,
        project_id: projectId,
        summary: result.summary,
        review_status: "unreviewed",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await writeAudit(supabase, {
      user_id: user.id,
      project_id: projectId,
      action: "project_summary.generated",
      target_table: "project_summaries",
      target_id: summary.id,
      detail: {},
    });

    return NextResponse.json({ summary }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate summary." },
      { status: 502 },
    );
  }
}
