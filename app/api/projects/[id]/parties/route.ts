import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const role = typeof body?.role === "string" ? body.role : "customer";
  const organization =
    typeof body?.organization === "string" ? body.organization.trim() : null;
  const email = typeof body?.email === "string" ? body.email.trim() : null;

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: party, error } = await supabase
    .from("parties")
    .insert({
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
    project_id: projectId,
    action: "party.created",
    target_table: "parties",
    target_id: party.id,
    detail: { name, role },
  });

  return NextResponse.json({ party }, { status: 201 });
}
