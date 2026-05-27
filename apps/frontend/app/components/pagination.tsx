import Link from 'next/link';

interface PaginationProps {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
}

/** Page-number pagination rendered as links so it works without client JS. */
export function Pagination({ page, totalPages, makeHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <PageLink href={makeHref(page - 1)} disabled={page <= 1} label="Previous">
        ←
      </PageLink>
      {pages.map((p) => (
        <Link
          key={p}
          href={makeHref(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`tnum flex h-9 min-w-9 items-center justify-center rounded px-2 text-sm transition-colors ${
            p === page
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
              : 'border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-primary-soft)]'
          }`}
        >
          {p}
        </Link>
      ))}
      <PageLink href={makeHref(page + 1)} disabled={page >= totalPages} label="Next">
        →
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled
        className="flex h-9 min-w-9 items-center justify-center rounded border border-[var(--color-border)] px-2 text-sm text-[var(--color-muted)] opacity-40"
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-9 min-w-9 items-center justify-center rounded border border-[var(--color-border)] px-2 text-sm transition-colors hover:bg-[var(--color-primary-soft)]"
    >
      {children}
    </Link>
  );
}
