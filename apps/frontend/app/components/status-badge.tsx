const DOT_COLOR: Record<string, string> = {
  ACTIVE: 'var(--color-success)',
  APPROVED: 'var(--color-success)',
  DRAFT: 'var(--color-muted)',
  PAUSED: 'var(--color-warning)',
  PENDING_REVIEW: 'var(--color-warning)',
  COMPLETED: 'var(--color-secondary)',
  CANCELLED: 'var(--color-error)',
};

/** Editorial status label: a small colored dot + uppercase letterspaced text. */
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="eyebrow inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: DOT_COLOR[status] ?? 'var(--color-muted)' }}
      />
      {status.replace(/_/g, ' ')}
    </span>
  );
}
