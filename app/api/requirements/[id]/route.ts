import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

const EDITABLE_FIELDS = [
  "title",
  "description",
  "status",
  "priority",
  "category",
  "extracted_review_status",
] as const;

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

  const { data: before, error: beforeError } = await supabase
    .from("requirements")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (beforeError) return NextResponse.json({ error: beforeError.message }, { status: 500 });
  if (!before) return NextResponse.json({ error: "Requirement not found." }, { status: 404 });
  if (before.user_id !== user.id) {
    return NextResponse.json({ error: "This requirement is read-only." }, { status: 403 });
  }

  const updates: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) updates[field] = body[field];
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No editable fields provided." }, { status: 400 });
  }

  const { data: requirement, error } = await supabase
    .from("requirements")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(supabase, {
    user_id: user.id,
    project_id: requirement.project_id,
    action: "requirement.status_changed",
    target_table: "requirements",
    target_id: id,
    detail: { before, after: updates },
  });

  return NextResponse.json({ requirement });
}
