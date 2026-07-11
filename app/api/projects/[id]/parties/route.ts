import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { getSessionUser, unauthorizedResponse, verifyProjectOwnership } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const user = await getSessionUser(supabase);
  if (!user) return unauthorizedResponse();

  const ownership = await verifyProjectOwnership(supabase, projectId, user.id);
  if (!ownership.ok) return ownership.response;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const role = typeof body?.role === "string" ? body.role : "customer";
  const organization =
    typeof body?.organization === "string" ? body.organization.trim() : null;
  const email = typeof body?.email === "string" ? body.email.trim() : null;

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const { data: party, error } = await supabase
    .from("parties")
    .insert({
      user_id: user.id,
      project_id: projectId,
      name,
      role,
      organization: organization || null,
      email: email || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAudit(supabase, {
    user_id: user.id,
    project_id: projectId,
    action: "party.created",
    target_table: "parties",
    target_id: party.id,
    detail: { name, role },
  });

  return NextResponse.json({ party }, { status: 201 });
}
