import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { summariseDocument } from "@/lib/ai/summarize";
import { getSessionUser, unauthorizedResponse, verifyProjectOwnership } from "@/lib/auth";

export async function POST(request: Request) {
  const supabase = await createClient();
  const user = await getSessionUser(supabase);
  if (!user) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const projectId = typeof body?.project_id === "string" ? body.project_id : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const version = typeof body?.version === "string" && body.version.trim() ? body.version.trim() : "1";
  const receivedDate =
    typeof body?.received_date === "string" && body.received_date ? body.received_date : null;
  const pastedContent = typeof body?.pasted_content === "string" ? body.pasted_content.trim() : "";

  if (!projectId || !title) {
    return NextResponse.json({ error: "project_id and title are required." }, { status: 400 });
  }
  if (!pastedContent) {
    return NextResponse.json({ error: "Document content is required." }, { status: 400 });
  }

  const ownership = await verifyProjectOwnership(supabase, projectId, user.id);
  if (!ownership.ok) return ownership.response;

  // Find the most recent prior version of a document with the same title, if any.
  const { data: priorDoc } = await supabase
    .from("bid_documents")
    .select("*")
    .eq("project_id", projectId)
    .eq("title", title)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let aiSummary: string | null = null;
  let aiConfidence: number | null = null;
  let reviewStatus = "unreviewed";
  let warning: string | undefined;

  try {
    const result = await summariseDocument(pastedContent);
    aiSummary = result.summary;
    aiConfidence = result.confidence;
  } catch (err) {
    warning = "AI summary failed — content saved for manual review.";
    reviewStatus = "unreviewed";
  }

  const { data: document, error } = await supabase
    .from("bid_documents")
    .insert({
      user_id: user.id,
      project_id: projectId,
      title,
      version,
      received_date: receivedDate,
      pasted_content: pastedContent,
      ai_summary: aiSummary,
      ai_summary_source: "ai_extraction",
      ai_summary_confidence: aiConfidence,
      ai_summary_review_status: reviewStatus,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(supabase, {
    user_id: user.id,
    project_id: projectId,
    action: "bid_document.created",
    target_table: "bid_documents",
    target_id: document.id,
    detail: { title, version },
  });

  return NextResponse.json(
    { document, prior_document_id: priorDoc?.id ?? null, warning },
    { status: 201 },
  );
}
