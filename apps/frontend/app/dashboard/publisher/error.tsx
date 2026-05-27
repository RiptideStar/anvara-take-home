'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/utils';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    logger.error('Publisher dashboard failed to load:', error);
  }, [error]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Ad Slots</h1>
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="mb-4 text-red-600">We couldn&apos;t load your ad slots. Please try again.</p>
        <button
          onClick={reset}
          className="rounded bg-[--color-primary] px-4 py-2 text-sm text-white hover:bg-[--color-primary-hover]"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
