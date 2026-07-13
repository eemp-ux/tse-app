import { callClaudeTool } from "@/lib/ai/claude";

export interface ExtractedRequirement {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: "commercial" | "technical";
}

export interface ExtractedEvent {
  event_date: string | null;
  party_name: string | null;
  direction: "inbound" | "outbound" | "internal" | null;
  summary: string;
  requirements: ExtractedRequirement[];
  confidence: number;
}

const SYSTEM_PROMPT = `You extract structured data from pasted business communications (emails, meeting notes, chat messages) for a project prospecting tracker. Read the raw text and identify: the date of the communication if mentioned or inferable, who it's from, the direction (inbound = from customer/vendor to us, outbound = from us to them, internal = internal note), a concise one-to-two sentence summary, and any concrete requirements mentioned (scope items, specs, budget figures, deadlines).

For each requirement's priority, apply these keyword rules: if the text uses words like "mandatory", "must", "critical", "required" for that item, set priority "high". If it uses "preferred", "if possible", "nice to have", set priority "low". Otherwise set priority "medium".

For each requirement's category, classify it as either "commercial" or "technical":
- "commercial": budget, cost, price, payment terms, contract terms, deadlines/schedule, warranties, insurance, or other business/logistics matters.
- "technical": scope of work, specifications, materials, equipment, standards/codes, engineering or design details.

Set confidence between 0 and 1 reflecting how certain you are of the extraction (lower if the text is ambiguous, fragmentary, or lacks a clear date/party).`;

export async function extractEvent(rawText: string): Promise<ExtractedEvent> {
  return callClaudeTool<ExtractedEvent>({
    system: SYSTEM_PROMPT,
    prompt: `Extract structured data from this pasted communication:\n\n"""\n${rawText}\n"""`,
    toolName: "extract_event",
    toolDescription: "Record structured extraction of a pasted communication.",
    inputSchema: {
      type: "object",
      properties: {
        event_date: {
          type: ["string", "null"],
          description: "ISO 8601 date (YYYY-MM-DD) of the communication, or null if not determinable.",
        },
        party_name: {
          type: ["string", "null"],
          description: "Name of the person or organization the communication is from/to, or null.",
        },
        direction: {
          type: ["string", "null"],
          enum: ["inbound", "outbound", "internal", null],
        },
        summary: {
          type: "string",
          description: "Concise one-to-two sentence summary of the communication.",
        },
        requirements: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              priority: { type: "string", enum: ["high", "medium", "low"] },
              category: { type: "string", enum: ["commercial", "technical"] },
            },
            required: ["title", "description", "priority", "category"],
          },
        },
        confidence: {
          type: "number",
          description: "Confidence score between 0 and 1.",
        },
      },
      required: ["summary", "requirements", "confidence"],
    },
  });
}
