export default function Loading() {
  return (
    <div className="w-full max-w-7xl mx-auto animate-pulse space-y-10">
      {/* Hero skeleton */}
      <div className="h-72 rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] border border-[var(--color-border)] p-8 flex flex-col justify-end gap-3">
        <div className="w-24 h-4 rounded-[var(--radius-sm)] bg-[var(--color-border)]"></div>
        <div className="w-3/4 h-8 rounded-[var(--radius-md)] bg-[var(--color-border)]"></div>
        <div className="w-1/2 h-4 rounded-[var(--radius-md)] bg-[var(--color-border)]"></div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
            <div className="h-40 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]"></div>
            <div className="w-20 h-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]"></div>
            <div className="w-5/6 h-5 rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]"></div>
            <div className="w-full h-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]"></div>
            <div className="flex items-center gap-2.5 pt-2 border-t border-[var(--color-border)]">
              <div className="w-6 h-6 rounded-full bg-[var(--color-surface-muted)]"></div>
              <div className="w-24 h-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
