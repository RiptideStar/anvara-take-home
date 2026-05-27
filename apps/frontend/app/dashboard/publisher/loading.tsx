export default function Loading() {
  return (
    <div className="space-y-8">
      <header className="border-b border-[var(--color-border)] pb-6">
        <p className="eyebrow mb-3">Publisher dashboard</p>
        <h1 className="text-3xl sm:text-4xl">My Ad Slots</h1>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
          />
        ))}
      </div>
    </div>
  );
}
