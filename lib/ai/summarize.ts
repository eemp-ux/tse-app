import { callClaudeTool } from "@/lib/ai/claude";

export interface DocumentSummary {
  summary: string;
  confidence: number;
}

export async function summariseDocument(pastedContent: string): Promise<DocumentSummary> {
  return callClaudeTool<DocumentSummary>({
    system:
      "You summarise pasted bid documents, RFQs, and spec sheets for a project prospecting tracker. Produce a concise summary (2-4 sentences) covering scope, key requirements, budget, and deadlines mentioned in the text.",
    prompt: `Summarise this bid document text:\n\n"""\n${pastedContent}\n"""`,
    toolName: "summarise_document",
    toolDescription: "Record a summary of a pasted bid document.",
    inputSchema: {
      type: "object",
      properties: {
        summary: { type: "string", description: "Concise summary of the document." },
        confidence: { type: "number", description: "Confidence score between 0 and 1." },
      },
      required: ["summary", "confidence"],
    },
  });
}
