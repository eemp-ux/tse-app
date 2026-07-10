import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { diffDocuments } from "@/lib/ai/diff";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const projectId = typeof body?.project_id === "string" ? body.project_id : "";
  const oldDocumentId = typeof body?.old_document_id === "string" ? body.old_document_id : "";
  const newDocumentId = typeof body?.new_document_id === "string" ? body.new_document_id : "";

  if (!projectId || !oldDocumentId || !newDocumentId) {
    return NextResponse.json(
      { error: "project_id, old_document_id, and new_document_id are required." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const [{ data: oldDoc }, { data: newDoc }, { data: requirements }] = await Promise.all([
    supabase.from("bid_documents").select("*").eq("id", oldDocumentId).maybeSingle(),
    supabase.from("bid_documents").select("*").eq("id", newDocumentId).maybeSingle(),
    supabase
      .from("requirements")
      .select("id, title, description")
      .eq("project_id", projectId)
      .neq("status", "withdrawn"),
  ]);

  if (!oldDoc || !newDoc) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const reqList = requirements ?? [];

  try {
    const changes = await diffDocuments(
      oldDoc.pasted_content ?? "",
      newDoc.pasted_content ?? "",
      reqList,
    );

    const createdChanges = [];

    for (const change of changes) {
      let requirementId: string | null = null;

      const matched =
        change.matched_requirement_index !== null &&
        reqList[change.matched_requirement_index]
          ? reqList[change.matched_requirement_index]
          : null;

      if (matched) {
        requirementId = matched.id;
        const newStatus = change.change_type === "removed" ? "withdrawn" : "changed";
        await supabase.from("requirements").update({ status: newStatus }).eq("id", matched.id);
      } else if (change.change_type === "added" && change.new_value) {
        const { data: newReq } = await supabase
          .from("requirements")
          .insert({
            project_id: projectId,
            title: change.new_value.slice(0, 120),
            description: change.new_value,
            status: "open",
            priority: "medium",
            extracted_value: change.new_value,
            extracted_source: "ai_extraction",
            extracted_confidence: null,
            extracted_review_status: "unreviewed",
          })
          .select()
          .single();
        requirementId = newReq?.id ?? null;
      }

      const { data: changeRow, error: changeError } = await supabase
        .from("requirement_changes")
        .insert({
          project_id: projectId,
          requirement_id: requirementId,
          bid_document_id: newDocumentId,
          change_type: change.change_type,
          previous_value: change.previous_value,
          new_value: change.new_value,
          detected_by: "ai",
          review_status: "unreviewed",
        })
        .select()
        .single();

      if (changeError) return NextResponse.json({ error: changeError.message }, { status: 500 });
      createdChanges.push(changeRow);
    }

    await writeAudit(supabase, {
      project_id: projectId,
      action: "requirement_changes.detected",
      target_table: "requirement_changes",
      target_id: newDocumentId,
      detail: { old_document_id: oldDocumentId, new_document_id: newDocumentId, count: createdChanges.length },
    });

    return NextResponse.json({ changes: createdChanges }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Change detection failed." },
      { status: 502 },
    );
  }
}
