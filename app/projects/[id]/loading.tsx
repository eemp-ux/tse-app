export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-72 animate-pulse rounded bg-neutral-200" />
      <div className="h-32 animate-pulse rounded-lg border border-neutral-200 bg-neutral-100" />
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg border border-neutral-200 bg-neutral-100" />
        ))}
      </div>
    </div>
  );
}
