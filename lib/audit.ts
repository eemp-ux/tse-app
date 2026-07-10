import type { SupabaseClient } from "@supabase/supabase-js";

export async function writeAudit(
  supabase: SupabaseClient,
  entry: {
    project_id?: string | null;
    action: string;
    target_table?: string | null;
    target_id?: string | null;
    detail?: Record<string, unknown> | null;
  },
) {
  await supabase.from("audit_logs").insert({
    project_id: entry.project_id ?? null,
    action: entry.action,
    target_table: entry.target_table ?? null,
    target_id: entry.target_id ?? null,
    detail: entry.detail ?? null,
  });
}
