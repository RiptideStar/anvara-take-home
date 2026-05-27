'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const TYPES = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'];

export function MarketplaceControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Build a new query string from the current params, always resetting page.
  function pushParams(mutate: (p: URLSearchParams) => void) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    mutate(params);
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  // Debounce the free-text search so we don't navigate on every keystroke.
  useEffect(() => {
    return () => clearTimeout(debounce.current);
  }, []);

  function onSearch(value: string) {
    setQ(value);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      pushParams((p) => (value ? p.set('q', value) : p.delete('q')));
    }, 300);
  }

  const type = searchParams.get('type') ?? '';
  const available = searchParams.get('available') ?? '';

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="search"
        value={q}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search slots or publishers…"
        className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm sm:max-w-xs"
      />
      <select
        value={type}
        onChange={(e) => pushParams((p) => (e.target.value ? p.set('type', e.target.value) : p.delete('type')))}
        className="rounded border border-[var(--color-border)] px-3 py-2 text-sm"
        aria-label="Filter by type"
      >
        <option value="">All types</option>
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        value={available}
        onChange={(e) =>
          pushParams((p) => (e.target.value ? p.set('available', e.target.value) : p.delete('available')))
        }
        className="rounded border border-[var(--color-border)] px-3 py-2 text-sm"
        aria-label="Filter by availability"
      >
        <option value="">All slots</option>
        <option value="true">Available only</option>
      </select>
    </div>
  );
}
