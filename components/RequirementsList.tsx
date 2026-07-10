import { RequirementRow } from "@/components/RequirementRow";
import type { Requirement } from "@/lib/types";

const STATUS_ORDER: Record<string, number> = {
  changed: 0,
  open: 1,
  confirmed: 2,
  withdrawn: 3,
};

export function RequirementsList({ requirements }: { requirements: Requirement[] }) {
  if (requirements.length === 0) {
    return <p className="text-sm text-neutral-500">No requirements extracted yet.</p>;
  }

  const sorted = [...requirements].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9),
  );

  return (
    <ul className="space-y-2">
      {sorted.map((r) => (
        <RequirementRow key={r.id} requirement={r} />
      ))}
    </ul>
  );
}
