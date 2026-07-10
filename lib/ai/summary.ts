import { callClaudeTool } from "@/lib/ai/claude";

export interface GeneratedSummary {
  summary: string;
}

export async function generateChronologySummary(input: {
  projectName: string;
  customerName: string;
  timelineText: string;
}): Promise<GeneratedSummary> {
  return callClaudeTool<GeneratedSummary>({
    system:
      "You write concise project status summaries for a project prospecting tracker, aimed at a builder/estimator preparing for their next customer or vendor conversation. Cover: what has happened so far, what has changed (scope, budget, dates), and what open items remain. 3-6 sentences, plain prose, no headers or bullet lists.",
    prompt: `Project: ${input.projectName} (customer: ${input.customerName})\n\nChronology (events, document versions, and requirement changes, oldest to newest):\n"""\n${input.timelineText}\n"""\n\nWrite the project summary.`,
    toolName: "generate_chronology_summary",
    toolDescription: "Record the drafted project chronology summary.",
    inputSchema: {
      type: "object",
      properties: {
        summary: { type: "string", description: "3-6 sentence project summary." },
      },
      required: ["summary"],
    },
  });
}
