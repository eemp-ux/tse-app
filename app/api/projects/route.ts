import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

export async function POST(request: Request) {
  const supabase = await createClient();
  const user = await getSessionUser(supabase);
  if (!user) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const customerName =
    typeof body?.customer_name === "string" ? body.customer_name.trim() : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : null;

  if (!name || !customerName) {
    return NextResponse.json(
      { error: "Project name and customer name are required." },
      { status: 400 },
    );
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name,
      customer_name: customerName,
      description: description || null,
      status: "prospecting",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAudit(supabase, {
    user_id: user.id,
    project_id: project.id,
    action: "project.created",
    target_table: "projects",
    target_id: project.id,
    detail: { name, customer_name: customerName },
  });

  return NextResponse.json({ project }, { status: 201 });
}
