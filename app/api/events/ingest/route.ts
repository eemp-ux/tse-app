import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { extractEvent } from "@/lib/ai/extract";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const projectId = typeof body?.project_id === "string" ? body.project_id : "";
  const mode = body?.mode === "manual" ? "manual" : "ai";
  const eventType = typeof body?.event_type === "string" ? body.event_type : "note";
  const partyId = typeof body?.party_id === "string" && body.party_id ? body.party_id : null;
  const rawContent = typeof body?.raw_content === "string" ? body.raw_content.trim() : "";

  if (!projectId) {
    return NextResponse.json({ error: "project_id is required." }, { status: 400 });
  }
  if (!rawContent) {
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }

  const supabase = await createClient();

  if (mode === "manual") {
    const direction =
      typeof body?.direction === "string" && body.direction ? body.direction : null;
    const eventDate =
      typeof body?.event_date === "string" && body.event_date
        ? body.event_date
        : new Date().toISOString();

    const { data: event, error } = await supabase
      .from("events")
      .insert({
        project_id: projectId,
        party_id: partyId,
        event_type: eventType,
        direction,
        event_date: eventDate,
        raw_content: rawContent,
        summary: null,
        summary_source: "manual",
        summary_confidence: null,
        summary_review_status: null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await writeAudit(supabase, {
      project_id: projectId,
      action: "event.created",
      target_table: "events",
      target_id: event.id,
      detail: { mode: "manual", event_type: eventType },
    });

    return NextResponse.json({ event, requirements: [] }, { status: 201 });
  }

  // AI mode
  try {
    const extracted = await extractEvent(rawContent);

    const { data: event, error } = await supabase
      .from("events")
      .insert({
        project_id: projectId,
        party_id: partyId,
        event_type: eventType,
        direction: extracted.direction || null,
        event_date: extracted.event_date?.trim() ? extracted.event_date : new Date().toISOString(),
        raw_content: rawContent,
        summary: extracted.summary,
        summary_source: "ai_extraction",
        summary_confidence: extracted.confidence,
        summary_review_status: "unreviewed",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    let requirements: unknown[] = [];
    if (extracted.requirements.length > 0) {
      const { data: reqRows, error: reqError } = await supabase
        .from("requirements")
        .insert(
          extracted.requirements.map((r) => ({
            project_id: projectId,
            source_event_id: event.id,
            title: r.title,
            description: r.description,
            status: "open",
            priority: r.priority,
            extracted_value: r.title,
            extracted_source: "ai_extraction",
            extracted_confidence: extracted.confidence,
            extracted_review_status: "unreviewed",
          })),
        )
        .select();

      if (reqError) return NextResponse.json({ error: reqError.message }, { status: 500 });
      requirements = reqRows ?? [];
    }

    await writeAudit(supabase, {
      project_id: projectId,
      action: "event.created",
      target_table: "events",
      target_id: event.id,
      detail: { mode: "ai", confidence: extracted.confidence, requirement_count: requirements.length },
    });

    return NextResponse.json({ event, requirements }, { status: 201 });
  } catch (aiError) {
    // AI extraction failed — fall back to saving raw content for manual review.
    const { data: event, error } = await supabase
      .from("events")
      .insert({
        project_id: projectId,
        party_id: partyId,
        event_type: eventType,
        direction: null,
        event_date: new Date().toISOString(),
        raw_content: rawContent,
        summary: null,
        summary_source: "ai_extraction",
        summary_confidence: null,
        summary_review_status: "unreviewed",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await writeAudit(supabase, {
      project_id: projectId,
      action: "event.created",
      target_table: "events",
      target_id: event.id,
      detail: {
        mode: "ai",
        ai_error: aiError instanceof Error ? aiError.message : "unknown error",
      },
    });

    return NextResponse.json(
      {
        event,
        requirements: [],
        warning: "AI extraction failed — content saved for manual review.",
      },
      { status: 201 },
    );
  }
}
