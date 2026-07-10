import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";

const EDITABLE_FIELDS = [
  "event_type",
  "direction",
  "event_date",
  "raw_content",
  "summary",
  "summary_review_status",
  "party_id",
] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const supabase = await createClient();

  const { data: before, error: beforeError } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (beforeError) return NextResponse.json({ error: beforeError.message }, { status: 500 });
  if (!before) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const updates: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) updates[field] = body[field];
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No editable fields provided." }, { status: 400 });
  }
  if ("summary" in updates && updates.summary !== before.summary) {
    updates.summary_source = "manual";
    updates.summary_review_status = "overridden";
  }

  const { data: event, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(supabase, {
    project_id: event.project_id,
    action: "event.updated",
    target_table: "events",
    target_id: id,
    detail: { before, after: updates },
  });

  return NextResponse.json({ event });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: before, error: beforeError } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (beforeError) return NextResponse.json({ error: beforeError.message }, { status: 500 });
  if (!before) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(supabase, {
    project_id: before.project_id,
    action: "event.deleted",
    target_table: "events",
    target_id: id,
    detail: { before },
  });

  return NextResponse.json({ ok: true });
}
