import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

const EDITABLE_FIELDS = ["summary", "review_status"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getSessionUser(supabase);
  if (!user) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const updates: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) updates[field] = body[field];
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No editable fields provided." }, { status: 400 });
  }

  const { data: before, error: beforeError } = await supabase
    .from("project_summaries")
    .select("id, user_id, project_id")
    .eq("id", id)
    .maybeSingle();

  if (beforeError) return NextResponse.json({ error: beforeError.message }, { status: 500 });
  if (!before) return NextResponse.json({ error: "Summary not found." }, { status: 404 });
  if (before.user_id !== user.id) {
    return NextResponse.json({ error: "This summary is read-only." }, { status: 403 });
  }

  const { data: summary, error } = await supabase
    .from("project_summaries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(supabase, {
    user_id: user.id,
    project_id: summary.project_id,
    action: "project_summary.reviewed",
    target_table: "project_summaries",
    target_id: id,
    detail: updates,
  });

  return NextResponse.json({ summary });
}
