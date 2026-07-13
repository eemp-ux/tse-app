import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getSessionUser(supabase);
  if (!user) return unauthorizedResponse();

  const { data: before, error: beforeError } = await supabase
    .from("projects")
    .select("id, user_id, name")
    .eq("id", id)
    .maybeSingle();

  if (beforeError) return NextResponse.json({ error: beforeError.message }, { status: 500 });
  if (!before) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  if (before.user_id !== user.id) {
    return NextResponse.json({ error: "This project is read-only." }, { status: 403 });
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(supabase, {
    user_id: user.id,
    project_id: id,
    action: "project.deleted",
    target_table: "projects",
    target_id: id,
    detail: { name: before.name },
  });

  return NextResponse.json({ ok: true });
}
