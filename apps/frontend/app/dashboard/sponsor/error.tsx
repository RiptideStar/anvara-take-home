'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/utils';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    logger.error('Sponsor dashboard failed to load:', error);
  }, [error]);

  return (
    <div className="space-y-6">
      <header className="border-b border-[var(--color-border)] pb-6">
        <p className="eyebrow mb-3">Sponsor dashboard</p>
        <h1 className="text-3xl sm:text-4xl">My Campaigns</h1>
      </header>
      <div className="flex flex-col items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-error-soft)] px-6 py-16 text-center">
        <h3 className="text-xl">We couldn&apos;t load your campaigns</h3>
        <p className="mb-6 mt-1 max-w-sm text-sm text-[var(--color-muted)]">
          Something went wrong reaching the server. Please try again in a moment.
        </p>
        <button
          onClick={reset}
          className="rounded bg-[var(--color-primary)] px-5 py-2.5 text-sm text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
