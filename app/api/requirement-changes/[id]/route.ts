import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getSessionUser(supabase);
  if (!user) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const reviewStatus = typeof body?.review_status === "string" ? body.review_status : null;

  if (!reviewStatus) {
    return NextResponse.json({ error: "review_status is required." }, { status: 400 });
  }

  const { data: before, error: beforeError } = await supabase
    .from("requirement_changes")
    .select("id, user_id, project_id")
    .eq("id", id)
    .maybeSingle();

  if (beforeError) return NextResponse.json({ error: beforeError.message }, { status: 500 });
  if (!before) return NextResponse.json({ error: "Requirement change not found." }, { status: 404 });
  if (before.user_id !== user.id) {
    return NextResponse.json({ error: "This change is read-only." }, { status: 403 });
  }

  const { data: change, error } = await supabase
    .from("requirement_changes")
    .update({ review_status: reviewStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(supabase, {
    user_id: user.id,
    project_id: change.project_id,
    action: "requirement_change.reviewed",
    target_table: "requirement_changes",
    target_id: id,
    detail: { review_status: reviewStatus },
  });

  return NextResponse.json({ change });
}
