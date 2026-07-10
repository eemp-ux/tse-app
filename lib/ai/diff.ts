import { callClaudeTool } from "@/lib/ai/claude";

export interface DetectedChange {
  change_type: "added" | "modified" | "removed";
  previous_value: string | null;
  new_value: string | null;
  matched_requirement_index: number | null;
}

interface DiffResult {
  changes: DetectedChange[];
}

const SYSTEM_PROMPT = `You compare two versions of a bid document / spec / RFQ for a project prospecting tracker and identify concrete requirement-level changes between them: items that were added, modified (changed wording, scope, dates, or figures), or removed.

You will also be given a numbered list of the project's currently tracked requirements. For each detected change, if it clearly corresponds to one of those tracked requirements, set matched_requirement_index to that requirement's number (0-indexed). Otherwise set it to null.

Only report substantive changes — ignore formatting, whitespace, or purely cosmetic differences. Rank added/removed changes above modified changes in the order you return them.`;

export async function diffDocuments(
  oldContent: string,
  newContent: string,
  existingRequirements: { title: string; description: string | null }[],
): Promise<DetectedChange[]> {
  const reqList = existingRequirements
    .map((r, i) => `${i}. ${r.title}${r.description ? ` — ${r.description}` : ""}`)
    .join("\n");

  const result = await callClaudeTool<DiffResult>({
    system: SYSTEM_PROMPT,
    prompt: `Previous version:\n"""\n${oldContent}\n"""\n\nNew version:\n"""\n${newContent}\n"""\n\nCurrently tracked requirements:\n${reqList || "(none)"}`,
    toolName: "diff_documents",
    toolDescription: "Record the requirement-level changes between two document versions.",
    inputSchema: {
      type: "object",
      properties: {
        changes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              change_type: { type: "string", enum: ["added", "modified", "removed"] },
              previous_value: { type: ["string", "null"] },
              new_value: { type: ["string", "null"] },
              matched_requirement_index: { type: ["integer", "null"] },
            },
            required: ["change_type", "previous_value", "new_value", "matched_requirement_index"],
          },
        },
      },
      required: ["changes"],
    },
  });

  return result.changes;
}
