import { RequirementRow } from "@/components/RequirementRow";
import type { Requirement, RequirementCategory } from "@/lib/types";

const STATUS_ORDER: Record<string, number> = {
  changed: 0,
  open: 1,
  confirmed: 2,
  withdrawn: 3,
};

function sortByStatus(items: Requirement[]) {
  return [...items].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9),
  );
}

function Group({
  title,
  items,
  isOwner,
}: {
  title: string;
  items: Requirement[];
  isOwner: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
        {title} <span className="text-neutral-300">({items.length})</span>
      </h3>
      <ul className="space-y-2">
        {sortByStatus(items).map((r) => (
          <RequirementRow key={r.id} requirement={r} isOwner={isOwner} />
        ))}
      </ul>
    </div>
  );
}

export function RequirementsList({
  requirements,
  isOwner,
}: {
  requirements: Requirement[];
  isOwner: boolean;
}) {
  if (requirements.length === 0) {
    return <p className="text-sm text-neutral-500">No requirements extracted yet.</p>;
  }

  const byCategory = (category: RequirementCategory) =>
    requirements.filter((r) => r.category === category);

  return (
    <div className="space-y-5">
      <Group title="Commercial" items={byCategory("commercial")} isOwner={isOwner} />
      <Group title="Technical" items={byCategory("technical")} isOwner={isOwner} />
    </div>
  );
}
