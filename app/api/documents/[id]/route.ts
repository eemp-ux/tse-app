import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";

const EDITABLE_FIELDS = ["ai_summary_review_status", "ai_summary"] as const;

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
    .from("bid_documents")
    .select("id, user_id, project_id")
    .eq("id", id)
    .maybeSingle();

  if (beforeError) return NextResponse.json({ error: beforeError.message }, { status: 500 });
  if (!before) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  if (before.user_id !== user.id) {
    return NextResponse.json({ error: "This document is read-only." }, { status: 403 });
  }

  const { data: document, error } = await supabase
    .from("bid_documents")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(supabase, {
    user_id: user.id,
    project_id: document.project_id,
    action: "bid_document.updated",
    target_table: "bid_documents",
    target_id: id,
    detail: updates,
  });

  return NextResponse.json({ document });
}
