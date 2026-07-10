import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const reviewStatus = typeof body?.review_status === "string" ? body.review_status : null;

  if (!reviewStatus) {
    return NextResponse.json({ error: "review_status is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: change, error } = await supabase
    .from("requirement_changes")
    .update({ review_status: reviewStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(supabase, {
    project_id: change.project_id,
    action: "requirement_change.reviewed",
    target_table: "requirement_changes",
    target_id: id,
    detail: { review_status: reviewStatus },
  });

  return NextResponse.json({ change });
}
