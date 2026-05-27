interface Stat {
  label: string;
  value: string;
}

const COLS: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
};

/** Hairline-divided KPI cards (gap-px over a border-colored background). */
export function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <dl
      className={`grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-border)] ${
        COLS[stats.length] ?? 'sm:grid-cols-4'
      }`}
    >
      {stats.map((s) => (
        <div key={s.label} className="bg-[var(--color-surface)] p-4">
          <dt className="eyebrow">{s.label}</dt>
          <dd className="font-display tnum mt-1.5 text-2xl text-[var(--color-foreground)]">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
